// Button.test.tsx - Test for Button component
import { Button } from '@/components/ui/Button';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

describe('Button', () => {
  it('renders correctly', async () => {
    const { getByText } = await render(
      <Button>
        <Text>Click me</Text>
      </Button>
    );
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <Button onPress={onPress}>
        <Text>Click me</Text>
      </Button>
    );
    
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles', async () => {
    const { getByTestId } = await render(
      <Button variant="default" testID="button">
        <Text>Default</Text>
      </Button>
    );
    
    const button = getByTestId('button');
    expect(button).toBeTruthy();
  });

  it('is disabled when disabled prop is true', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <Button onPress={onPress} disabled>
        <Text>Disabled</Text>
      </Button>
    );
    
    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
