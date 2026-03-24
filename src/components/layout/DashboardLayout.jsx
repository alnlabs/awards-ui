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

import { logout, switchRole } from "../../store/slices/authSlice";
import { USER_ROLES } from "../../utils/constants";

/* =====================
   Constants
===================== */
const NAVBAR_HEIGHT = 56;
const SIDEBAR_WIDTH = 260;

import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

/* =====================
   Styled Components
===================== */

const StyledNavbar = styled(Navbar)`
  height: ${NAVBAR_HEIGHT}px;
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

  .navbar-brand {
    font-weight: 800;
    font-size: 1.3rem;
    color: var(--text-main) !important;
    display: flex;
    align-items: center;
    font-family: var(--font-heading);
    letter-spacing: -0.025em;

    svg {
      color: #6366f1;
    }
  }

  .nav-link, .dropdown-toggle {
    color: var(--text-main) !important;
    font-weight: 600;
    font-size: 0.95rem;
  }
`;

const Sidebar = styled.aside`
  position: fixed;
  top: ${NAVBAR_HEIGHT}px;
  left: 0;
  height: calc(100vh - ${NAVBAR_HEIGHT}px);
  width: ${SIDEBAR_WIDTH}px;
  background: white;
  border-right: 1px solid #f1f5f9;
  padding: 1.5rem 1rem;
  overflow-y: auto;
  z-index: 1000;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    transform: ${(props) =>
      props.open ? "translateX(0)" : "translateX(-100%)"};
    box-shadow: ${(props) =>
      props.open ? "20px 0 40px rgba(0,0,0,0.1)" : "none"};
  }
`;

const SidebarItem = styled(Nav.Link)`
  padding: 0.875rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.95rem;
  font-weight: 600;

  color: ${(props) => (props.active ? "#6366f1" : "var(--text-muted)")} !important;
  background: ${(props) => (props.active ? "rgba(99, 102, 241, 0.08)" : "transparent")};

  &:hover {
    background: ${(props) => (props.active ? "rgba(99, 102, 241, 0.12)" : "#f8fafc")};
    color: ${(props) => (props.active ? "#4f46e5" : "var(--text-main)")} !important;
    transform: translateX(4px);
  }

  svg {
    font-size: 1.35rem;
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;

const MainContent = styled.main`
  padding-top: ${NAVBAR_HEIGHT + 24}px;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  padding-bottom: 3rem;
  min-height: calc(100vh - ${NAVBAR_HEIGHT}px);
  background: #f8fafc;
  margin-left: 0;

  @media (min-width: 769px) {
    margin-left: ${SIDEBAR_WIDTH}px;
  }

  @media (max-width: 768px) {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
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
        USER_ROLES.SUPER_ADMIN,
        USER_ROLES.MANAGER,
        USER_ROLES.EMPLOYEE,
        USER_ROLES.PANEL,
      ],
    },
    {
      path: "/cycles",
      label: "Cycles",
      icon: BiBook,
      roles: [USER_ROLES.HR, USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER],
    },
    {
      path: "/panels",
      label: "Panels",
      icon: BiGroup,
      roles: [USER_ROLES.HR, USER_ROLES.SUPER_ADMIN],
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
      roles: [USER_ROLES.HR, USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER],
    },
    {
      path: "/awards",
      label: "Awards",
      icon: BiTrophy,
      roles: [
        USER_ROLES.HR,
        USER_ROLES.SUPER_ADMIN,
        USER_ROLES.MANAGER,
        USER_ROLES.EMPLOYEE,
        USER_ROLES.PANEL,
      ],
    },
    {
      path: "/users",
      label: "Users",
      icon: BiUser,
      roles: [USER_ROLES.HR, USER_ROLES.SUPER_ADMIN],
    },
    {
      path: "/criteria",
      label: "Criteria",
      icon: BiListUl,
      roles: [USER_ROLES.HR, USER_ROLES.SUPER_ADMIN],
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
      <StyledNavbar fixed="top" variant="light">
        <Container fluid>
          <Navbar.Brand>
            <BiTrophy style={{ marginRight: "0.75rem" }} />
            Awards Portal
          </Navbar.Brand>

          <div className="d-flex align-items-center gap-2">
            <NavDropdown
              title={
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                  {user?.name || "User"}
                </span>
              }
              align="end"
              menuVariant="light"
            >
              <NavDropdown.Item onClick={() => navigate("/profile")} className="py-2">
                <BiUser className="me-2 text-primary" />
                Profile
              </NavDropdown.Item>

              {/* ROLE SWITCHER */}
              {user?.is_panel_member && (
                <>
                  <NavDropdown.Divider />
                  {user?.role === USER_ROLES.PANEL ? (
                    <NavDropdown.Item 
                      onClick={() => dispatch(switchRole(user.main_role))}
                      className="py-2 fw-bold text-primary"
                    >
                      <BiHome className="me-2" />
                      Switch to {user.main_role} View
                    </NavDropdown.Item>
                  ) : (
                    <NavDropdown.Item 
                      onClick={() => dispatch(switchRole(USER_ROLES.PANEL))}
                      className="py-2 fw-bold text-success"
                    >
                      <BiTrophy className="me-2" />
                      Switch to Panel View
                    </NavDropdown.Item>
                  )}
                </>
              )}

              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="py-2 text-danger">
                <BiLogOut className="me-2" />
                Logout
              </NavDropdown.Item>
            </NavDropdown>

            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: '#f1f5f9',
                transition: 'background 0.2s'
              }}
              className="d-md-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <BiMenu style={{ fontSize: "1.4rem", color: "var(--text-main)" }} />
            </div>
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
              as={Link}
              to={item.path}
              active={isActive}
              onClick={() => {
                setSidebarOpen(false);
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </SidebarItem>
          );
        })}
      </Sidebar>

      <MainContent>{children}</MainContent>
    </>
  );
};

export default DashboardLayout;
