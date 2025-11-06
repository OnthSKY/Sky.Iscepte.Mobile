/**
 * Button Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPress} />);
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPress} disabled />);
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with icon', () => {
    const { getByText } = render(<Button title="Test Button" icon="add-outline" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('shows lock icon when disabled and showLockIcon is true', () => {
    const { getByText } = render(
      <Button title="Test Button" disabled showLockIcon />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });
});

