// Button.test.tsx - Test for Button component
import { Button } from '@/components/ui/Button';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button>
        <Text>Click me</Text>
      </Button>
    );
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress}>
        <Text>Click me</Text>
      </Button>
    );
    
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles', () => {
    const { getByTestId } = render(
      <Button variant="primary" testID="button">
        <Text>Primary</Text>
      </Button>
    );
    
    const button = getByTestId('button');
    expect(button).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} disabled>
        <Text>Disabled</Text>
      </Button>
    );
    
    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
