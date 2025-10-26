[Resume Optimizer App]
  ├── AppBar: "Resume Optimizer" (blue, centered, bold)
  │   ├── DropdownButton: "Select AI: Gemini | Grok" (right-aligned)
  ├── Body (SingleChildScrollView for mobile, Row for web)
  │   ├── Left Panel: Inputs (50% width on web, full on mobile)
  │   │   ├── Text: "Paste LaTeX Resume"
  │   │   ├── TextField: Multiline (10 lines)
  │   │   ├── ElevatedButton: "Upload .tex File"
  │   │   ├── Text: "Paste Job Description"
  │   │   ├── TextField: Multiline (5 lines)
  │   │   ├── Text: "Customization Prompt (Optional)"
  │   │   ├── TextField: Multiline (3 lines, placeholder: "E.g., Emphasize leadership")
  │   │   ├── ElevatedButton: "Optimize Resume" (blue, rounded)
  │   ├── Right Panel: Outputs (50% width on web, full on mobile)
  │   │   ├── ATS Score
  │   │   │   ├── Text: "ATS Score: XX%"
  │   │   │   ├── LinearProgressIndicator: Green (high), red (low)
  │   │   │   ├── Text: Feedback (e.g., "Add cloud skills")
  │   │   ├── Preview
  │   │   │   ├── TabBar: "Original LaTeX" | "Optimized LaTeX" | "PDF"
  │   │   │   ├── TabBarView: Code (flutter_highlight) or PDF (SfPdfViewer)
  │   │   ├── Download Buttons
  │   │   │   ├── ElevatedButton: "Download PDF"
  │   │   │   ├── ElevatedButton: "Download LaTeX"
  │   ├── CircularProgressIndicator: Overlay during optimization
  │   ├── Error Text: Red, below inputs (e.g., "Invalid LaTeX")
  ├── BottomNavigationBar (mobile): Home | About