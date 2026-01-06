import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { USER_ROLES } from '../../utils/constants';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    // Check if user's main role is allowed
    const hasMainRole = allowedRoles.includes(user.role);
    
    // If PANEL is allowed, also check if user is a panel member (sub-role)
    const isPanelAllowed = allowedRoles.includes(USER_ROLES.PANEL);
    const isPanelMember = user.is_panel_member === true;
    
    if (!hasMainRole && !(isPanelAllowed && isPanelMember)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

