const { parseLatex } = require('../services/latexParser');
const fs = require('fs').promises;

// Sample LaTeX from your resume (paste the full code here for testing)
const sampleLatex = `
\\documentclass{resume}
\\usepackage[left=0.5in,top=0.4in,right=0.5in,bottom=0.3in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}

\\name{Shoeb Iqbal}
\\address{+91 8707884465 \\\\ New Delhi, India}
\\address{\\href{mailto:wiqbal091@gmail.com}{wiqbal091@gmail.com} \\quad 
\\href{https://shoebdev.vercel.app}{Portfolio} \\quad 
\\href{https://linkedin.com/in/shoebdev}{LinkedIn} \\quad 
\\href{https://github.com/SHOEB091}{GitHub}
}

\\begin{document}

%---------------------- SUMMARY ----------------------

\\begin{rSection}{Summary}
Full-Stack Developer skilled in building scalable apps, RESTful APIs, and AI-powered tools.  
Experienced in cloud-native systems, DevOps automation, and agile team environments.
\\end{rSection}


%---------------------- EXPERIENCE ----------------------

\\begin{rSection}{Experience}

\\textbf{Software Engineer Trainee}, Bridge Group Solutions \\hfill \\textit{Jan 2025 – July 2025}
\\begin{itemize}[leftmargin=*, itemsep=1pt, topsep=1pt]
  \\item Built a scalable ASP.NET-based assessment platform, reducing hiring time by 70\\% and recruitment cost by 45\\%.
  \\item Deployed Redis-backed microservices with CI/CD (Jenkins, EC2), enabling 99.9\\% uptime for 5K+ users.
  \\item Created a secure internal HR tool in Python (Flet) with PBKDF2 encryption and performance dashboards.
  \\item Developed a Flutter LMS with offline support and push notifications, increasing training engagement by 60\\%.
\\end{itemize}

\\textbf{Backend Developer Intern}, Koders \\hfill \\textit{May 2024 – Jul 2024}
\\begin{itemize}[leftmargin=*, itemsep=1pt, topsep=1pt]
  \\item Integrated OpenAI Whisper API and FFmpeg into a Next.js application, cutting video processing by 15+ minutes.
  \\item Built a session-authenticated Node.js expense tracker deployed on AWS EC2 with NGINX reverse proxy.
  \\item Developed a Strapi backend (PostgreSQL) for Koders Merch with scalable APIs and RBAC authorization.
\\end{itemize}

\\end{rSection}

%---------------------- PROJECTS ----------------------

\\begin{rSection}{Projects}

\\textbf{AI ChatPDF} \\hfill \\textit{Feb 2025 – Mar 2025} \\\\
\\textit{Next.js, Gemini AI, LangChain, Pinecone, Razorpay, S3} \\quad 
\\href{https://github.com/SHOEB091/AI-ChatPDF.git}{GitHub} \\quad 
\\href{https://sichatpdf.vercel.app}{Live Demo} \\\\
AI-powered PDF assistant using RAG, streaming output, vector DB search, and Razorpay billing. Enhanced document understanding and interaction via conversational PDF interface.

\\textbf{SOIDE – Online Code IDE} \\hfill \\textit{May 2024 – Jun 2024} \\\\
\\textit{React.js, Node.js, Express.js, Docker, Piston API, MongoDB} \\quad 
\\href{https://github.com/SHOEB091/code-IDE.git}{GitHub} \\quad 
\\href{https://soide.netlify.app}{Live Demo} \\\\
Deployed an online IDE with JWT-auth, Docker execution, and Monaco-based UI. Supports 7 languages with real-time execution and responsive UX.

\\end{rSection}

%---------------------- EDUCATION ----------------------

\\begin{rSection}{Education}
\\textbf{B.Tech in Computer Science}, DIT University, Dehradun \\hfill \\textit{2021 – 2025} \\\\
CGPA: 8.64 / 10
\\end{rSection}

%---------------------- SKILLS ----------------------

\\begin{rSection}{Technical Skills}
\\textbf{Languages:} Java, Python, JavaScript\\\\
\\textbf{Frontend:} React.js, Next.js, EJS, HTML, CSS \\\\
\\textbf{Backend:} Node.js, Express.js, REST APIs, Strapi, ASP.NET \\\\
\\textbf{Cloud/DevOps:} AWS, Docker, Kubernetes, Jenkins, Git, NGINX, CI/CD \\\\
\\textbf{Databases:} MongoDB, PostgreSQL, MySQL, Redis \\\\
\\textbf{Frameworks/APIs:} OpenAI, LangChain, Pinecone, Razorpay, Firebase \\\\
\\textbf{CS Core:} Data Structures \\& Algorithms, System Design(Basic), OOP, DBMS, OS \\\\
\\textbf{Soft Skills:} Team Collaboration, Problem-Solving, Communication, Adaptability, Time Management
\\end{rSection}


%---------------------- CERTIFICATIONS ----------------------

\\begin{rSection}{Certifications \\& Achievements}
Deloitte Australia Cyber Simulation \\& Tech Consulting (Forage, 2025) \\\\
AWS Cloud Essentials, Docker + Kubernetes + OpenShift, Cryptography: Hash \\& Integrity (Coursera)
\\end{rSection}

\\end{document}
`;

async function testParsing() {
  try {
    const sections = await parseLatex(sampleLatex);
    console.log('Parsed Sections:', sections);
    // Verify specific section
    if (sections.Experience) {
      console.log('Experience Section Extracted Successfully:', sections.Experience.substring(0, 100) + '...');
    } else {
      console.error('Experience section not found');
    }
  } catch (error) {
    console.error('Parsing Error:', error);
  }
}

testParsing();