import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormMockInterview } from './form-mock-interview';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { addDoc } from 'firebase/firestore';

// Mock all external modules
vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(),
  ClerkProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  updateDoc: vi.fn(),
}));

vi.mock('@/config/firebase.config', () => ({
  db: {},
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

// Mock custom components/libs
vi.mock('./resume-upload', () => ({
  ResumeUpload: () => <div data-testid="resume-upload">Resume Upload Mapped</div>,
}));

describe('FormMockInterview Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ userId: 'test-user-123' });
    (addDoc as any).mockResolvedValue({ id: 'new-interview-id' });
  });

  it('verifies integration between form fields, AI generation, and Firestore database saving', async () => {
    render(
      <MemoryRouter>
        <FormMockInterview initialData={null} />
      </MemoryRouter>
    );

    // 1. Check if the form renders with default state
    expect(screen.getByText(/Create a new mock interview/i)).toBeDefined();
    
    // 2. Fill out necessary form fields
    fireEvent.change(screen.getByPlaceholderText(/eg:- Full Stack Developer/i), {
      target: { value: 'Frontend Engineer' }
    });
    
    fireEvent.change(screen.getByPlaceholderText(/eg:- React, Typescript.../i), {
      target: { value: 'React, Vitest' }
    });
    
    fireEvent.change(screen.getByPlaceholderText(/eg:- 5 Years/i), {
      target: { value: '3' }
    });
    
    fireEvent.change(screen.getByPlaceholderText(/eg:- describle your job role/i), {
      target: { value: 'Looking for someone who can write unit and integration tests successfully.' }
    });

    // 3. Trigger form submission directly on the form element to bypass disabled button if needed
    const formElement = screen.getByLabelText('Interview Form');
    fireEvent.submit(formElement);

    // 4. Verify database saving (Integration point with Firebase Firestore)
    // Increase timeout or check for errors
    await waitFor(() => {
      const errorMessages = screen.queryAllByRole('alert'); // Shadcn often uses role="alert" or specific classes
      if (errorMessages.length > 0) {
        console.error("Validation Errors Found:", errorMessages.map(e => e.textContent));
      }
      expect(addDoc).toHaveBeenCalled();
    }, { timeout: 10000 });

    const callArgs = (addDoc as any).mock.calls[0];
    const savedData = callArgs[1];

    expect(savedData.userId).toBe('test-user-123');
    expect(savedData.position).toBe('Frontend Engineer');
    expect(savedData.techStack).toBe('React, Vitest');
    expect(savedData.experience).toBe(3);
    
    // Check if the AI generated questions were integrated into the save result
    expect(savedData.questions[0].question).toBe('Q1');
  }, 15000);
});
