import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResumeBuilderPage from './resume-builder-page';

// Mock html2canvas and jspdf to prevent errors during test
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: () => 'data:image/png;base64,fake',
  }),
}));

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    getImageProperties: () => ({ width: 100, height: 100 }),
    internal: { pageSize: { getWidth: () => 210 } },
    addImage: vi.fn(),
    save: vi.fn(),
  })),
}));

vi.mock('@/lib/resume-analysis', () => ({
  analyzeResume: vi.fn().mockResolvedValue({
    overallScore: 85,
    atsScore: 80,
    contentScore: 85,
    keywordScore: 75,
    strengths: ['Strong React skills', 'Good experience'],
    improvements: ['Add more metrics'],
    missingKeywords: ['AWS'],
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ResumeBuilderPage', () => {
  it('renders the empty profile layout', () => {
    render(<ResumeBuilderPage />);
    
    // Check if sections are rendered empty
    expect(screen.getByText(/Languages & Tools:/)).not.toBeNull();
  });

  it('updates the profile name when input changes', () => {
    render(<ResumeBuilderPage />);
    
    // Find the name input
    const nameInput = screen.getByPlaceholderText('Full Name');
    
    // Change the name to Jane Smith
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
    
    // Verify it updated in the preview
    expect(screen.getByText('Jane Smith')).not.toBeNull();
  });

  it('adds a new skill when Add button is clicked', () => {
    render(<ResumeBuilderPage />);
    
    const skillInput = screen.getByPlaceholderText('Add a skill...');
    const addButtons = screen.getAllByText('Add');
    // The second Add button is for skills
    const skillAddButton = addButtons[1];
    
    fireEvent.change(skillInput, { target: { value: 'Python' } });
    fireEvent.click(skillAddButton);
    
    // Verify the new skill is added
    expect(screen.getAllByText(/Python/)[0]).not.toBeNull();
  });
});
