# Task Plan: Connect Resume Upload Module to Other Modules

## Task Summary
Connect the resume upload module so that when a user uploads their resume, it will:
1. Set the skill section difficulty to "medium"
2. Allow user to enter preferred company
3. Show functionality options to choose from after upload

## Information Gathered

### Current Architecture:
1. **resume-upload.tsx** - Component that extracts skills from resume, calls `onSkillsExtracted` callback
2. **form-mock-interview.tsx** - Uses ResumeUpload, fetches skill questions from database
3. **skill-questions-db.ts** - Fetches questions from Firestore `skillQuestions` collection
4. **types/index.ts** - Interview type definition

### Current Flow:
1. User uploads resume → skills extracted via resume-parser
2. Skills passed to form-mock-interview via onSkillsExtracted
3. Skills used to auto-fill techStack field
4. skillQuestions fetched from database and stored with interview

## Plan

### 1. Update ResumeUpload Component
- Add state for: difficulty (default "medium"), preferredCompany
- Add UI to input preferred company after skill extraction
- Add functionality selection buttons after upload

### 2. Update ResumeUpload Props Interface
- Add callbacks: onDifficultyChange, onCompanyChange, onFunctionalitySelect

### 3. Update form-mock-interview.tsx
- Handle new props from ResumeUpload
- Pass difficulty and preferred company to skill questions fetch
- Add functionality selection UI

### 4. Update skill-questions-db.ts
- Add difficulty and company filters to fetch functions

### 5. Update Types
- Add difficulty and preferredCompany to Interview type

## Files to Edit:
1. `Intervue/src/components/resume-upload.tsx` - Add difficulty/company selection UI
2. `Intervue/src/components/form-mock-interview.tsx` - Handle new selections
3. `Intervue/src/lib/skill-questions-db.ts` - Filter by difficulty/company
4. `Intervue/src/types/index.ts` - Add new fields

## Followup Steps:
- Test the resume upload flow
- Verify difficulty is set to "medium" by default
- Verify preferred company can be entered
- Verify functionality selection works
