import { useState } from 'react';
import { Container, Navbar, Nav, NavDropdown, Offcanvas } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import styled from 'styled-components';
import { BiMenu, BiHome, BiTrophy, BiUser, BiListUl, BiBook, BiLogOut } from 'react-icons/bi';
import { USER_ROLES } from '../../utils/constants';

const StyledNavbar = styled(Navbar)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .navbar-brand {
    font-weight: 700;
    font-size: 1.5rem;
    color: white !important;
  }
`;

const Sidebar = styled.div`
  position: fixed;
  left: 0;
  top: 56px;
  height: calc(100vh - 56px);
  width: 250px;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 1rem;
  overflow-y: auto;
  z-index: 1000;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    transform: ${props => props.open ? 'translateX(0)' : 'translateX(-100%)'};
  }

  @media (min-width: 769px) {
    transform: translateX(0);
  }
`;

const SidebarItem = styled.div`
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${props => props.active ? '#667eea' : '#495057'};
  background: ${props => props.active ? '#e7e9fd' : 'transparent'};
  font-weight: ${props => props.active ? '600' : '400'};

  &:hover {
    background: ${props => props.active ? '#e7e9fd' : '#e9ecef'};
    transform: translateX(4px);
  }

  svg {
    font-size: 1.25rem;
  }
`;

const MainContent = styled.div`
  margin-left: 0;
  padding: 2rem 1rem;
  min-height: calc(100vh - 56px);

  @media (min-width: 769px) {
    margin-left: 250px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.show ? 'block' : 'none'};

  @media (min-width: 769px) {
    display: none;
  }
`;

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BiHome, roles: [USER_ROLES.HR, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE, USER_ROLES.PANEL] },
    { path: '/cycles', label: 'Cycles', icon: BiBook, roles: [USER_ROLES.HR, USER_ROLES.MANAGER] },
    { path: '/nominations', label: 'Nominations', icon: BiListUl, roles: [USER_ROLES.HR, USER_ROLES.MANAGER, USER_ROLES.PANEL] },
    { path: '/awards', label: 'Awards', icon: BiTrophy, roles: [USER_ROLES.HR, USER_ROLES.EMPLOYEE] },
  ];

  if (user?.role === USER_ROLES.HR) {
    menuItems.push({ path: '/users', label: 'Users', icon: BiUser, roles: [USER_ROLES.HR] });
  }

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      <StyledNavbar expand="lg" variant="dark" fixed="top">
        <Container fluid>
          <Navbar.Brand>
            <BiTrophy style={{ marginRight: '0.5rem', fontSize: '1.5rem' }} />
            Employee Awards
          </Navbar.Brand>
          <div className="d-flex align-items-center gap-3">
            <NavDropdown title={user?.name || 'User'} id="user-dropdown" align="end">
              <NavDropdown.Item onClick={() => navigate('/profile')}>
                <BiUser style={{ marginRight: '0.5rem' }} />
                Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <BiLogOut style={{ marginRight: '0.5rem' }} />
                Logout
              </NavDropdown.Item>
            </NavDropdown>
            <BiMenu
              style={{ fontSize: '1.5rem', cursor: 'pointer' }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
        </Container>
      </StyledNavbar>

      <Overlay show={sidebarOpen} onClick={() => setSidebarOpen(false)} />

      <Sidebar open={sidebarOpen}>
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
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
              <span>{item.label}</span>
            </SidebarItem>
          );
        })}
      </Sidebar>

      <MainContent>
        {children}
      </MainContent>
    </>
  );
};

export default DashboardLayout;

