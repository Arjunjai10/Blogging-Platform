import React from 'react';
import { Box, CircularProgress, Typography, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

// Define keyframes for the pulse animation
const pulse = keyframes`
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
`;

// Define keyframes for the spin animation
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Styled components
const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  width: '100%',
  padding: theme.spacing(4),
  animation: `${pulse} 2s ease-in-out infinite`,
}));

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  animation: `${spin} 1.5s linear infinite`,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
  },
}));

const LoadingText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(2),
  textAlign: 'center',
  opacity: 0.8,
  transition: 'opacity 0.3s ease',
}));

const LoadingSpinner = ({ message = 'Loading...', size = 40 }) => {
  return (
    <LoadingContainer>
      <StyledCircularProgress size={size} thickness={4} />
      {message && (
        <LoadingText variant="body1">
          {message}
        </LoadingText>
      )}
    </LoadingContainer>
  );
};

export default LoadingSpinner; 