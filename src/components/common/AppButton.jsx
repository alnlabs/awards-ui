import styled, { css } from "styled-components";
import Button from "react-bootstrap/Button";

/* =====================
   Styled Button
===================== */

const StyledButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;

  ${({ size }) =>
    size === "sm" &&
    css`
      padding: 0.25rem 0.6rem;
      font-size: 0.85rem;
    `}

  ${({ size }) =>
    size === "lg" &&
    css`
      padding: 0.6rem 1.25rem;
      font-size: 1rem;
    `}

  svg {
    font-size: 1.1em;
    line-height: 1;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

/* =====================
   Component
===================== */

const AppButton = ({
  children,
  icon: Icon,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) => {
  return (
    <StyledButton
      type={type}
      variant={variant}
      size={size === "md" ? undefined : size}
      disabled={disabled || loading}
      {...props}
    >
      {Icon && <Icon />}
      {loading ? "Please wait..." : children}
    </StyledButton>
  );
};

export default AppButton;
