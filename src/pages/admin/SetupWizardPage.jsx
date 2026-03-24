import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, ProgressBar, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { 
  BiRocket, 
  BiBuilding, 
  BiTrophy, 
  BiCheckCircle, 
  BiChevronRight, 
  BiChevronLeft,
  BiLoaderAlt,
  BiInfoCircle,
  BiShieldQuarter,
  BiAward
} from "react-icons/bi";
import api from "../../services/api";
import toast from "react-hot-toast";

const SetupContainer = styled.div`
  min-height: 100vh;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
  background-image: 
    radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.1) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%);
`;

const SetupHeader = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  padding: 0.75rem 2rem;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Branding = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 1.5rem;
  letter-spacing: -0.02em;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ContentArea = styled(Container)`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const SetupCard = styled(Card)`
  border: 1px solid var(--glass-border);
  border-radius: 40px;
  box-shadow: 0 40px 100px rgba(31, 38, 135, 0.1);
  overflow: hidden;
  max-width: 1100px;
  width: 100%;
  background: white;
`;

const InfoPanel = styled(Col)`
  background: var(--primary-gradient);
  color: white;
  padding: 5rem 4rem;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 86c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm76-52c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-6-20c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-10 74c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-1 74c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z' fill='white' fill-opacity='0.1' fill-rule='evenodd' text-anchor='middle'/%3E%3C/svg%3E");
    opacity: 0.5;
  }

  h2 {
    font-weight: 800;
    font-size: 2rem;
    line-height: 1.1;
    margin-bottom: 1.25rem;
    letter-spacing: -0.03em;
  }

  p {
    font-size: 1rem;
    opacity: 0.9;
    line-height: 1.5;
    margin-bottom: 2rem;
  }
`;

const FormPanel = styled(Col)`
  background: white;
  padding: 5rem 4rem;
  display: flex;
  flex-direction: column;
`;

const StepIndicator = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const StepDot = styled.div`
  height: 6px;
  flex-grow: 1;
  background: ${props => props.active ? 'var(--primary-gradient)' : '#e2e8f0'};
  border-radius: 10px;
  transition: all 0.3s ease;
`;

const EducationItem = styled.div`
  display: flex;
  gap: 1.25rem;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 1.25rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateX(10px);
    background: rgba(255, 255, 255, 0.2);
  }

  svg {
    font-size: 1.75rem;
    flex-shrink: 0;
    color: white;
  }

  div {
    font-size: 0.95rem;
    font-weight: 500;
    line-height: 1.5;
  }
`;

const PremiumFormLabel = styled(Form.Label)`
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-main);
  margin-bottom: 0.75rem;
`;

const PremiumFormControl = styled(Form.Control)`
  border: 2px solid #f1f5f9;
  background: #f8fafc;
  padding: 1rem 1.25rem;
  border-radius: 18px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus {
    background: white;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
  }
`;

const FadeIn = styled.div`
  animation: fadeIn 0.5s ease-out;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SetupWizardPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "My Organization",
    company_logo: "",
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get("/system/config");
        if (response) {
          setFormData({
            company_name: response.company_name || "My Organization",
            company_logo: response.company_logo || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch config", error);
      }
    };
    fetchConfig();
  }, []);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.patch("/system/config", {
        ...formData,
        setup_complete: true
      });

      toast.success("Platform configured successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save settings", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderInfo = () => {
    switch (step) {
      case 1:
        return (
          <FadeIn>
            <h2>Launch your awards program</h2>
            <p>Welcome to the Employee Awards Platform. In just a few steps, you'll have a fully functional recognition system ready for your team.</p>
            <EducationItem>
              <BiInfoCircle />
              <div>This wizard configures your branding and basic rules. Change them anytime in settings.</div>
            </EducationItem>
            <EducationItem>
              <BiShieldQuarter />
              <div>Your data is secure and only accessible by authorized administrators.</div>
            </EducationItem>
          </FadeIn>
        );
      case 2:
        return (
          <FadeIn>
             <h2>Make it your own</h2>
             <p>Adding your company identity helps employees feel at home and increases engagement with recognition.</p>
             <EducationItem>
               <BiBuilding />
               <div>The company name will appear in emails, certificates, and on the dashboard.</div>
             </EducationItem>
             <EducationItem>
               <BiAward />
               <div>A clear logo ensures that generated certificates look professional and official.</div>
             </EducationItem>
          </FadeIn>
        );
      case 3:
        return (
          <FadeIn>
            <h2>Almost there!</h2>
            <p>We're about to initialize your platform with professional defaults and activate your first cycle.</p>
            <EducationItem>
              <BiCheckCircle />
              <div>Automatic setup of initial award types and review forms.</div>
            </EducationItem>
            <EducationItem>
              <BiRocket />
              <div>Instant activation of your first award cycle.</div>
            </EducationItem>
          </FadeIn>
        );
      default: return null;
    }
  };

  const renderForm = () => {
    switch (step) {
      case 1:
        return (
          <FadeIn className="text-center">
            <div style={{ position: 'relative', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <img src="/Users/nageshwarreddy/.gemini/antigravity/brain/4f628fc4-723b-4a9a-8e68-80da694dbd72/setup_welcome_illustration_1773134626677.png" 
                   alt="Welcome" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h3 className="mt-5 fw-bold" style={{ letterSpacing: '-0.02em' }}>Ready to start?</h3>
            <p className="text-muted fs-5">Setup your environment in less than 2 minutes.</p>
          </FadeIn>
        );
      case 2:
        return (
          <FadeIn>
            <div className="mb-5 text-center">
               <img src="/Users/nageshwarreddy/.gemini/antigravity/brain/4f628fc4-723b-4a9a-8e68-80da694dbd72/setup_branding_illustration_1773134642807.png" 
                   alt="Branding" style={{ width: '140px', height: '140px', objectFit: 'contain' }} />
            </div>
            <Form.Group className="mb-4">
              <PremiumFormLabel>Organization Name</PremiumFormLabel>
              <PremiumFormControl 
                type="text" 
                size="lg"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                placeholder="e.g. Acme Corporation"
              />
            </Form.Group>
            <Form.Group className="mb-0">
              <PremiumFormLabel>Logo URL (Optional)</PremiumFormLabel>
              <PremiumFormControl 
                type="text" 
                size="lg"
                value={formData.company_logo}
                onChange={(e) => setFormData({...formData, company_logo: e.target.value})}
                placeholder="https://company.com/logo.png"
              />
              <Form.Text className="text-muted mt-3 d-block fw-medium">
                <BiInfoCircle className="me-1" /> Best results with transparent PNG or SVG.
              </Form.Text>
            </Form.Group>
          </FadeIn>
        );
      case 3:
        return (
          <FadeIn className="text-center py-4">
            <div className="mb-5">
              <div className="d-inline-flex p-4 rounded-circle bg-success bg-opacity-10 text-success">
                <BiCheckCircle size={60} />
              </div>
            </div>
            <h3 className="fw-bold mb-2">You're all set!</h3>
            <p className="text-muted mb-4 fs-5">
              Ready to initialize your company recognition platform.
            </p>
            <Card className="bg-light border-0 text-start p-4" style={{ borderRadius: '24px' }}>
              <div className="small fw-bold text-uppercase text-primary mb-3 letter-spacing-1">Next steps after Launch:</div>
              <Row>
                <Col xs={1}><BiCheckCircle className="text-success mt-1" /></Col>
                <Col><div className="small fw-semibold mb-2 text-dark">Default award types (Excellence, Peer, Innovation)</div></Col>
              </Row>
              <Row>
                <Col xs={1}><BiCheckCircle className="text-success mt-1" /></Col>
                <Col><div className="small fw-semibold mb-2 text-dark">Active Q1 2026 nomination cycle</div></Col>
              </Row>
              <Row>
                <Col xs={1}><BiCheckCircle className="text-success mt-1" /></Col>
                <Col><div className="small fw-semibold text-dark">Standardized review forms</div></Col>
              </Row>
            </Card>
          </FadeIn>
        );
      default: return null;
    }
  };

  return (
    <SetupContainer>
      <SetupHeader>
        <Branding>
          <BiAward size={32} />
          <span>Awards Platform</span>
        </Branding>
        <div className="d-flex align-items-center gap-4">
          <div className="text-end d-none d-md-block">
            <div className="small fw-bold text-muted text-uppercase mb-1">Overall Progress</div>
            <div className="small fw-bold text-primary">{Math.round((step / 3) * 100)}%</div>
          </div>
          <div style={{ width: '120px' }}>
            <ProgressBar now={(step / 3) * 100} style={{ height: '10px', borderRadius: '10px', background: '#e2e8f0' }} />
          </div>
        </div>
      </SetupHeader>

      <ContentArea>
        <SetupCard>
          <Row className="g-0 h-100">
            <InfoPanel md={5}>
              <StepIndicator>
                {[1,2,3].map(s => <StepDot key={s} active={s <= step} />)}
              </StepIndicator>
              <div className="mb-auto">
                {renderInfo()}
              </div>
              <div className="mt-5 d-flex align-items-center gap-2 small fw-bold text-white text-opacity-75">
                <div className="px-3 py-1 rounded-pill border border-white border-opacity-25 bg-white bg-opacity-10">
                  Step {step} of 3 • Configuration
                </div>
              </div>
            </InfoPanel>

            <FormPanel md={7}>
              <div className="h-100 d-flex flex-column">
                <div className="flex-grow-1">
                  {renderForm()}
                </div>

                <div className="d-flex justify-content-between mt-5 pt-4 border-top border-light">
                  <Button 
                    variant="link" 
                    className="text-decoration-none text-muted fw-bold p-0 d-flex align-items-center gap-2"
                    onClick={prevStep}
                    disabled={step === 1 || loading}
                  >
                    <BiChevronLeft size={24} /> Back
                  </Button>

                  {step < 3 ? (
                    <Button 
                      variant="primary" 
                      onClick={nextStep}
                      style={{ 
                        borderRadius: '20px', 
                        fontWeight: '800', 
                        padding: '1rem 3rem',
                        background: 'var(--primary-gradient)',
                        border: 'none',
                        boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
                      }}
                    >
                      Continue <BiChevronRight size={24} className="ms-1" />
                    </Button>
                  ) : (
                    <Button 
                      variant="success" 
                      onClick={handleSubmit}
                      disabled={loading}
                      style={{ 
                        borderRadius: '20px', 
                        fontWeight: '800', 
                        padding: '1rem 3.5rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      {loading ? <><BiLoaderAlt className="spinner-border spinner-border-sm me-2" /> Initializing...</> : 'Launch Platform'}
                    </Button>
                  )}
                </div>
              </div>
            </FormPanel>
          </Row>
        </SetupCard>
      </ContentArea>
    </SetupContainer>
  );
};

export default SetupWizardPage;
