import { useState, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col, Alert } from "react-bootstrap";
import styled from "styled-components";
import { BiSave, BiCog, BiBuilding, BiCheckCircle } from "react-icons/bi";
import api from "../../services/api";
import Loading from "../../components/common/Loading";

const Layout = styled.div`
  padding: 2rem 0;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-main);
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  p {
    color: var(--text-muted);
  }
`;

const StyledCard = styled(Card)`
  border: none;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const CardHeader = styled(Card.Header)`
  background: white;
  border-bottom: 1px solid #f1f5f9;
  padding: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormSection = styled.div`
  padding: 1.5rem;
`;

const SystemSettings = () => {
  const [config, setConfig] = useState({
    company_name: "",
    company_logo: "",
    settings: {
      allow_peer_nominations: true,
      max_nominations_per_manager: 5,
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await api.get("/system/config");
      setConfig(data);
    } catch (error) {
      console.error("Failed to fetch config", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.patch("/system/config", config);
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      console.error("Failed to save settings", error);
      setMessage({ type: "danger", text: "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Container>
      <Layout>
        <Header>
          <h1><BiCog /> System Configuration</h1>
          <p>Manage company-wide settings and platform appearance.</p>
        </Header>

        {message && (
          <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <Form onSubmit={handleSave}>
          <Row>
            <Col lg={8}>
              <StyledCard className="mb-4">
                <CardHeader>
                  <BiBuilding /> Company Profile
                </CardHeader>
                <FormSection>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Company Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={config.company_name}
                      onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
                      placeholder="e.g. Acme Corp"
                      style={{ borderRadius: '12px', padding: '0.75rem' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-0">
                    <Form.Label className="fw-bold">Logo URL</Form.Label>
                    <Form.Control
                      type="text"
                      value={config.company_logo || ""}
                      onChange={(e) => setConfig({ ...config, company_logo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      style={{ borderRadius: '12px', padding: '0.75rem' }}
                    />
                  </Form.Group>
                </FormSection>
              </StyledCard>
            </Col>

            <Col lg={4}>
              <StyledCard>
                <CardHeader>Publish Changes</CardHeader>
                <FormSection>
                  <p className="small text-muted mb-4">
                    Changes made here will be applied globally across the entire platform for all users.
                  </p>
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-3"
                    disabled={saving}
                    style={{ borderRadius: '12px', fontWeight: 'bold' }}
                  >
                    {saving ? "Saving..." : <><BiSave className="me-2" /> Save Settings</>}
                  </Button>
                </FormSection>
              </StyledCard>
            </Col>
          </Row>
        </Form>
      </Layout>
    </Container>
  );
};

export default SystemSettings;
