import { HealthcareAPIClient } from './api-client';
import { RiskCalculator } from './risk-calculator';
import { DataProcessor } from './data-processor';
import { Patient, ProcessedPatient, SubmissionData } from './types';

/**
 * Healthcare API Assessment - Main Application
 * 
 * This application orchestrates the entire patient risk assessment process:
 * 1. Fetches patient data from the Healthcare API
 * 2. Processes and validates patient information
 * 3. Calculates risk scores based on blood pressure, temperature, and age
 * 4. Generates alert lists for high-risk patients, fever cases, and data quality issues
 * 5. Submits results to the assessment API
 */

class HealthcareAssessmentApp {
  private readonly apiClient: HealthcareAPIClient;
  private readonly riskCalculator: RiskCalculator;
  private readonly dataProcessor: DataProcessor;

  constructor(apiKey: string, baseUrl: string) {
    this.apiClient = new HealthcareAPIClient(apiKey, baseUrl);
    this.riskCalculator = new RiskCalculator();
    this.dataProcessor = new DataProcessor();
  }

  /**
   * Main application workflow
   */
  async run(): Promise<void> {
    console.log('🏥 Healthcare API Assessment - Starting...');
    console.log('='.repeat(50));

    try {
      // Test API connectivity
      console.log('🔍 Testing API connectivity...');
      const isConnected = await this.apiClient.testConnection();
      if (!isConnected) {
        throw new Error('Failed to connect to API');
      }

      // Fetch all patient data
      console.log('\n📥 Fetching patient data...');
      const patients = await this.apiClient.fetchAllPatients();
      console.log(`✅ Retrieved ${patients.length} patients`);

      // Process patient data
      console.log('\n⚙️ Processing patient data...');
      const processedPatients = this.dataProcessor.processPatients(patients);
      
      // Display processing statistics
      const stats = this.dataProcessor.getProcessingStats(processedPatients);
      console.log(`📊 Processing Statistics:`);
      console.log(`   Total patients: ${stats.total}`);
      console.log(`   Valid age data: ${stats.validAge}`);
      console.log(`   Valid blood pressure data: ${stats.validBP}`);
      console.log(`   Valid temperature data: ${stats.validTemp}`);
      console.log(`   Fully valid patients: ${stats.fullyValid}`);
      console.log(`   Patients with data quality issues: ${stats.dataQualityIssues}`);

      // Calculate risk scores and generate alerts
      console.log('\n🧮 Calculating risk scores and generating alerts...');
      const alerts = this.generateAlerts(processedPatients);

      // Display alert summary
      console.log(`📋 Alert Summary:`);
      console.log(`   High-risk patients: ${alerts.high_risk_patients.length}`);
      console.log(`   Fever patients: ${alerts.fever_patients.length}`);
      console.log(`   Data quality issues: ${alerts.data_quality_issues.length}`);

      // Show detailed breakdown
      this.displayDetailedResults(processedPatients, alerts);

      // Submit assessment
      console.log('\n📤 Submitting assessment...');
      const result = await this.apiClient.submitAssessment(alerts);
      
      if (result) {
        console.log('✅ Assessment submitted successfully!');
        if (result.score !== undefined) {
          console.log(`📊 Score: ${result.score}`);
        }
        if (result.feedback) {
          console.log(`💬 Feedback: ${result.feedback}`);
        }
        if (result.attempts_remaining !== undefined) {
          console.log(`🔄 Attempts remaining: ${result.attempts_remaining}`);
        }
      }

      console.log('\n🎉 Assessment completed successfully!');

    } catch (error) {
      console.error('\n❌ Assessment failed:', error);
      process.exit(1);
    }
  }

  /**
   * Generate alert lists based on criteria
   */
  private generateAlerts(processedPatients: ProcessedPatient[]): SubmissionData {
    const highRiskPatients: string[] = [];
    const feverPatients: string[] = [];
    const dataQualityIssues: string[] = [];

    for (const patient of processedPatients) {
      // Calculate total risk score
      const totalRisk = this.riskCalculator.calculateTotalRisk(patient);
      
      // High-risk patients (total risk score ≥ 4)
      if (totalRisk >= 4) {
        highRiskPatients.push(patient.id);
      }

      // Fever patients (temperature ≥ 99.6°F)
      if (this.riskCalculator.hasFever(patient)) {
        feverPatients.push(patient.id);
      }

      // Data quality issues (any invalid/missing data)
      if (this.dataProcessor.hasDataQualityIssues(patient)) {
        dataQualityIssues.push(patient.id);
      }
    }

    return {
      high_risk_patients: highRiskPatients,
      fever_patients: feverPatients,
      data_quality_issues: dataQualityIssues
    };
  }

  /**
   * Display detailed results for debugging and verification
   */
  private displayDetailedResults(processedPatients: ProcessedPatient[], alerts: SubmissionData): void {
    console.log('\n📄 Detailed Results:');
    console.log('-'.repeat(40));

    // Show high-risk patients
    if (alerts.high_risk_patients.length > 0) {
      console.log(`\n🚨 High-Risk Patients (${alerts.high_risk_patients.length}):`);
      alerts.high_risk_patients.forEach(patientId => {
        const patient = processedPatients.find(p => p.id === patientId);
        if (patient) {
          const scores = this.riskCalculator.getDetailedRiskScores(patient);
          console.log(`   ${patientId}: Total Risk = ${scores.total} (BP:${scores.blood_pressure}, Temp:${scores.temperature}, Age:${scores.age})`);
        }
      });
    }

    // Show fever patients
    if (alerts.fever_patients.length > 0) {
      console.log(`\n🌡️ Fever Patients (${alerts.fever_patients.length}):`);
      alerts.fever_patients.forEach(patientId => {
        const patient = processedPatients.find(p => p.id === patientId);
        if (patient && patient.temperature_data.valid) {
          console.log(`   ${patientId}: Temperature = ${patient.temperature_data.value}°F`);
        }
      });
    }

    // Show data quality issues
    if (alerts.data_quality_issues.length > 0) {
      console.log(`\n⚠️ Data Quality Issues (${alerts.data_quality_issues.length}):`);
      alerts.data_quality_issues.forEach(patientId => {
        const patient = processedPatients.find(p => p.id === patientId);
        if (patient) {
          const issues = this.dataProcessor.getDataQualityIssues(patient);
          console.log(`   ${patientId}: ${issues.join(', ')}`);
        }
      });
    }

    // Show sample of fully processed patients for verification
    console.log(`\n📋 Sample Processed Patients (first 5):`);
    processedPatients.slice(0, 5).forEach(patient => {
      const scores = this.riskCalculator.getDetailedRiskScores(patient);
      const bpText = patient.blood_pressure_data.valid 
        ? `${patient.blood_pressure_data.systolic}/${patient.blood_pressure_data.diastolic}` 
        : 'invalid';
      const tempText = patient.temperature_data.valid 
        ? `${patient.temperature_data.value}°F` 
        : 'invalid';
      const ageText = patient.age_data.valid 
        ? `${patient.age_data.value}y` 
        : 'invalid';
      
      console.log(`   ${patient.id}: Risk=${scores.total} | BP:${bpText} | Temp:${tempText} | Age:${ageText}`);
    });
  }
}

/**
 * Application entry point
 */
async function main(): Promise<void> {
  // Configuration from assessment requirements
  const API_KEY = 'ak_46987d0d0f971d39604352debce7070ec5967eb1a004ac94';
  const BASE_URL = 'https://assessment.ksensetech.com/api';

  // Create and run the application
  const app = new HealthcareAssessmentApp(API_KEY, BASE_URL);
  await app.run();
}

// Run the application
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Application error:', error);
    process.exit(1);
  });
}

export { HealthcareAssessmentApp };