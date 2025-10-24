# Healthcare API Assessment

A TypeScript application that integrates with the DemoMed Healthcare API to assess patient health risks based on blood pressure, temperature, and age data.

## Overview

This project implements a comprehensive patient risk scoring system that:

- 🔌 **API Integration**: Connects to Healthcare API with authentication and retry logic
- 📊 **Risk Scoring**: Calculates patient risk scores using medical criteria
- 🔧 **Data Processing**: Handles inconsistent data formats and validates patient information
- 🚨 **Alert Generation**: Identifies high-risk patients, fever cases, and data quality issues
- 📤 **Assessment Submission**: Submits results to the assessment API

## API Details

- **Base URL**: `https://assessment.ksensetech.com/api`
- **Authentication**: `x-api-key` header required
- **API Key**: `ak_46987d0d0f971d39604352debce7070ec5967eb1a004ac94`
- **Features**: Rate limited with pagination support, may return inconsistent data formats

## Risk Scoring Criteria

### Blood Pressure Risk
- **Normal** (Systolic <120 AND Diastolic <80): 1 point
- **Elevated** (Systolic 120‑129 AND Diastolic <80): 2 points
- **Stage 1** (Systolic 130‑139 OR Diastolic 80‑89): 3 points
- **Stage 2** (Systolic ≥140 OR Diastolic ≥90): 4 points
- **Invalid/Missing Data**: 0 points

### Temperature Risk
- **Normal** (≤99.5°F): 0 points
- **Low Fever** (99.6-100.9°F): 1 point
- **High Fever** (≥101.0°F): 2 points
- **Invalid/Missing Data**: 0 points

### Age Risk
- **Under 40** (<40 years): 1 point
- **40-65** (40-65 years, inclusive): 1 point
- **Over 65** (>65 years): 2 points
- **Invalid/Missing Data**: 0 points

**Total Risk Score = Blood Pressure Score + Temperature Score + Age Score**

## Alert Criteria

- **High-Risk Patients**: Total risk score ≥ 4
- **Fever Patients**: Temperature ≥ 99.6°F
- **Data Quality Issues**: Invalid/missing data in BP, Age, or Temperature

## Project Structure

```
src/
├── main.ts              # Main application entry point
├── api-client.ts        # Healthcare API client with retry logic
├── risk-calculator.ts   # Risk scoring calculations
├── data-processor.ts    # Data validation and processing
└── types.ts            # TypeScript type definitions
```

## Installation

1. **Install Node.js** (version 16 or higher)

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Usage

### Development Mode
Run the application in development mode with TypeScript compilation:
```bash
npm run dev
```

### Production Mode
1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Run the compiled application**:
   ```bash
   npm start
   ```

### Other Commands
- **Lint the code**: `npm run lint`
- **Run tests**: `npm test`
- **Clean build files**: `npm run clean`

## Actual Output

```
🏥 Healthcare API Assessment - Starting...
==================================================
🔍 Testing API connectivity...
✅ API Request successful: GET /patients
✅ API connection test successful

📥 Fetching patient data...
� Starting to fetch all patients...
✅ API Request successful: GET /patients
�📄 Fetched page 1: 5 patients (total: 5)
✅ API Request successful: GET /patients
📄 Fetched page 2: 5 patients (total: 10)
❌ API Request failed: GET /patients Request failed with status code 502
⚠️ Fetch patients page 3 failed (attempt 1/4), retrying in 1953.0359007700104ms...
✅ API Request successful: GET /patients
📄 Fetched page 3: 5 patients (total: 15)
❌ API Request failed: GET /patients Request failed with status code 429
   API suggested retry after 18s, using 18000ms
⚠️ Fetch patients page 4 failed (attempt 1/4), retrying in 18855.26555661761ms...
✅ API Request successful: GET /patients
📄 Fetched page 4: 5 patients (total: 20)
❌ API Request failed: GET /patients Request failed with status code 503
⚠️ Fetch patients page 5 failed (attempt 1/4), retrying in 1958.7782455981742ms...
✅ API Request successful: GET /patients
📄 Fetched page 5: 5 patients (total: 25)
✅ API Request successful: GET /patients
📄 Fetched page 6: 5 patients (total: 30)
✅ API Request successful: GET /patients
📄 Fetched page 7: 5 patients (total: 35)
❌ API Request failed: GET /patients Request failed with status code 429
   API suggested retry after 25s, using 25000ms
⚠️ Fetch patients page 8 failed (attempt 1/4), retrying in 25898.222302292434ms...
✅ API Request successful: GET /patients
📄 Fetched page 8: 5 patients (total: 40)
✅ API Request successful: GET /patients
📄 Fetched page 9: 5 patients (total: 45)
✅ API Request successful: GET /patients
📄 Fetched page 10: 2 patients (total: 47)
✅ Successfully fetched all 47 patients from 10 pages
✅ Retrieved 47 patients

⚙️ Processing patient data...
📊 Processing Statistics:
   Total patients: 47
   Valid age data: 45
   Valid blood pressure data: 42
   Valid temperature data: 46
   Fully valid patients: 39
   Patients with data quality issues: 8

🧮 Calculating risk scores and generating alerts...
📋 Alert Summary:
   High-risk patients: 31
   Fever patients: 9
   Data quality issues: 8

� Detailed Results:
----------------------------------------

🚨 High-Risk Patients (31):
   DEMO001: Total Risk = 4 (BP:3, Temp:0, Age:1)
   DEMO002: Total Risk = 6 (BP:4, Temp:0, Age:2)
   DEMO006: Total Risk = 5 (BP:3, Temp:0, Age:2)
   DEMO007: Total Risk = 5 (BP:4, Temp:0, Age:1)
   DEMO008: Total Risk = 6 (BP:3, Temp:2, Age:1)
   DEMO009: Total Risk = 5 (BP:3, Temp:1, Age:1)
   DEMO010: Total Risk = 5 (BP:4, Temp:0, Age:1)
   DEMO012: Total Risk = 8 (BP:4, Temp:2, Age:2)
   DEMO016: Total Risk = 5 (BP:4, Temp:0, Age:1)
   DEMO017: Total Risk = 4 (BP:3, Temp:0, Age:1)
   DEMO019: Total Risk = 6 (BP:4, Temp:0, Age:2)
   DEMO020: Total Risk = 5 (BP:3, Temp:0, Age:2)
   DEMO021: Total Risk = 6 (BP:3, Temp:2, Age:1)
   DEMO022: Total Risk = 5 (BP:3, Temp:0, Age:2)
   DEMO027: Total Risk = 5 (BP:4, Temp:0, Age:1)
   DEMO028: Total Risk = 4 (BP:3, Temp:0, Age:1)
   DEMO029: Total Risk = 4 (BP:3, Temp:0, Age:1)
   DEMO031: Total Risk = 6 (BP:4, Temp:0, Age:2)
   DEMO032: Total Risk = 6 (BP:4, Temp:0, Age:2)
   DEMO033: Total Risk = 6 (BP:4, Temp:0, Age:2)
   DEMO034: Total Risk = 4 (BP:3, Temp:0, Age:1)
   DEMO035: Total Risk = 4 (BP:4, Temp:0, Age:0)
   DEMO037: Total Risk = 5 (BP:2, Temp:2, Age:1)
   DEMO038: Total Risk = 4 (BP:1, Temp:2, Age:1)
   DEMO039: Total Risk = 4 (BP:3, Temp:0, Age:1)
   DEMO040: Total Risk = 4 (BP:3, Temp:0, Age:1)
   DEMO041: Total Risk = 5 (BP:3, Temp:0, Age:2)
   DEMO043: Total Risk = 4 (BP:4, Temp:0, Age:0)
   DEMO045: Total Risk = 6 (BP:4, Temp:0, Age:2)
   DEMO047: Total Risk = 4 (BP:2, Temp:1, Age:1)
   DEMO048: Total Risk = 5 (BP:4, Temp:0, Age:1)

🌡️ Fever Patients (9):
   DEMO005: Temperature = 101.8°F
   DEMO008: Temperature = 102.3°F
   DEMO009: Temperature = 100.1°F
   DEMO012: Temperature = 103.2°F
   DEMO021: Temperature = 101.5°F
   DEMO023: Temperature = 99.7°F
   DEMO037: Temperature = 104.1°F
   DEMO038: Temperature = 102.8°F
   DEMO047: Temperature = 99.9°F

⚠️ Data Quality Issues (8):
   DEMO004: Invalid/missing blood pressure data
   DEMO005: Invalid/missing blood pressure data
   DEMO007: Invalid/missing temperature data
   DEMO023: Invalid/missing blood pressure data
   DEMO024: Invalid/missing blood pressure data
   DEMO035: Invalid/missing age data
   DEMO036: Invalid/missing blood pressure data
   DEMO043: Invalid/missing age data

📋 Sample Processed Patients (first 5):
   DEMO001: Risk=4 | BP:120/80 | Temp:98.6°F | Age:45y
   DEMO002: Risk=6 | BP:140/90 | Temp:99.2°F | Age:67y
   DEMO003: Risk=2 | BP:110/70 | Temp:98.4°F | Age:34y
   DEMO004: Risk=1 | BP:invalid | Temp:99.1°F | Age:52y
   DEMO005: Risk=3 | BP:invalid | Temp:101.8°F | Age:28y

📤 Submitting assessment...
� Submitting assessment results...
   - High-risk patients: 31
   - Fever patients: 9
   - Data quality issues: 8
✅ API Request successful: POST /submit-assessment
✅ Assessment submitted successfully!
✅ Assessment submitted successfully!

🎉 Assessment completed successfully!
```

## Features

### Robust Error Handling
- Exponential backoff retry logic for API failures
- Graceful handling of rate limiting (429 errors)
- Comprehensive data validation and sanitization

### Data Processing
- Handles inconsistent blood pressure formats (`"120/80"`, `"150/"`, `"/90"`)
- Validates and cleans temperature data with unit removal
- Processes age data with type coercion and range validation
- Identifies and reports data quality issues

### Risk Assessment
- Implements medical guidelines for blood pressure classification
- Accurate fever detection and categorization
- Age-based risk stratification
- Detailed risk score breakdown and logging

## Dependencies

- **axios**: HTTP client for API requests
- **typescript**: TypeScript compiler
- **ts-node**: TypeScript execution environment
- **@types/node**: Node.js type definitions

## Configuration

The application uses the following configuration:

- **API Key**: `ak_46987d0d0f971d39604352debce7070ec5967eb1a004ac94`
- **Base URL**: `https://assessment.ksensetech.com/api`
- **Max Retries**: 3 attempts with exponential backoff
- **Request Timeout**: 30 seconds
- **Page Size**: 5 patients per page (API default)

## Assessment Submission

The application automatically submits three arrays to the assessment API:

1. `high_risk_patients`: Patient IDs with total risk score ≥ 4
2. `fever_patients`: Patient IDs with temperature ≥ 99.6°F
3. `data_quality_issues`: Patient IDs with invalid/missing data

You have **3 attempts** to submit the assessment, with immediate feedback provided after each submission.

## License

MIT License
