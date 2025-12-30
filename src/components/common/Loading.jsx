import styled, { keyframes } from 'styled-components';
import { Spinner } from 'react-bootstrap';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
  gap: 1rem;
`;

const LoadingSpinner = styled(Spinner)`
  animation: ${spin} 1s linear infinite;
`;

const Loading = ({ message = 'Loading...' }) => {
  return (
    <LoadingContainer>
      <LoadingSpinner animation="border" role="status" variant="primary" />
      <div>{message}</div>
    </LoadingContainer>
  );
};

export default Loading;

