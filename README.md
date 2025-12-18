🚗 RuleMap
Rule-Based Data Validation & Mapping Engine

RuleMap is an enterprise-style rule-driven validation system designed to validate vehicle, policy, and usage/risk data.
It supports manual data entry as well as Excel ingestion with drag-and-drop column mapping, making it suitable for real-world insurance and banking workflows.

✨ Key Features

✅ Rule-based validation using configurable business rules

✅ Vehicle, Policy, and Usage/Risk validation modules

✅ Manual form-based data entry

✅ Excel file upload support

✅ Drag & Drop column mapping (Excel → required fields)

✅ Detailed validation reasons (why true / why false)

✅ Backend powered by FastAPI

✅ Frontend built using HTML, CSS, JavaScript

✅ CORS-enabled REST API

✅ Explainable, deterministic rule evaluation (no black-box logic)

🧩 Architecture Overview
Frontend (HTML/CSS/JS)
│
├── Manual Data Entry Form
├── Excel Upload + Drag-Drop Mapping UI
│
└── REST API Calls
        ↓
FastAPI Backend
│
├── Rule Engine
│   ├── Vehicle Rules
│   ├── Policy Rules
│   └── Usage / Risk Rules
│
└── Validation Response
        ↓
Frontend Result Dashboard
📂 Project Structure
project-root/
│
├── app.py                  # FastAPI backend
├── rules.json              # Rule definitions
│
├── frontend/
│   ├── index.html          # Home page
│   ├── manual_form.html    # Manual data entry
│   ├── excel_upload.html   # Excel upload & mapping UI
│   └── assets/
│       ├── style.css       # Styling
│       └── script.js       # Frontend logic
│
└── README.md

📜 Validation Rules (Examples)
Vehicle Information

At least one of:

CHASSIS_NO

ENGINE_NUMBER

PLATE_NO

Numeric validation for:

REGISTRATION_YEAR

MANUFACTURE_YEAR

VEHICLE_AGE

SEATING_CAPACITY

Policy Information

POLICYTYPE and SUMINSURED are mandatory

SUMINSURED must be numeric

If CLAIMYN = Yes, then:

NO_OF_CLAIMS

NO_CLAIM_BONUS are required

Usage / Risk Factors

If ISCOMMERCIAL_YN = Yes, then:

DRIVER_LICENSE is mandatory

📊 Excel Mapping Workflow

Upload Excel file

Excel columns appear on the left

Required fields appear on the right

Drag Excel columns → drop onto required fields

Review mapped output

Validate data against rules

This simulates enterprise ETL-style ingestion systems used in insurance and banking.

🚀 API Endpoint
Validate Data
POST /validate


Request Body

{
  "data": {
    "ENGINE_NUMBER": "ENG123",
    "POLICYTYPE": "Comprehensive",
    "SUMINSURED": 500000
  },
  "run_vehicle": true,
  "run_policy": true,
  "run_usage": true
}


Response

{
  "summary": {
    "vehicle_info": {
      "valid": true,
      "messages": []
    },
    "policy_info": {
      "valid": false,
      "messages": ["SUMINSURED must be a number"]
    },
    "usage_risk": {
      "valid": true,
      "messages": []
    }
  }
}

🛠 Tech Stack

Backend

Python

FastAPI

Rule-based logic (durable rules inspired)

JSON-based rule configuration

Frontend

HTML5

CSS3 (modern UI, dashboard layout)

JavaScript (drag & drop, fetch API)

Other

Excel parsing (SheetJS)

RESTful API design

CORS support

🎯 Use Cases

Insurance proposal validation

Policy underwriting checks

Data ingestion pipelines

Rule-based compliance systems

Backend + frontend integration demos

🧠 Why Rule-Based (Not AI)?

This system is intentionally rule-based to ensure:

Explainability

Deterministic outcomes

Regulatory compliance

Easy rule modification

This makes it suitable for real-world enterprise systems where transparency is critical.

🔮 Future Enhancements

Multi-row Excel validation

Rule editor UI

Versioned rule sets

Audit logs

Role-based access

Optional ML-assisted rule suggestion (future scope)
