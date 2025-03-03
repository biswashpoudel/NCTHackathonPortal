import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '..src/Dashboard'; 
import axios from 'axios';

jest.mock('axios');

describe('Dashboard Component', () => {
  beforeEach(() => {
  
    localStorage.setItem('username', 'testUser ');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard with greeting', () => {
    render(<Dashboard />);
    expect(screen.getByText(/hi, testuser/i)).toBeInTheDocument();
  });

  test('fetches and displays user submissions', async () => {
    
    axios.get.mockResolvedValueOnce({
      data: [
        { _id: '1', filename: 'submission1.pdf', uploadedBy: 'testUser ', groupName: 'Group A' },
        { _id: '2', filename: 'submission2.pdf', uploadedBy: 'testUser ', groupName: 'Group B' },
      ],
    });

    render(<Dashboard />);

    
    await waitFor(() => {
      expect(screen.getByText(/submission1.pdf/i)).toBeInTheDocument();
      expect(screen.getByText(/submission2.pdf/i)).toBeInTheDocument();
    });
  });

  test('handles file upload', async () => {
    
    axios.post.mockResolvedValueOnce({ data: { message: 'File uploaded successfully' } });

    render(<Dashboard />);

    const fileInput = screen.getByLabelText(/file upload/i);
    const file = new File(['dummy content'], 'testfile.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const submitButton = screen.getByText(/submit/i);
    fireEvent.click(submitButton);

  
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/upload'), expect.any(FormData));
      expect(screen.getByText(/file uploaded successfully/i)).toBeInTheDocument();
    });
  });
});