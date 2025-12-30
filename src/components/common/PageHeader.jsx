import styled from "styled-components";

/* =====================
   Styled Components
===================== */

const HeaderWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.75rem;
`;

const HeaderLeft = styled.div`
  h1 {
    margin: 0;
    font-weight: 700;
    font-size: 1.6rem;
    color: #212529;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: #6c757d;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

/* =====================
   Component
===================== */

const PageHeader = ({ icon: Icon, title, subtitle, actions }) => {
  return (
    <HeaderWrapper>
      <HeaderLeft>
        <h1>
          {Icon && <Icon />}
          {title}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </HeaderLeft>

      {actions && <HeaderActions>{actions}</HeaderActions>}
    </HeaderWrapper>
  );
};

export default PageHeader;
