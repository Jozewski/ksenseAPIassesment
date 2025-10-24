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

## Example Output

```
🏥 Healthcare API Assessment - Starting...
==================================================
🔍 Testing API connectivity...
✅ API connection test successful

📥 Fetching patient data...
📄 Fetched page 1: 5 patients (total: 5)
📄 Fetched page 2: 5 patients (total: 10)
...
✅ Successfully fetched all 47 patients from 10 pages

⚙️ Processing patient data...
📊 Processing Statistics:
   Total patients: 47
   Valid age data: 45
   Valid blood pressure data: 42
   Valid temperature data: 44
   Fully valid patients: 40
   Patients with data quality issues: 7

🧮 Calculating risk scores and generating alerts...
📋 Alert Summary:
   High-risk patients: 8
   Fever patients: 12
   Data quality issues: 7

📤 Submitting assessment...
✅ Assessment submitted successfully!
📊 Score: 95
💬 Feedback: Excellent work!
🔄 Attempts remaining: 2

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
