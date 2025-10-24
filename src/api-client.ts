import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { Patient, PaginatedResponse, SubmissionData, SubmissionResult } from './types';

/**
 * Healthcare API Client with retry logic and error handling
 * Handles authentication, rate limiting, and intermittent failures
 */
export class HealthcareAPIClient {
  private readonly client: AxiosInstance;
  private readonly maxRetries: number = 3;
  private readonly baseDelay: number = 1000; // 1 second

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string
  ) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Request successful: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ API Request failed: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate exponential backoff delay, considering retry_after header
   */
  private calculateDelay(attempt: number, error?: AxiosError): number {
    // Check if the error has a retry_after header (for 429 errors)
    if (error?.response?.status === 429) {
      const retryAfter = (error.response.data as any)?.retry_after || error.response.headers?.['retry-after'];
      if (retryAfter) {
        const retryAfterMs = parseInt(retryAfter.toString()) * 1000;
        console.log(`   API suggested retry after ${retryAfter}s, using ${retryAfterMs}ms`);
        return retryAfterMs + Math.random() * 1000; // Add small jitter
      }
    }

    // Default exponential backoff
    return this.baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: AxiosError): boolean {
    if (!error.response) {
      // Network errors are retryable
      return true;
    }

    const status = error.response.status;
    
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429;
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    operationName: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await requestFn();
        return response.data;
      } catch (error) {
        lastError = error as Error;
        const axiosError = error as AxiosError;

        // Don't retry on final attempt
        if (attempt === this.maxRetries) {
          break;
        }

        // Don't retry if error is not retryable
        if (axiosError.response && !this.isRetryableError(axiosError)) {
          console.error(`❌ Non-retryable error for ${operationName}:`, axiosError.message);
          throw error;
        }

        const delay = this.calculateDelay(attempt, axiosError);
        console.warn(`⚠️ ${operationName} failed (attempt ${attempt + 1}/${this.maxRetries + 1}), retrying in ${delay}ms...`);
        
        await this.sleep(delay);
      }
    }

    console.error(`❌ ${operationName} failed after ${this.maxRetries + 1} attempts`);
    throw lastError!;
  }

  /**
   * Fetch a single page of patients
   */
  async fetchPatientsPage(page: number = 1, limit: number = 5): Promise<PaginatedResponse<Patient>> {
    const operationName = `Fetch patients page ${page}`;
    
    return this.executeWithRetry(
      () => this.client.get<PaginatedResponse<Patient>>('/patients', {
        params: { page: page.toString(), limit: limit.toString() }
      }),
      operationName
    );
  }

  /**
   * Fetch all patients by paginating through all pages
   */
  async fetchAllPatients(): Promise<Patient[]> {
    console.log('🚀 Starting to fetch all patients...');
    
    const allPatients: Patient[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await this.fetchPatientsPage(page, 5);
        
        // Extract patients from the response
        const patients = response.data || [];

        if (patients.length === 0) {
          console.log(`📄 No patients found on page ${page}, stopping pagination`);
          break;
        }

        allPatients.push(...patients);
        console.log(`📄 Fetched page ${page}: ${patients.length} patients (total: ${allPatients.length})`);

        // Check if there are more pages using pagination info
        hasMore = response.pagination?.hasNext || false;
        page++;

        // Safety limit to prevent infinite loops
        if (page > 20) {
          console.warn('⚠️ Reached maximum page limit (20), stopping pagination');
          break;
        }

        // Add small delay between requests to avoid rate limiting
        await this.sleep(200);

      } catch (error) {
        console.error(`❌ Failed to fetch page ${page}:`, error);
        throw error;
      }
    }

    console.log(`✅ Successfully fetched all ${allPatients.length} patients from ${page - 1} pages`);
    return allPatients;
  }

  /**
   * Submit assessment results
   */
  async submitAssessment(data: SubmissionData): Promise<SubmissionResult> {
    console.log('📤 Submitting assessment results...');
    console.log(`   - High-risk patients: ${data.high_risk_patients.length}`);
    console.log(`   - Fever patients: ${data.fever_patients.length}`);
    console.log(`   - Data quality issues: ${data.data_quality_issues.length}`);

    const operationName = 'Submit assessment';
    
    try {
      const result = await this.executeWithRetry(
        () => this.client.post<SubmissionResult>('/submit-assessment', data),
        operationName
      );

      console.log('✅ Assessment submitted successfully!');
      return result;
    } catch (error) {
      console.error('❌ Failed to submit assessment:', error);
      throw error;
    }
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.fetchPatientsPage(1, 1);
      console.log('✅ API connection test successful');
      return true;
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return false;
    }
  }
}