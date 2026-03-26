import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FormMockInterview } from '../components/form-mock-interview';
import { useAuth } from '@clerk/clerk-react';
import { addDoc } from 'firebase/firestore';

// --- STAGE 1: MOCKING THE ENVIRONMENT ---
vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(),
  ClerkProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  updateDoc: vi.fn(),
}));

vi.mock('firebase/app', () => ({
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
  initializeApp: vi.fn(),
}));

vi.mock('@/scripts', () => ({
  chatSession: {
    sendMessage: vi.fn().mockResolvedValue({
      response: {
        text: () => '```json [{"question": "Q1", "answer": "A1"}] ```'
      }
    }),
  },
}));

vi.mock('../components/resume-upload', () => ({
  ResumeUpload: () => <div data-testid="resume-upload">Resume Upload Area</div>,
}));

vi.mock('../lib/helpers', () => ({
  cleanAiResponse: (text: string) => JSON.parse(text.replace(/```json|```/g, '')),
}));

import { chatSession } from '@/scripts';

describe('Acceptance Testing (UAT): End-to-End User Journeys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ userId: 'candidate_user_001' });
    (addDoc as any).mockResolvedValue({ id: 'interview_id_123' });
  });

  it('UAT-01: Candidate successfully creates an AI-powered mock interview from scratch', async () => {
    render(
      <MemoryRouter>
        <FormMockInterview initialData={null} />
      </MemoryRouter>
    );

    // Verify Title presence
    expect(screen.getByText(/Create a new mock interview/i)).toBeDefined();

    // Fill the mandatory form fields accurately
    fireEvent.change(screen.getByPlaceholderText(/eg:- Full Stack Developer/i), { target: { value: 'Full Stack Engineer' } });
    fireEvent.change(screen.getByPlaceholderText(/eg:- 5 Years/i), { target: { value: 5 } });
    fireEvent.change(screen.getByPlaceholderText(/eg:- React, Typescript.../i), { target: { value: 'React, Node, Postgres' } });
    fireEvent.change(screen.getByPlaceholderText(/eg:- describle your job role/i), { target: { value: 'Building scalable distributed systems.' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Create/i });
    await waitFor(() => {
      expect((submitBtn as HTMLButtonElement).disabled).toBe(false);
    }, { timeout: 5000 });
    fireEvent.click(submitBtn);

    // Verify Backend Integration
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
    }, { timeout: 10000 });

    const savedData = (addDoc as any).mock.calls[0][1];
    expect(savedData.userId).toBe('candidate_user_001');
    expect(savedData.position).toBe('Full Stack Engineer');
    expect(savedData.questions.length).toBeGreaterThan(0);
    
    console.log("Acceptance Test UAT-01 Passed: Candidate creation flow verified.");
  }, 15000);

  it('UAT-02: System gracefully handles AI service unavailability using fallbacks', async () => {
    // Force AI failure
    (chatSession.sendMessage as any).mockRejectedValueOnce(new Error("AI_LIMIT_REACHED"));

    render(
      <MemoryRouter>
        <FormMockInterview initialData={null} />
      </MemoryRouter>
    );

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/eg:- Full Stack Developer/i), { target: { value: 'DevOps' } });
    fireEvent.change(screen.getByPlaceholderText(/eg:- 5 Years/i), { target: { value: '2' } });
    fireEvent.change(screen.getByPlaceholderText(/eg:- React, Typescript.../i), { target: { value: 'Docker' } });
    fireEvent.change(screen.getByPlaceholderText(/eg:- describle your job role/i), { target: { value: 'Infrastructure automation.' } });

    const submitBtn = screen.getByRole('button', { name: /Create/i });
    await waitFor(() => {
        expect((submitBtn as HTMLButtonElement).disabled).toBe(false);
    }, { timeout: 5000 });
    fireEvent.click(submitBtn);

    // Verify database was still populated (via fallback questions)
    await waitFor(() => {
        expect(addDoc).toHaveBeenCalled();
    }, { timeout: 10000 });

    const savedData = (addDoc as any).mock.calls[0][1];
    expect(savedData.questions[0].question).toContain("Can you walk me through your experience");
    
    console.log("Acceptance Test UAT-02 Passed: Resilience & Fallback mechanism verified.");
  }, 15000);
});
