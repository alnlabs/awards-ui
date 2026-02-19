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
    font-weight: 800;
    font-size: 1.8rem;
    color: var(--text-main);
    font-family: var(--font-heading);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    letter-spacing: -0.025em;

    svg {
      color: #6366f1;
    }
  }

  p {
    margin: 0.25rem 0 0;
    font-size: 1rem;
    color: var(--text-muted);
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
