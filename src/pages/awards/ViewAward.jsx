import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge, Container, Row, Col } from "react-bootstrap";
import { BiArrowBack, BiTrophy, BiUser, BiCalendar, BiCommentDetail, BiAward, BiStar } from "react-icons/bi";
import styled from "styled-components";

import api from "../../services/api";
import PageHeader from "../../components/common/PageHeader";
import AppButton from "../../components/common/AppButton";
import Loading from "../../components/common/Loading";
import {
  Card,
  CardBody,
} from "../../components/common/Card";

const DetailLabel = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #adb5bd;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  font-size: 1.1rem;
  color: #495057;
  font-weight: 600;
`;

const ViewAward = () => {
  const { id: awardId } = useParams();
  const navigate = useNavigate();

  const [award, setAward] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAward = async () => {
      try {
        const res = await api.get(`/awards/${awardId}`);
        setAward(res);
      } catch (err) {
        console.error("Failed to fetch award:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAward();
  }, [awardId]);

  if (loading) return <Loading />;
  if (!award) return (
    <Container className="py-5 text-center">
      <h4>Award not found</h4>
      <AppButton variant="primary" className="mt-3" onClick={() => navigate("/awards")}>
        Back to Awards
      </AppButton>
    </Container>
  );

  return (
    <Container fluid className="py-4">
      <PageHeader
        icon={BiTrophy}
        title="Award Recognition"
        subtitle="Celebrating outstanding achievements"
        actions={
          <AppButton
            variant="secondary"
            icon={BiArrowBack}
            onClick={() => navigate("/awards")}
          >
            Back to Gallery
          </AppButton>
        }
      />

      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: "20px" }}>
            <div style={{ height: "10px", background: "linear-gradient(90deg, #d4af37 0%, #f9d976 100%)" }} />
            <CardBody className="p-5">
              <div className="text-center mb-5">
                <div style={{ fontSize: "4rem", color: "#d4af37" }} className="mb-3">
                  <BiAward />
                </div>
                <h2 className="fw-bold mb-1">{award.winner?.name}</h2>
                <p className="text-muted mb-0">{award.winner?.email}</p>
                <Badge bg="light" text="primary" className="mt-3 px-3 py-2 border border-primary border-opacity-25" pill>
                  {award.award_type?.label}
                </Badge>
              </div>

              <Row className="g-4 border-top pt-5">
                <Col md={6}>
                  <DetailLabel>Recognition Period</DetailLabel>
                  <DetailValue>
                    <BiCalendar className="me-2 text-primary" />
                    {award.cycle?.name} (Q{award.cycle?.quarter} {award.cycle?.year})
                  </DetailValue>
                </Col>

                <Col md={6}>
                  <DetailLabel>Recognition Rank</DetailLabel>
                  <DetailValue>
                    <BiStar className="me-2 text-warning" />
                    Rank {award.rank}
                  </DetailValue>
                </Col>

                <Col xs={12}>
                  <DetailLabel>Announcement Comment</DetailLabel>
                  <Card className="bg-light border-0 mt-2">
                    <CardBody className="p-4 italic text-secondary" style={{ fontStyle: "italic", lineHeight: "1.6" }}>
                      <BiCommentDetail className="me-2 text-muted" />
                      "{award.comment || "No comment provided for this recognition."}"
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              <div className="mt-5 text-center text-muted small">
                Officially recognized on {new Date(award.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ViewAward;
