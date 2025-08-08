import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, ButtonProps } from 'react-native-paper';

interface CustomButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

const CustomButton: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  style,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = styles.button;
    const variantStyle = styles[variant];
    const sizeStyle = styles[size];
    
    return [baseStyle, variantStyle, sizeStyle, style];
  };

  return (
    <Button
      mode={variant === 'outline' ? 'outlined' : 'contained'}
      style={getButtonStyle()}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    marginVertical: 5,
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#6C757D',
  },
  outline: {
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
});

export default CustomButton; 