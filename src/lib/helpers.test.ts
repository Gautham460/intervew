import { describe, it, expect } from 'vitest';
import { cleanAiResponse } from './helpers';

describe('cleanAiResponse Utility', () => {
    it('successfully extracts a JSON array from raw text with markdown blocks', () => {
        const rawText = "Sure, here are the questions: ```json [\n  {\"question\": \"What is React?\", \"answer\": \"A frontend library.\"}\n] ``` Enjoy!";
        const result = cleanAiResponse(rawText);
        
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBe(1);
        expect(result[0].question).toBe("What is React?");
    });

    it('cleans up raw strings starting with just json', () => {
        const rawText = "json [{\"question\": \"Q1\", \"answer\": \"A1\"}]";
        const result = cleanAiResponse(rawText);
        expect(result[0].question).toBe("Q1");
    });

    it('throws an error if no JSON array is found', () => {
        const rawText = "Sorry, I cannot generate questions right now.";
        expect(() => cleanAiResponse(rawText)).toThrow("No JSON array found in response");
    });

    it('throws an error if JSON is malformed', () => {
        const rawText = "[{\"question\": \"Q1\", \"answer\": \"A1\",}]"; // Extra comma is invalid in standard JSON
        expect(() => cleanAiResponse(rawText)).toThrow("Invalid JSON format");
    });

    it('handles multi-line JSON correctly', () => {
        const rawText = "```\n[\n  {\n    \"question\": \"Q1\",\n    \"answer\": \"A1\"\n  }\n]\n```";
        const result = cleanAiResponse(rawText);
        expect(result[0].answer).toBe("A1");
    });
});
