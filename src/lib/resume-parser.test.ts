import { describe, it, expect, vi } from 'vitest';

// Mock pdfjs-dist to avoid JSDOM errors with DOMMatrix
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}));

import { extractSkillsFromResume, groupSkillsByCategory } from './resume-parser';

describe('Functional Testing: Resume Analysis & Skill Mapping', () => {
    
    it('TC-16: correctly identifies skills from complex resume text', () => {
        const resumeText = `
            John Doe - Senior Software Engineer
            Experince with React, TypeScript, and Node.js.
            I have also worked with AWS (EC2, S3) and managed CI/CD pipelines.
            Database knowledge: MySQL and MongoDB.
            Tools: Git, Docker, and Kubernetes.
        `;
        const analysis = extractSkillsFromResume(resumeText);
        
        // Check core skills
        expect(analysis.rawSkills).toContain('React');
        expect(analysis.rawSkills).toContain('TypeScript');
        expect(analysis.rawSkills).toContain('Node.js');
        expect(analysis.rawSkills).toContain('AWS');
        expect(analysis.rawSkills).toContain('SQL'); // MySQL maps to SQL
        expect(analysis.rawSkills).toContain('MongoDB');
        expect(analysis.rawSkills).toContain('Docker');
    });

    it('TC-17: handles special character skills like C++ and C#', () => {
        const resumeText = "Expert in C++, C#, and .NET development.";
        const analysis = extractSkillsFromResume(resumeText);
        expect(analysis.rawSkills).toContain('C++');
        expect(analysis.rawSkills).toContain('C#');
    });

    it('TC-30: groups extracted skills into correct career categories', () => {
        const skills = [
            { skill: 'React', confidence: 1 },
            { skill: 'Node.js', confidence: 1 },
            { skill: 'SQL', confidence: 1 },
            { skill: 'AWS', confidence: 1 },
            { skill: 'Docker', confidence: 1 }
        ];
        
        const grouped = groupSkillsByCategory(skills);
        
        expect(grouped['Frontend']).toContain('React');
        expect(grouped['Backend']).toContain('Node.js');
        expect(grouped['Database']).toContain('SQL');
        expect(grouped['Cloud']).toContain('AWS');
        expect(grouped['DevOps']).toContain('Docker');
    });

    it('handles overlapping keywords (e.g., JavaScript vs Java) accurately', () => {
        const resumeText = "I am a Java developer who also knows some JavaScript.";
        const analysis = extractSkillsFromResume(resumeText);
        expect(analysis.rawSkills).toContain('Java');
        expect(analysis.rawSkills).toContain('JavaScript');
    });
});
