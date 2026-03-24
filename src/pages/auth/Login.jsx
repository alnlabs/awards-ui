import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { login } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import { BiTrophy, BiEnvelope, BiLock } from 'react-icons/bi';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  position: relative;
  overflow: hidden;
  padding: 2rem 1rem;
`;

const BackgroundBlob = styled.div`
  position: absolute;
  width: ${props => props.size || '500px'};
  height: ${props => props.size || '500px'};
  background: ${props => props.color || 'var(--primary-gradient)'};
  filter: blur(80px);
  border-radius: 50%;
  z-index: 1;
  opacity: 0.6;
  animation: float 20s infinite alternate;

  @keyframes float {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(100px, 50px) scale(1.1); }
  }
`;

const LoginCard = styled(Card)`
  max-width: 440px;
  width: 100%;
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--glass-shadow);
  z-index: 10;
  overflow: hidden;
  animation: fadeIn 0.8s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;

  .icon-wrapper {
    width: 80px;
    height: 80px;
    background: var(--primary-gradient);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
    
    svg {
      font-size: 3rem;
      color: white;
    }
  }

  h2 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-main);
    letter-spacing: -0.025em;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-muted);
    font-size: 1.1rem;
    margin: 0;
  }
`;

const StyledFormGroup = styled(Form.Group)`
  margin-bottom: 1.5rem;

  .form-label {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-main);
    margin-bottom: 0.5rem;
    display: block;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    svg {
      position: absolute;
      left: 1rem;
      color: var(--text-muted);
      font-size: 1.25rem;
      transition: color 0.2s;
    }

    .form-control {
      padding: 0.75rem 3.5rem 0.75rem 3rem;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      background: white;
      font-size: 1rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        color: var(--text-main);

        & + svg {
          color: #6366f1;
        }
      }

      &::placeholder {
        color: #94a3b8;
      }
    }

    .visibility-toggle {
      position: absolute;
      right: 1rem;
      left: auto;
      cursor: pointer;
      color: var(--text-muted);
      font-size: 1.25rem;
      transition: color 0.2s;
      z-index: 5;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #6366f1;
      }
    }
  }
`;

const StyledButton = styled(Button)`
  width: 100%;
  padding: 0.875rem;
  font-weight: 700;
  font-size: 1rem;
  background: var(--primary-gradient);
  border: none;
  border-radius: 12px;
  margin-top: 1rem;
  color: white;
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.95rem;
  color: var(--text-muted);

  a {
    color: #6366f1;
    text-decoration: none;
    font-weight: 700;
    transition: color 0.2s;

    &:hover {
      color: #4f46e5;
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.auth);
  
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleEmailBlur = async () => {
    if (!email) return;
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${apiBaseUrl}/auth/user-roles/${email}`);
      const payload = await response.json();
      if (payload.status === "success") {
        const roles = payload.data.roles;
        setAvailableRoles(roles);
        if (roles.length > 0 && !selectedRole) {
          setSelectedRole(roles[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(login({ 
        email, 
        password, 
        role: selectedRole 
      })).unwrap();
      if (result) {
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err || 'Login failed');
    }
  };

  return (
    <LoginContainer>
      <BackgroundBlob 
        color="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" 
        size="600px" 
        style={{ top: '-10%', left: '-10%' }} 
      />
      <BackgroundBlob 
        color="linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)" 
        size="400px" 
        style={{ bottom: '-5%', right: '-5%', animationDelay: '-5s' }} 
      />
      
      <LoginCard>
        <Card.Body className="p-4 p-md-5">
          <LogoContainer>
            <div className="icon-wrapper">
              <BiTrophy />
            </div>
            <h2>Awards Portal</h2>
            <p>Welcome back, please login</p>
          </LogoContainer>

          {error && <Alert variant="danger" className="rounded-3 border-0 shadow-sm mb-4">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <StyledFormGroup>
              <Form.Label>Email Address</Form.Label>
              <div className="input-wrapper">
                <Form.Control
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  required
                />
                <BiEnvelope />
              </div>
            </StyledFormGroup>

            {availableRoles.length > 1 && (
              <StyledFormGroup>
                <Form.Label>Select Role</Form.Label>
                <div className="input-wrapper">
                  <Form.Select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '1rem' }}
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>
                        {role === "PANEL" ? "Panel Member" : role}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </StyledFormGroup>
            )}

            <StyledFormGroup>
              <Form.Label>Password</Form.Label>
              <div className="input-wrapper">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <BiLock />
                <div 
                  className="visibility-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <BsEyeSlash /> : <BsEye />}
                </div>
              </div>
            </StyledFormGroup>

            <StyledButton type="submit" disabled={loading}>
              {loading ? (
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Authenticating...
                </div>
              ) : 'Sign In'}
            </StyledButton>
          </Form>

          <LoginLink>
            Don't have an account? <a href="/register">Request Access</a>
          </LoginLink>
          <LoginLink style={{ marginTop: '0.75rem' }}>
            <a href="/forgot-password">Forgot password?</a>
          </LoginLink>
        </Card.Body>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
