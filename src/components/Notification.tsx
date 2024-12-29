import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const NotificationWrapper = styled.div<{ type: string; isClosing: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  background-color: ${({ type }) => {
    switch (type) {
      case 'success':
        return 'var(--success-color)';
      case 'error':
        return 'var(--error-color)';
      default:
        return 'var(--secondary-color)';
    }
  }};
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: ${({ isClosing }) => (isClosing ? slideOut : slideIn)} 0.3s ease-in-out;
  max-width: calc(100vw - 40px);

  @media (max-width: 768px) {
    top: auto;
    bottom: 20px;
    right: 50%;
    transform: translateX(50%);
    width: calc(100% - 40px);
    text-align: center;
    justify-content: center;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.2rem;
  margin-left: 0.5rem;
  opacity: 0.8;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const Notification: React.FC<NotificationProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <NotificationWrapper type={type} isClosing={isClosing}>
      {message}
      <CloseButton onClick={handleClose} aria-label="Cerrar notificación">
        ×
      </CloseButton>
    </NotificationWrapper>
  );
};

export default Notification; 