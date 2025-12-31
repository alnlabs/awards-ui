import { useState } from "react";
import { Container, Navbar, NavDropdown } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import {
  BiMenu,
  BiHome,
  BiTrophy,
  BiUser,
  BiListUl,
  BiBook,
  BiGroup,
  BiLogOut,
  BiTask,
} from "react-icons/bi";

import { logout } from "../../store/slices/authSlice";
import { USER_ROLES } from "../../utils/constants";

/* =====================
   Constants
===================== */
const NAVBAR_HEIGHT = 56;
const SIDEBAR_WIDTH = 260;

/* =====================
   Styled Components
===================== */

const StyledNavbar = styled(Navbar)`
  height: ${NAVBAR_HEIGHT}px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);

  .navbar-brand {
    font-weight: 700;
    font-size: 1.4rem;
    color: white !important;
    display: flex;
    align-items: center;
  }
`;

const Sidebar = styled.aside`
  position: fixed;
  top: ${NAVBAR_HEIGHT}px;
  left: 0;
  height: calc(100vh - ${NAVBAR_HEIGHT}px);
  width: ${SIDEBAR_WIDTH}px;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 1rem 0.75rem;
  overflow-y: auto;
  z-index: 1000;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    transform: ${(props) =>
      props.open ? "translateX(0)" : "translateX(-100%)"};
  }
`;

const SidebarItem = styled.div`
  padding: 0.75rem 1rem;
  margin-bottom: 0.35rem;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  font-size: 0.95rem;

  color: ${(props) => (props.active ? "#4c5fd7" : "#495057")};
  background: ${(props) => (props.active ? "#e7e9fd" : "transparent")};
  font-weight: ${(props) => (props.active ? "600" : "400")};

  &:hover {
    background: #e9ecef;
    transform: translateX(4px);
  }

  svg {
    font-size: 1.25rem;
  }
`;

const MainContent = styled.main`
  padding-top: ${NAVBAR_HEIGHT + 16}px;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-bottom: 2rem;
  min-height: calc(100vh - ${NAVBAR_HEIGHT}px);
  margin-left: 0;

  @media (min-width: 769px) {
    margin-left: ${SIDEBAR_WIDTH}px;
  }

  @media (max-width: 768px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: ${NAVBAR_HEIGHT}px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
  display: ${(props) => (props.show ? "block" : "none")};

  @media (min-width: 769px) {
    display: none;
  }
`;

/* =====================
   Layout Component
===================== */

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  /* =====================
     Menu Configuration (✅ UPDATED)
  ===================== */

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: BiHome,
      roles: [
        USER_ROLES.HR,
        USER_ROLES.MANAGER,
        USER_ROLES.EMPLOYEE,
        USER_ROLES.PANEL,
      ],
    },
    {
      path: "/cycles",
      label: "Cycles",
      icon: BiBook,
      roles: [USER_ROLES.HR, USER_ROLES.MANAGER],
    },
    {
      path: "/panels",
      label: "Panels",
      icon: BiGroup,
      roles: [USER_ROLES.HR],
    },
    {
      path: "/reviews", // ✅ FIXED
      label: "My Assignments",
      icon: BiTask,
      roles: [USER_ROLES.PANEL],
    },
    {
      path: "/nominations",
      label: "Nominations",
      icon: BiListUl,
      roles: [USER_ROLES.HR, USER_ROLES.MANAGER],
    },
    {
      path: "/awards",
      label: "Awards",
      icon: BiTrophy,
      roles: [USER_ROLES.HR, USER_ROLES.EMPLOYEE],
    },
    {
      path: "/users",
      label: "Users",
      icon: BiUser,
      roles: [USER_ROLES.HR],
    },
    {
      path: "/criteria",
      label: "Criteria",
      icon: BiListUl,
      roles: [USER_ROLES.HR],
    },
  ];

  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  /* =====================
     Render
  ===================== */

  return (
    <>
      <StyledNavbar fixed="top" variant="dark">
        <Container fluid>
          <Navbar.Brand>
            <BiTrophy style={{ marginRight: "0.5rem" }} />
            Employee Awards
          </Navbar.Brand>

          <div className="d-flex align-items-center gap-3">
            <NavDropdown
              title={user?.name || "User"}
              align="end"
              menuVariant="light"
            >
              <NavDropdown.Item onClick={() => navigate("/profile")}>
                <BiUser className="me-2" />
                Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <BiLogOut className="me-2" />
                Logout
              </NavDropdown.Item>
            </NavDropdown>

            <BiMenu
              style={{
                fontSize: "1.6rem",
                cursor: "pointer",
                color: "white",
              }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
        </Container>
      </StyledNavbar>

      <Overlay show={sidebarOpen} onClick={() => setSidebarOpen(false)} />

      <Sidebar open={sidebarOpen}>
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");

          return (
            <SidebarItem
              key={item.path}
              active={isActive}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              <Icon />
              {item.label}
            </SidebarItem>
          );
        })}
      </Sidebar>

      <MainContent>{children}</MainContent>
    </>
  );
};

export default DashboardLayout;
