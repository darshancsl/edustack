import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import App from '../App';

test('renders main heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading');
  expect(heading).toBeInTheDocument();
});
