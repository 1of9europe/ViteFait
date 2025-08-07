import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingSpinner from '../../src/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    const { getByText } = render(<LoadingSpinner />);
    expect(getByText('Chargement...')).toBeTruthy();
  });

  it('should render with custom message', () => {
    const customMessage = 'Veuillez patienter...';
    const { getByText } = render(<LoadingSpinner message={customMessage} />);
    expect(getByText(customMessage)).toBeTruthy();
  });

  it('should render with different sizes', () => {
    const { getByText } = render(<LoadingSpinner size="small" />);
    expect(getByText('Chargement...')).toBeTruthy();
  });

  it('should render with custom color', () => {
    const { getByText } = render(<LoadingSpinner color="#FF0000" />);
    expect(getByText('Chargement...')).toBeTruthy();
  });
}); 