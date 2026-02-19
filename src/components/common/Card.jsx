import styled from 'styled-components';

const StyledCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${props => props.$hoverable && `
    cursor: pointer;
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(31, 38, 135, 0.1);
      border-color: #e2e8f0;
    }
  `}
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
`;

const CardTitle = styled.h5`
  margin: 0;
  font-weight: 700;
  color: var(--text-main);
  font-family: var(--font-heading);
`;

const CardBody = styled.div`
  color: var(--text-muted);
  font-family: var(--font-body);
`;

const CardFooter = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
`;

export const Card = ({ children, ...props }) => {
  return <StyledCard {...props}>{children}</StyledCard>;
};

export { CardHeader, CardTitle, CardBody, CardFooter };
export default Card;

