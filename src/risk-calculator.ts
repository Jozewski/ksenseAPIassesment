import { ProcessedPatient, BloodPressureStage, TemperatureCategory, AgeCategory, RiskScores } from './types';

/**
 * Risk Calculator for Healthcare Assessment
 * Calculates risk scores based on blood pressure, temperature, and age
 */
export class RiskCalculator {
  
  /**
   * Calculate blood pressure risk score
   * Note: If systolic and diastolic readings fall into different risk categories, 
   * use the higher risk stage for scoring.
   */
  calculateBloodPressureRisk(processedPatient: ProcessedPatient): number {
    const bpData = processedPatient.blood_pressure_data;
    
    if (!bpData.valid || bpData.systolic === undefined || bpData.diastolic === undefined) {
      return 0; // Invalid/Missing Data
    }

    const systolic = bpData.systolic;
    const diastolic = bpData.diastolic;

    // Determine systolic stage
    let systolicStage: BloodPressureStage;
    if (systolic < 120) {
      systolicStage = BloodPressureStage.NORMAL;
    } else if (systolic >= 120 && systolic <= 129) {
      systolicStage = BloodPressureStage.ELEVATED;
    } else if (systolic >= 130 && systolic <= 139) {
      systolicStage = BloodPressureStage.STAGE_1;
    } else if (systolic >= 140) {
      systolicStage = BloodPressureStage.STAGE_2;
    } else {
      systolicStage = BloodPressureStage.INVALID;
    }

    // Determine diastolic stage
    let diastolicStage: BloodPressureStage;
    if (diastolic < 80) {
      diastolicStage = BloodPressureStage.NORMAL;
    } else if (diastolic >= 80 && diastolic <= 89) {
      diastolicStage = BloodPressureStage.STAGE_1;
    } else if (diastolic >= 90) {
      diastolicStage = BloodPressureStage.STAGE_2;
    } else {
      diastolicStage = BloodPressureStage.INVALID;
    }

    // Apply specific rules from requirements
    let finalStage: BloodPressureStage;

    // Normal: Systolic <120 AND Diastolic <80
    if (systolic < 120 && diastolic < 80) {
      finalStage = BloodPressureStage.NORMAL;
    }
    // Elevated: Systolic 120‑129 AND Diastolic <80
    else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
      finalStage = BloodPressureStage.ELEVATED;
    }
    // Stage 1: Systolic 130‑139 OR Diastolic 80‑89
    else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
      finalStage = BloodPressureStage.STAGE_1;
    }
    // Stage 2: Systolic ≥140 OR Diastolic ≥90
    else if (systolic >= 140 || diastolic >= 90) {
      finalStage = BloodPressureStage.STAGE_2;
    }
    else {
      finalStage = BloodPressureStage.INVALID;
    }

    // Convert stage to score
    switch (finalStage) {
      case BloodPressureStage.NORMAL:
        return 1;
      case BloodPressureStage.ELEVATED:
        return 2;
      case BloodPressureStage.STAGE_1:
        return 3;
      case BloodPressureStage.STAGE_2:
        return 4;
      default:
        return 0; // Invalid/Missing Data
    }
  }

  /**
   * Calculate temperature risk score
   */
  calculateTemperatureRisk(processedPatient: ProcessedPatient): number {
    const tempData = processedPatient.temperature_data;
    
    if (!tempData.valid || tempData.value === undefined) {
      return 0; // Invalid/Missing Data
    }

    const temperature = tempData.value;

    if (temperature <= 99.5) {
      return 0; // Normal
    } else if (temperature >= 99.6 && temperature <= 100.9) {
      return 1; // Low Fever
    } else if (temperature >= 101.0) {
      return 2; // High Fever
    } else {
      return 0; // Invalid/Missing Data
    }
  }

  /**
   * Calculate age risk score
   */
  calculateAgeRisk(processedPatient: ProcessedPatient): number {
    const ageData = processedPatient.age_data;
    
    if (!ageData.valid || ageData.value === undefined) {
      return 0; // Invalid/Missing Data
    }

    const age = ageData.value;

    if (age < 40) {
      return 1; // Under 40
    } else if (age >= 40 && age <= 65) {
      return 1; // 40-65 (inclusive)
    } else if (age > 65) {
      return 2; // Over 65
    } else {
      return 0; // Invalid/Missing Data
    }
  }

  /**
   * Calculate total risk score
   * Total Risk Score = (BP Score) + (Temp Score) + (Age Score)
   */
  calculateTotalRisk(processedPatient: ProcessedPatient): number {
    const bpScore = this.calculateBloodPressureRisk(processedPatient);
    const tempScore = this.calculateTemperatureRisk(processedPatient);
    const ageScore = this.calculateAgeRisk(processedPatient);

    return bpScore + tempScore + ageScore;
  }

  /**
   * Get detailed risk scores breakdown
   */
  getDetailedRiskScores(processedPatient: ProcessedPatient): RiskScores {
    const bpScore = this.calculateBloodPressureRisk(processedPatient);
    const tempScore = this.calculateTemperatureRisk(processedPatient);
    const ageScore = this.calculateAgeRisk(processedPatient);
    const total = bpScore + tempScore + ageScore;

    return {
      blood_pressure: bpScore,
      temperature: tempScore,
      age: ageScore,
      total: total
    };
  }

  /**
   * Check if patient is high risk (total score ≥ 4)
   */
  isHighRisk(processedPatient: ProcessedPatient): boolean {
    return this.calculateTotalRisk(processedPatient) >= 4;
  }

  /**
   * Check if patient has fever (temperature ≥ 99.6°F)
   */
  hasFever(processedPatient: ProcessedPatient): boolean {
    const tempData = processedPatient.temperature_data;
    return tempData.valid && tempData.value !== undefined && tempData.value >= 99.6;
  }

  /**
   * Get blood pressure category for logging/debugging
   */
  getBloodPressureCategory(processedPatient: ProcessedPatient): BloodPressureStage {
    const bpData = processedPatient.blood_pressure_data;
    
    if (!bpData.valid || bpData.systolic === undefined || bpData.diastolic === undefined) {
      return BloodPressureStage.INVALID;
    }

    const systolic = bpData.systolic;
    const diastolic = bpData.diastolic;

    // Apply the same logic as calculateBloodPressureRisk
    if (systolic < 120 && diastolic < 80) {
      return BloodPressureStage.NORMAL;
    } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
      return BloodPressureStage.ELEVATED;
    } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
      return BloodPressureStage.STAGE_1;
    } else if (systolic >= 140 || diastolic >= 90) {
      return BloodPressureStage.STAGE_2;
    } else {
      return BloodPressureStage.INVALID;
    }
  }

  /**
   * Get temperature category for logging/debugging
   */
  getTemperatureCategory(processedPatient: ProcessedPatient): TemperatureCategory {
    const tempData = processedPatient.temperature_data;
    
    if (!tempData.valid || tempData.value === undefined) {
      return TemperatureCategory.INVALID;
    }

    const temperature = tempData.value;

    if (temperature <= 99.5) {
      return TemperatureCategory.NORMAL;
    } else if (temperature >= 99.6 && temperature <= 100.9) {
      return TemperatureCategory.LOW_FEVER;
    } else if (temperature >= 101.0) {
      return TemperatureCategory.HIGH_FEVER;
    } else {
      return TemperatureCategory.INVALID;
    }
  }

  /**
   * Get age category for logging/debugging
   */
  getAgeCategory(processedPatient: ProcessedPatient): AgeCategory {
    const ageData = processedPatient.age_data;
    
    if (!ageData.valid || ageData.value === undefined) {
      return AgeCategory.INVALID;
    }

    const age = ageData.value;

    if (age < 40) {
      return AgeCategory.UNDER_40;
    } else if (age >= 40 && age <= 65) {
      return AgeCategory.MIDDLE_AGE;
    } else if (age > 65) {
      return AgeCategory.OVER_65;
    } else {
      return AgeCategory.INVALID;
    }
  }
}