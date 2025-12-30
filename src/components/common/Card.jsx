import styled from 'styled-components';

const StyledCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
`;

const CardTitle = styled.h5`
  margin: 0;
  font-weight: 600;
  color: #212529;
`;

const CardBody = styled.div`
  color: #6c757d;
`;

const CardFooter = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

export const Card = ({ children, ...props }) => {
  return <StyledCard {...props}>{children}</StyledCard>;
};

export { CardHeader, CardTitle, CardBody, CardFooter };
export default Card;

