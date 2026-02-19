import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import { BiPrinter, BiArrowBack, BiScreenshot } from "react-icons/bi";
import styled from "styled-components";
import api from "../../services/api";
import AppButton from "../../components/common/AppButton";

const CertificateWrapper = styled.div`
  background: #f4f7f6;
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media print {
    padding: 0;
    background: white;
  }
`;

const CertificateContainer = styled.div`
  width: 100%;
  max-width: 900px;
  background: white;
  padding: 60px;
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  border: 20px solid #fff;
  outline: 2px solid #d4af37;
  outline-offset: -10px;
  margin-bottom: 30px;
  text-align: center;
  font-family: 'Georgia', serif;

  &::before {
    content: '';
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    border: 1px solid #d4af37;
    pointer-events: none;
  }

  @media print {
    box-shadow: none;
    margin: 0;
    max-width: 100%;
    border: 10px solid #fff;
    outline-width: 1px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  color: #1a1a1a;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 4px;
  font-weight: 300;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 30px;
`;

const WinnerSection = styled.div`
  margin: 40px 0;
`;

const WinnerPhoto = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin: 0 auto 20px;
  border: 4px solid #d4af37;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const WinnerName = styled.h3`
  font-size: 2.5rem;
  color: #333;
  margin: 10px 0;
  border-bottom: 2px solid #eee;
  display: inline-block;
  padding: 0 40px 10px;
`;

const Content = styled.p`
  font-size: 1.25rem;
  line-height: 1.8;
  color: #555;
  max-width: 600px;
  margin: 30px auto;
`;

const AwardLabel = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 10px;
`;

const FooterMain = styled.div`
  margin-top: 60px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 40px;
`;

const Signature = styled.div`
  width: 200px;
  border-top: 1px solid #333;
  padding-top: 10px;
  font-size: 0.9rem;
  color: #777;
`;

const DateText = styled.div`
  font-size: 0.9rem;
  color: #777;
`;

const Seal = styled.div`
  width: 100px;
  height: 100px;
  background: #d4af37;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: bold;
  text-align: center;
  padding: 10px;
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4);
  transform: rotate(-15deg);

  span {
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 50%;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;

  @media print {
    display: none;
  }
`;

const AwardCertificate = ({ isPreview = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [query] = useState(new URLSearchParams(window.location.search));
  
  const [award, setAward] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isPreview) {
          const nominationId = query.get("nominationId");
          const awardTypeCode = query.get("awardType") || "GENERAL";
          
          // Fetch nomination to get winner info
          const nomination = await api.get(`/nominations/${nominationId}`);
          
          // Fetch all award types to find the label
          const awardTypes = await api.get("/awards/types");
          const type = awardTypes.find(t => t.code === awardTypeCode) || { label: "Award Type" };

          // Mock an award object
          setAward({
            id: "preview",
            winner: nomination.nominee || { name: nomination.nominee_name },
            cycle: nomination.cycle || { name: "Current Cycle", quarter: "X", year: "202X" },
            award_type: type,
            created_at: new Date().toISOString(),
            isPreview: true
          });
        } else {
          const res = await api.get(`/awards/${id}`);
          setAward(res);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isPreview, query]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!award) {
    return (
      <Container className="text-center py-5">
        <h2>Award Not Found</h2>
        <AppButton variant="primary" onClick={() => navigate("/awards")}>Back to Awards</AppButton>
      </Container>
    );
  }

  const winner = award.winner || {};
  const cycle = award.cycle || {};

  return (
    <CertificateWrapper>
      <ActionButtons>
        <AppButton variant="secondary" icon={BiArrowBack} onClick={() => navigate(-1)}>
          Go Back
        </AppButton>
        <AppButton variant="primary" icon={BiPrinter} onClick={handlePrint} disabled={isPreview}>
          {isPreview ? "Preview Mode" : "Print Certificate"}
        </AppButton>
      </ActionButtons>

      {isPreview && (
        <div style={{
          background: "#d9534f",
          color: "white",
          padding: "5px 20px",
          width: "100%",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "14px",
          marginBottom: "20px"
        }}>
          PREVIEW MODE - DATA IS NOT YET SAVED
        </div>
      )}

      <CertificateContainer>
        <Header>
          <Title>Certificate</Title>
          <Subtitle>of Achievement</Subtitle>
        </Header>

        <WinnerSection>
          <WinnerPhoto>
            <img 
              src={winner.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(winner.name)}&background=random`} 
              alt={winner.name} 
            />
          </WinnerPhoto>
          <Content>This certificate is proudly presented to</Content>
          <WinnerName>{winner.name}</WinnerName>
        </WinnerSection>

        <Content>
          In recognition of outstanding performance and dedication during the 
          <strong> {cycle.name}</strong> (Q{cycle.quarter} {cycle.year}).
        </Content>

        <AwardLabel>{award.award_type?.label}</AwardLabel>
        
        <FooterMain>
          <DateText>
            Dated: {new Date(award.created_at).toLocaleDateString()}
          </DateText>
          
          <Seal>
            <span>OFFICIAL AWARD</span>
          </Seal>

          <Signature>
            Authorized Signature
          </Signature>
        </FooterMain>
      </CertificateContainer>
    </CertificateWrapper>
  );
};

export default AwardCertificate;
