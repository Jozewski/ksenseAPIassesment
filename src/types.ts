/**
 * Type definitions for the Healthcare API Assessment
 */

export interface Patient {
  patient_id: string;
  name?: string;
  age?: number | string;
  gender?: string;
  blood_pressure?: string;
  temperature?: number | string;
  visit_date?: string;
  diagnosis?: string;
  medications?: string;
  [key: string]: any;
}

export interface ProcessedPatient {
  id: string;
  age_data: {
    valid: boolean;
    value?: number;
    original?: any;
  };
  blood_pressure_data: {
    valid: boolean;
    systolic?: number;
    diastolic?: number;
    original?: any;
  };
  temperature_data: {
    valid: boolean;
    value?: number;
    original?: any;
  };
  total_risk_score?: number;
}

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
}

export interface RiskScores {
  blood_pressure: number;
  temperature: number;
  age: number;
  total: number;
}

export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  metadata: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

export interface SubmissionData {
  high_risk_patients: string[];
  fever_patients: string[];
  data_quality_issues: string[];
}

export interface SubmissionResult {
  success: boolean;
  message?: string;
  score?: number;
  feedback?: string;
  attempts_remaining?: number;
}

export enum BloodPressureStage {
  NORMAL = 'normal',
  ELEVATED = 'elevated',
  STAGE_1 = 'stage_1',
  STAGE_2 = 'stage_2',
  INVALID = 'invalid'
}

export enum TemperatureCategory {
  NORMAL = 'normal',
  LOW_FEVER = 'low_fever',
  HIGH_FEVER = 'high_fever',
  INVALID = 'invalid'
}

export enum AgeCategory {
  UNDER_40 = 'under_40',
  MIDDLE_AGE = 'middle_age',
  OVER_65 = 'over_65',
  INVALID = 'invalid'
}