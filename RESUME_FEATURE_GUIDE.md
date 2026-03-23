# Resume-Based Skill Interview Feature

## Overview
This feature allows users to upload their resume and automatically extract skills, which are then used to generate skill-based interview questions. Users can answer these questions using voice-to-text and receive AI-powered feedback on their responses.

## Components Created

### 1. **Resume Parser Utility** (`src/lib/resume-parser.ts`)
- **Purpose**: Extract skills from resume text
- **Key Functions**:
  - `extractTextFromFile(file)`: Extracts text from .txt and .pdf files
  - `extractSkillsFromResume(resumeText)`: Identifies skills from resume text using keyword matching
  - `groupSkillsByCategory(skills)`: Organizes skills into categories (Frontend, Backend, Database, Cloud, DevOps, Mobile, etc.)
- **Skill Database**: Contains ~40+ recognized technologies including:
  - Languages: JavaScript, TypeScript, Python, Java, C++, C#
  - Frameworks: React, Vue, Angular, Node.js, Express
  - Databases: SQL, MongoDB, Firebase
  - Tools: Docker, Kubernetes, AWS, Azure, Git
  - And many more...

### 2. **Resume Upload Component** (`src/components/resume-upload.tsx`)
- **Features**:
  - Drag-and-drop file upload interface
  - Support for .txt and .pdf files
  - Real-time skill extraction feedback
  - Visual display of extracted skills grouped by category
  - Success/warning/error messages
- **Props**:
  - `onSkillsExtracted(skills)`: Callback function when skills are extracted

### 3. **Skill Questions Generator** (`src/lib/skill-questions.ts`)
- **Purpose**: Generate interview questions for extracted skills
- **Key Function**:
  - `generateSkillBasedQuestions(skills, questionsPerSkill)`: Generates practical interview questions using AI
  - Returns questions in format: `{ skill, question, expectedAnswer }`
- **Fallback**: Built-in fallback questions for common technologies when API fails

### 4. **Record Skill Answer Component** (`src/components/record-skill-answer.tsx`)
- **Features**:
  - Voice-to-text recording for each question
  - Real-time transcription display
  - AI-powered feedback generation
  - Rating system (1-10)
  - Navigation between questions
  - Visual completion tracking
  - Save all answers to Firestore
- **Props**:
  - `questions`: Array of skill-based questions
  - `isWebCam`: Webcam visibility toggle
  - `setIsWebCam`: Function to toggle webcam

## Workflow

### 1. **Resume Upload & Skill Extraction**
```
User → Upload Resume (.txt/.pdf) → Extract Text → Match Keywords → Display Skills
```

### 2. **Interview Creation with Skills**
```
Form Submission → Generate AI Questions → Generate Skill-Based Questions → Save to Firestore
```

### 3. **Answering Skill-Based Questions**
```
View Question → Record Answer (Voice) → Transcribe → Generate Feedback → Display Results
```

### 4. **Data Storage**
- **Interview Collection**: Stores interview details + skill questions
- **UserAnswers Collection**: Stores all answers with feedback and ratings

## Updated Data Types

### Interview Interface (Updated)
```typescript
export interface Interview {
  id: string;
  position: string;
  description: string;
  experience: number;
  userId: string;
  techStack: string;
  questions: { question: string; answer: string }[];
  skillQuestions?: { skill: string; question: string; expectedAnswer: string }[];
  createdAt: Timestamp;
  updateAt: Timestamp;
}
```

## UI/UX Enhancements

### 1. **Form Page** (Updated)
- Resume upload section added before form fields
- Auto-fills tech stack field from extracted skills
- Visual feedback for uploaded resume

### 2. **Mock Interview Page** (Updated)
- Tabbed interface for question types:
  - **General Questions**: Original AI-generated questions
  - **Skill-Based Questions**: Questions from resume skills
- Easy switching between question types during interview

### 3. **Recording Interface**
- Step-by-step question navigation
- Visual completion indicators
- Real-time transcription
- Immediate feedback display
- Webcam toggle

## How to Use

### For Users:

1. **Create Interview with Resume**
   - Navigate to "Create Interview"
   - Upload your resume (optional)
   - Skills are automatically extracted and displayed
   - Tech stack is auto-filled from resume
   - Complete the form and create interview

2. **Take Interview**
   - Go to "Start Interview"
   - Switch to "Skill-Based Questions" tab
   - For each question:
     - Read the question and expected answer reference
     - Click "Start Recording" and speak your answer
     - Click "Stop Recording" to submit
     - Review AI feedback and rating
     - Move to next question or review previous

3. **View Results**
   - All answers are saved automatically
   - View feedback and ratings in results

## Technical Details

### Supported File Formats
- `.txt` files (direct text extraction)
- `.pdf` files (basic text extraction - for production, consider using pdfjs-dist)

### Skills Recognition
- 40+ technologies recognized
- Fuzzy keyword matching
- Case-insensitive search
- Categorized by technology type

### AI Integration
- Uses Google Generative AI (Gemini)
- Generates 2 questions per skill (up to 5 skills)
- Evaluates answers based on:
  - Correctness
  - Completeness
  - Clarity
  - Relevance

### Voice Recording
- Uses Web Speech API via `react-hook-speech-to-text`
- Continuous recording mode
- Real-time transcription

### Data Persistence
- Firebase Firestore storage
- Answers linked to interview ID
- User-specific tracking

## Files Modified/Created

### Created:
- `src/lib/resume-parser.ts`
- `src/lib/skill-questions.ts`
- `src/components/resume-upload.tsx`
- `src/components/record-skill-answer.tsx`

### Modified:
- `src/components/form-mock-interview.tsx` - Added resume upload section, skill question generation
- `src/routes/mock-interview-page.tsx` - Added tabbed interface for skill questions
- `src/types/index.ts` - Added skillQuestions to Interview interface

## Future Enhancements

1. **PDF Parsing**: Implement advanced PDF parsing using pdfjs-dist
2. **Resume Analysis**: Extract job requirements, experience level, company
3. **Skill Difficulty Levels**: Adjust questions based on experience level
4. **Multi-language Support**: Support resumes in multiple languages
5. **Resume Suggestions**: Provide resume improvement suggestions based on analysis
6. **Batch Interview**: Generate interviews from multiple job postings
7. **Performance Analytics**: Track performance trends across interviews
8. **Skill Progression**: Track improvement in specific skills over time

## Error Handling

- Invalid file formats are rejected with user-friendly messages
- Missing/failed API calls trigger fallback questions
- Network errors are caught and displayed
- File parsing errors provide helpful feedback

## Testing Recommendations

1. **Unit Tests**:
   - Skill extraction with various resume formats
   - Keyword matching accuracy
   - Skill categorization

2. **Integration Tests**:
   - Resume upload → Interview creation flow
   - Voice recording → Feedback generation
   - Data persistence to Firestore

3. **E2E Tests**:
   - Complete interview workflow from resume upload to feedback
   - Error scenarios and recovery

## Performance Considerations

- Resume parsing happens client-side (no network latency)
- Skill extraction is fast for typical resumes (<100KB)
- AI question generation happens asynchronously (shows loading state)
- Voice recording processes in real-time without lag
- Answers saved to Firestore with optimized queries

## Security

- No resume data stored on server (only extracted text)
- All API calls to Google Generative AI
- User answers linked to authenticated user ID
- Firestore security rules restrict access to user's own data

