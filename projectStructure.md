resume-optimizer/
├── backend/                # Node.js/Express
│   ├── src/
│   │   ├── controllers/
│   │   │   └── optimizeResume.js  # Orchestrates parsing, GenAI, ATS, PDF
│   │   ├── services/
│   │   │   ├── latexParser.js     # Parses LaTeX (tex-parser/regex)
│   │   │   ├── genaiService.js    # Gemini + Grok API calls
│   │   │   ├── atsService.js      # ATS scoring
│   │   │   └── pdfService.js      # PDF compilation
│   │   ├── utils/
│   │   │   ├── keywordExtractor.js # Extracts JD keywords
│   │   │   └── fileHelper.js      # Temp file management
│   │   ├── tests/
│   │   │   ├── latexParser.test.js
│   │   │   ├── genaiService.test.js
│   │   │   ├── atsService.test.js
│   │   │   └── pdfService.test.js
│   │   └── index.js        # Server entry
│   ├── package.json
│   └── .env                # GEMINI_API_KEY, GROK_API_KEY
├── flutter_app/            # Flutter frontend
│   ├── lib/
│   │   ├── screens/
│   │   │   └── home.dart   # Main UI
│   │   ├── widgets/
│   │   │   ├── input_form.dart    # Inputs + API switch
│   │   │   ├── ats_score.dart     # ATS score + bar
│   │   │   ├── resume_preview.dart # Tabbed preview
│   │   │   └── download_button.dart # Downloads
│   │   ├── services/
│   │   │   └── api_service.dart   # HTTP requests
│   │   ├── main.dart
│   │   └── tests/          # Unit tests
│   ├── pubspec.yaml
│   └── test/               # Widget tests
├── README.md
└── .gitignore