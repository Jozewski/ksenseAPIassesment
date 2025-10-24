import { Patient, ProcessedPatient, BloodPressureReading } from './types';

/**
 * Data Processor for Healthcare Assessment
 * Handles inconsistent data formats and validates patient information
 */
export class DataProcessor {

  /**
   * Process and validate a patient's data
   */
  processPatient(patient: Patient): ProcessedPatient {
    return {
      id: patient.patient_id, // Map patient_id to id for internal use
      age_data: this.processAge(patient.age),
      blood_pressure_data: this.processBloodPressure(patient.blood_pressure),
      temperature_data: this.processTemperature(patient.temperature)
    };
  }

  /**
   * Process age data with validation
   */
  private processAge(age: any): { valid: boolean; value?: number; original?: any } {
    const result = { valid: false, original: age };

    // Handle null, undefined, or empty values
    if (age === null || age === undefined || age === '') {
      return result;
    }

    // Handle numeric values
    if (typeof age === 'number') {
      if (!isNaN(age) && age > 0 && age < 150) {
        return { valid: true, value: age, original: age };
      }
      return result;
    }

    // Handle string values
    if (typeof age === 'string') {
      const trimmedAge = age.trim();
      
      // Check for non-numeric strings
      if (!/^\d+(\.\d+)?$/.test(trimmedAge)) {
        return result;
      }

      const numericAge = parseFloat(trimmedAge);
      
      if (!isNaN(numericAge) && numericAge > 0 && numericAge < 150) {
        return { valid: true, value: Math.round(numericAge), original: age };
      }
    }

    return result;
  }

  /**
   * Process blood pressure data with validation
   * Handles formats like "120/80", "150/", "/90", "INVALID", etc.
   */
  private processBloodPressure(bp: any): { valid: boolean; systolic?: number; diastolic?: number; original?: any } {
    const result = { valid: false, original: bp };

    // Handle null, undefined, or empty values
    if (bp === null || bp === undefined || bp === '') {
      return result;
    }

    // Handle string values (most common format)
    if (typeof bp === 'string') {
      const trimmedBp = bp.trim();
      
      // Check for obvious invalid strings
      if (trimmedBp.toLowerCase().includes('invalid') || 
          trimmedBp.toLowerCase().includes('n/a') ||
          trimmedBp.toLowerCase().includes('error')) {
        return result;
      }

      // Handle "systolic/diastolic" format
      if (trimmedBp.includes('/')) {
        const parts = trimmedBp.split('/');
        
        if (parts.length === 2) {
          const systolicStr = parts[0]?.trim();
          const diastolicStr = parts[1]?.trim();
          
          // Check for missing values like "150/" or "/90"
          if (!systolicStr || !diastolicStr) {
            return result;
          }

          const systolic = this.parseNumericValue(systolicStr);
          const diastolic = this.parseNumericValue(diastolicStr);

          if (systolic !== null && diastolic !== null && 
              this.isValidBloodPressureValue(systolic, true) && 
              this.isValidBloodPressureValue(diastolic, false)) {
            return { valid: true, systolic, diastolic, original: bp };
          }
        }
        
        return result;
      }

      // Handle single numeric value (ambiguous, treat as invalid)
      return result;
    }

    // Handle object format (if API returns structured data)
    if (typeof bp === 'object' && bp !== null) {
      const systolic = this.parseNumericValue(bp.systolic);
      const diastolic = this.parseNumericValue(bp.diastolic);

      if (systolic !== null && diastolic !== null && 
          this.isValidBloodPressureValue(systolic, true) && 
          this.isValidBloodPressureValue(diastolic, false)) {
        return { valid: true, systolic, diastolic, original: bp };
      }
    }

    return result;
  }

  /**
   * Process temperature data with validation
   */
  private processTemperature(temp: any): { valid: boolean; value?: number; original?: any } {
    const result = { valid: false, original: temp };

    // Handle null, undefined, or empty values
    if (temp === null || temp === undefined || temp === '') {
      return result;
    }

    // Handle numeric values
    if (typeof temp === 'number') {
      if (!isNaN(temp) && this.isValidTemperature(temp)) {
        return { valid: true, value: temp, original: temp };
      }
      return result;
    }

    // Handle string values
    if (typeof temp === 'string') {
      const trimmedTemp = temp.trim();
      
      // Check for invalid strings
      if (trimmedTemp.toLowerCase().includes('temp_error') || 
          trimmedTemp.toLowerCase().includes('invalid') ||
          trimmedTemp.toLowerCase().includes('n/a') ||
          trimmedTemp.toLowerCase().includes('error')) {
        return result;
      }

      // Remove common temperature units if present
      const cleanTemp = trimmedTemp.replace(/[°ºf℉]/gi, '').trim();
      
      const numericTemp = this.parseNumericValue(cleanTemp);
      
      if (numericTemp !== null && this.isValidTemperature(numericTemp)) {
        return { valid: true, value: numericTemp, original: temp };
      }
    }

    return result;
  }

  /**
   * Parse a string or numeric value to number
   */
  private parseNumericValue(value: any): number | null {
    if (typeof value === 'number') {
      return isNaN(value) ? null : value;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') return null;
      
      const parsed = parseFloat(trimmed);
      return isNaN(parsed) ? null : parsed;
    }

    return null;
  }

  /**
   * Validate blood pressure value ranges
   */
  private isValidBloodPressureValue(value: number, isSystolic: boolean): boolean {
    if (isSystolic) {
      // Systolic: typically 70-300 mmHg
      return value >= 70 && value <= 300;
    } else {
      // Diastolic: typically 40-200 mmHg
      return value >= 40 && value <= 200;
    }
  }

  /**
   * Validate temperature value ranges
   */
  private isValidTemperature(value: number): boolean {
    // Valid temperature range: 90-110°F
    return value >= 90 && value <= 110;
  }

  /**
   * Check if a processed patient has any data quality issues
   */
  hasDataQualityIssues(processedPatient: ProcessedPatient): boolean {
    return !processedPatient.age_data.valid || 
           !processedPatient.blood_pressure_data.valid || 
           !processedPatient.temperature_data.valid;
  }

  /**
   * Get a summary of data quality issues for a patient
   */
  getDataQualityIssues(processedPatient: ProcessedPatient): string[] {
    const issues: string[] = [];

    if (!processedPatient.age_data.valid) {
      issues.push('Invalid/missing age data');
    }

    if (!processedPatient.blood_pressure_data.valid) {
      issues.push('Invalid/missing blood pressure data');
    }

    if (!processedPatient.temperature_data.valid) {
      issues.push('Invalid/missing temperature data');
    }

    return issues;
  }

  /**
   * Validate and clean patient ID
   */
  private validatePatientId(patient_id: any): string {
    if (typeof patient_id === 'string' && patient_id.trim() !== '') {
      return patient_id.trim();
    }
    
    if (typeof patient_id === 'number') {
      return patient_id.toString();
    }

    throw new Error('Invalid patient ID');
  }

  /**
   * Process multiple patients in batch
   */
  processPatients(patients: Patient[]): ProcessedPatient[] {
    const results: ProcessedPatient[] = [];
    const errors: string[] = [];

    for (let i = 0; i < patients.length; i++) {
      try {
        const patient = patients[i];
        if (!patient?.patient_id) {
          errors.push(`Patient at index ${i} has no patient_id`);
          continue;
        }

        const processed = this.processPatient(patient);
        results.push(processed);
      } catch (error) {
        errors.push(`Error processing patient at index ${i}: ${error}`);
      }
    }

    if (errors.length > 0) {
      console.warn(`Data processing warnings: ${errors.join('; ')}`);
    }

    return results;
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(processedPatients: ProcessedPatient[]): {
    total: number;
    validAge: number;
    validBP: number;
    validTemp: number;
    fullyValid: number;
    dataQualityIssues: number;
  } {
    const stats = {
      total: processedPatients.length,
      validAge: 0,
      validBP: 0,
      validTemp: 0,
      fullyValid: 0,
      dataQualityIssues: 0
    };

    for (const patient of processedPatients) {
      if (patient.age_data.valid) stats.validAge++;
      if (patient.blood_pressure_data.valid) stats.validBP++;
      if (patient.temperature_data.valid) stats.validTemp++;
      
      if (patient.age_data.valid && patient.blood_pressure_data.valid && patient.temperature_data.valid) {
        stats.fullyValid++;
      } else {
        stats.dataQualityIssues++;
      }
    }

    return stats;
  }
}