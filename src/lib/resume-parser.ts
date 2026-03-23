// Comprehensive skill keywords database
const SKILL_KEYWORDS: { [key: string]: string[] } = {
  "JavaScript": ["javascript", "js", "es6", "es5", "ecmascript"],
  "TypeScript": ["typescript", "ts"],
  "React": ["react", "reactjs", "react hooks", "jsx"],
  "Vue": ["vue", "vuejs", "vue3"],
  "Angular": ["angular", "angularjs"],
  "Node.js": ["node.js", "nodejs", "node", "express"],
  "Python": ["python", "py"],
  "Java": ["java"],
  "C++": ["c++", "cpp", "c plus plus"],
  "C#": ["c#", "csharp", "c sharp"],
  "SQL": ["sql", "mysql", "postgresql", "oracle", "mssql"],
  "MongoDB": ["mongodb", "mongo", "nosql"],
  "Firebase": ["firebase", "firestore"],
  "AWS": ["amazon web services", "aws", "ec2", "s3", "lambda"],
  "Azure": ["azure", "microsoft azure"],
  "Docker": ["docker", "containerization"],
  "Kubernetes": ["kubernetes", "k8s"],
  "Git": ["git", "github", "gitlab", "bitbucket", "version control"],
  "REST API": ["rest api", "restful", "api design", "http"],
  "GraphQL": ["graphql"],
  "HTML": ["html", "html5"],
  "CSS": ["css", "css3", "styling", "sass", "scss", "less"],
  "Tailwind CSS": ["tailwind", "tailwindcss"],
  "Bootstrap": ["bootstrap"],
  "Material UI": ["material ui", "material design", "mui"],
  "Redux": ["redux", "state management"],
  "React Native": ["react native", "mobile"],
  "Flutter": ["flutter", "dart"],
  "iOS": ["ios", "swift", "objective-c"],
  "Android": ["android", "kotlin"],
  "Testing": ["jest", "testing", "unit test", "e2e", "cypress", "mocha"],
  "CI/CD": ["ci/cd", "continuous integration", "jenkins", "github actions", "gitlab ci"],
  "Linux": ["linux", "ubuntu", "centos"],
  "Mac": ["mac", "macos", "osx"],
  "Windows": ["windows"],
  "Agile": ["agile", "scrum", "kanban"],
  "Machine Learning": ["machine learning", "ml", "ai", "artificial intelligence", "tensorflow", "pytorch"],
  "Data Science": ["data science", "data analysis", "pandas", "numpy"],
  "Design": ["ui design", "ux design", "figma", "adobe xd", "sketch"],
  "Project Management": ["project management", "jira", "asana", "monday.com"],
};

export interface SkillMatch {
  skill: string;
  category?: string;
  confidence: number;
}

export interface ResumeAnalysis {
  extractedText: string;
  skills: SkillMatch[];
  rawSkills: string[];
}

// Updated: Use static local worker with versioning to burst cache
import * as pdfjsLib from 'pdfjs-dist';

// Pointing to the versioned copy in the /public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.v5.mjs';
console.log("PDF Worker Source:", pdfjsLib.GlobalWorkerOptions.workerSrc);

/**
 * Extract text from PDF file using pdf.js
 */
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Use a task to get the document
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: true,
      isEvalSupported: false,
    });
    
    const pdf = await loadingTask.promise;
    let fullText = "";
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }
    
    if (!fullText.trim()) {
      throw new Error("No text content found in PDF. The file might be scanned or protected.");
    }
    
    return fullText;
  } catch (error) {
    console.error("PDF parsing detailed error:", error);
    if (error instanceof Error && error.message.includes("Worker")) {
       throw new Error("PDF Worker failed to load. Please refresh and try again.");
    }
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : "Internal Error"}`);
  }
};

/**
 * Extract text from file - supports both .txt and .pdf formats
 * Uses pdf.js for PDF parsing and FileReader for text files.
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  // Check if it's a PDF file
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    // Use pdf.js to extract text from PDF
    return await extractTextFromPDF(file);
  }
  
  // For text files, use FileReader
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text || text.trim() === "") {
        reject(new Error("Could not read file content. Please try a different file."));
        return;
      }
      resolve(text);
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file. Please try again."));
    };
    reader.readAsText(file);
  });
};

/**
 * Extract skills from resume text
 */
export const extractSkillsFromResume = (resumeText: string): ResumeAnalysis => {
  const lowerText = resumeText.toLowerCase();
  const matchedSkills: SkillMatch[] = [];
  const rawSkills: string[] = [];

  // Iterate through skill keywords
  Object.entries(SKILL_KEYWORDS).forEach(([skill, keywords]) => {
    keywords.forEach((keyword) => {
      // Escape special regex characters in the keyword
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Using word boundary at the start, and ensuring not followed by word character at the end
      // This correctly handles C++, C#, etc. which \b\b fails on
      const regex = new RegExp(`\\b${escapedKeyword}(?!\\w)`, "gi");
      if (regex.test(lowerText)) {
        if (!rawSkills.includes(skill)) {
          rawSkills.push(skill);
          matchedSkills.push({
            skill,
            confidence: keywords.length > 1 ? 0.9 : 1.0,
          });
        }
      }
    });
  });

  return {
    extractedText: resumeText,
    skills: matchedSkills,
    rawSkills,
  };
};

/**
 * Group skills by category for better organization
 */
export const groupSkillsByCategory = (skills: SkillMatch[]) => {
  const categories: { [key: string]: string[] } = {
    "Frontend": ["React", "Vue", "Angular", "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Material UI"],
    "Backend": ["Node.js", "Python", "Java", "C#", "C++", "Express"],
    "Database": ["SQL", "MongoDB", "Firebase"],
    "Cloud": ["AWS", "Azure"],
    "DevOps": ["Docker", "Kubernetes", "CI/CD", "Git"],
    "Mobile": ["React Native", "Flutter", "iOS", "Android"],
    "Testing": ["Testing"],
    "Other": [],
  };

  const grouped: { [key: string]: string[] } = {};

  skills.forEach(({ skill }) => {
    let found = false;
    for (const [category, skillList] of Object.entries(categories)) {
      if (skillList.includes(skill)) {
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(skill);
        found = true;
        break;
      }
    }
    if (!found) {
      if (!grouped["Other"]) {
        grouped["Other"] = [];
      }
      grouped["Other"].push(skill);
    }
  });

  return grouped;
};
