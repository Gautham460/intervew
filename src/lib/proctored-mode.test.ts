import { describe, it, expect } from 'vitest';
import { calculateProctorScore, ProctorSession } from './proctored-mode';

describe('calculateProctorScore', () => {
    const mockQuestions = [
        "What is the difference between SQL and NoSQL databases?"
    ];

    it('calculates a basic score for a short answer with no keywords', () => {
        const session: Partial<ProctorSession> = {
            answers: [{ questionIndex: 0, answer: "I don't know much about this topic.", timeSpent: 30, confidence: 5, flagged: false }],
            violations: []
        };
        const score = calculateProctorScore(session as ProctorSession, mockQuestions);
        // Length < 50: 0 points. Keywords matches: 0 points. Total: 0.
        expect(score).toBe(0);
    });

    it('calculates a score for an answer with keywords and length', () => {
        const session: Partial<ProctorSession> = {
            answers: [{ 
                questionIndex: 0, 
                answer: "SQL is relational and uses a fixed schema, while NoSQL is for unstructured data and is good for horizontal scaling using a document store.", 
                timeSpent: 60, confidence: 8, flagged: false 
            }],
            violations: []
        };
        // Length: 130 chars (>100): 20 points
        // Keywords in SQL/NoSQL Q: ["schema", "structured", "unstructured", "scaling", "horizontal", "vertical", "acid", "document", "relational", "flexibility"]
        // Matches: schema, unstructured, scaling, horizontal, document, relational (6 matches)
        // Keyword score: 6 * 10 = 60
        // Total: 20 + 60 = 80
        const score = calculateProctorScore(session as ProctorSession, mockQuestions);
        expect(score).toBe(80);
    });

    it('applies penalties for violations', () => {
        const session: Partial<ProctorSession> = {
            answers: [{ 
                questionIndex: 0, 
                answer: "SQL is relational and uses a fixed schema, while NoSQL is for unstructured data and is good for horizontal scaling using a document store.", 
                timeSpent: 60, confidence: 8, flagged: false 
            }],
            violations: [
                { type: 'tab-switch', timestamp: new Date(), severity: 'warning', description: 'Tab switched' }, // -5
                { type: 'face-not-detected', timestamp: new Date(), severity: 'critical', description: 'Face look away' } // -15
            ]
        };
        // Content score was 80. Penalty: 5 + 15 = 20.
        // Final: 80 - 20 = 60.
        const score = calculateProctorScore(session as ProctorSession, mockQuestions);
        expect(score).toBe(60);
    });

    it('returns 0 for no answers', () => {
        const session: Partial<ProctorSession> = {
            answers: [],
            violations: []
        };
        const score = calculateProctorScore(session as ProctorSession, mockQuestions);
        expect(score).toBe(0);
    });

    it('never returns below 0', () => {
        const session: Partial<ProctorSession> = {
            answers: [],
            violations: [{ type: 'audio-off', timestamp: new Date(), severity: 'critical', description: 'Mic off' }]
        };
        const score = calculateProctorScore(session as ProctorSession, mockQuestions);
        expect(score).toBe(0);
    });
});
