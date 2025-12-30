import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { login } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import { BiTrophy, BiEnvelope, BiLock } from 'react-icons/bi';

const LoginContainer = styled(Container)`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
`;

const LoginCard = styled(Card)`
  max-width: 400px;
  width: 100%;
  border: none;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const LoginCardBody = styled(Card.Body)`
  padding: 2.5rem;
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  svg {
    font-size: 4rem;
    color: #667eea;
    margin-bottom: 1rem;
  }

  h2 {
    color: #212529;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  p {
    color: #6c757d;
    margin: 0;
  }
`;

const StyledFormGroup = styled(Form.Group)`
  margin-bottom: 1.5rem;

  .form-label {
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
  }

  .input-group {
    .input-group-text {
      background: #f8f9fa;
      border-right: none;
      border-color: #ced4da;
    }

    .form-control {
      border-left: none;
      padding-left: 0;

      &:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);

        + .input-group-text,
        ~ .input-group-text {
          border-color: #667eea;
        }
      }
    }
  }
`;

const StyledButton = styled(Button)`
  width: 100%;
  padding: 0.75rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  margin-top: 1rem;

  &:hover {
    background: linear-gradient(135deg, #5568d3 0%, #654291 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #6c757d;

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(login({ email, password })).unwrap();
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
      <LoginCard>
        <LoginCardBody>
          <LogoContainer>
            <BiTrophy />
            <h2>Employee Awards</h2>
            <p>Welcome back</p>
          </LogoContainer>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <StyledFormGroup>
              <Form.Label>Email</Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <BiEnvelope />
                </span>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </StyledFormGroup>

            <StyledFormGroup>
              <Form.Label>Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <BiLock />
                </span>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </StyledFormGroup>

            <StyledButton type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </StyledButton>
          </Form>

          <LoginLink>
            Don't have an account? <a href="/register">Register</a>
          </LoginLink>
          <LoginLink style={{ marginTop: '0.5rem' }}>
            <a href="/forgot-password">Forgot password?</a>
          </LoginLink>
        </LoginCardBody>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;

