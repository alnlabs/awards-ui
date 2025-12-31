import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Badge } from "react-bootstrap";
import styled from "styled-components";
import { BiTrophy, BiAward, BiMedal } from "react-icons/bi";

import {
  fetchNominationsWithScores,
  finalizeCycleAwards,
} from "../../store/slices/awardsSlice";

import Loading from "../../components/common/Loading";
import PageHeader from "../../components/common/PageHeader";
import { Card as StyledCard, CardBody } from "../../components/common/Card";

/* =====================
   Styled Components
===================== */

const AwardsGrid = styled(Row)`
  --bs-gutter-x: 1.25rem;
  --bs-gutter-y: 1.25rem;
`;

const AwardCard = styled(StyledCard)`
  height: 100%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  text-align: center;
`;

const AwardIcon = styled.div`
  font-size: 3.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.9;
`;

const WinnersList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-top: 2rem;
`;

const WinnerCard = styled(StyledCard)`
  height: 100%;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .card-body {
    padding: 1.75rem 1.25rem;
  }
`;

/* =====================
   Component
===================== */

const Awards = () => {
  const dispatch = useDispatch();

  const { activeCycle } = useSelector((state) => state.cycles);
  const { nominationsWithScores, loading } = useSelector(
    (state) => state.awards
  );

  useEffect(() => {
    if (activeCycle?.id) {
      dispatch(fetchNominationsWithScores(activeCycle.id));
    }
  }, [dispatch, activeCycle]);

  if (loading) return <Loading />;

  const winners = nominationsWithScores.filter((n) => n.status === "FINALIZED");

  return (
    <>
      <PageHeader
        icon={BiTrophy}
        title="Awards"
        subtitle="Recognizing outstanding employees"
      />

      {/* Empty State */}
      {winners.length === 0 ? (
        <StyledCard>
          <CardBody className="text-center py-5">
            <BiTrophy
              style={{
                fontSize: "3.5rem",
                color: "#dee2e6",
                marginBottom: "1rem",
              }}
            />
            <h4>No awards finalized yet</h4>
            <p className="text-muted">
              Awards will appear once HR finalizes the cycle
            </p>
          </CardBody>
        </StyledCard>
      ) : (
        <>
          {/* Award Overview */}
          <AwardsGrid>
            {winners.map((n) => (
              <Col key={n.nomination_id} xs={12} md={6} lg={4}>
                <AwardCard>
                  <CardBody>
                    <AwardIcon>
                      <BiAward />
                    </AwardIcon>
                    <h4 className="mb-1">Employee Award</h4>
                    <p className="mb-0">
                      Avg Score:{" "}
                      <strong>
                        {n.average_score !== null
                          ? n.average_score.toFixed(2)
                          : "N/A"}
                      </strong>
                    </p>
                  </CardBody>
                </AwardCard>
              </Col>
            ))}
          </AwardsGrid>

          {/* Winners */}
          <WinnersList>
            {winners.map((n, index) => (
              <WinnerCard key={n.nomination_id}>
                <CardBody>
                  <BiMedal
                    style={{
                      fontSize: "2.75rem",
                      marginBottom: "0.75rem",
                    }}
                  />
                  <h5 className="mb-1">{n.nominee_id}</h5>
                  <p className="mb-2">Final Score</p>
                  <Badge bg="light" text="dark">
                    Rank #{index + 1}
                  </Badge>
                </CardBody>
              </WinnerCard>
            ))}
          </WinnersList>
        </>
      )}
    </>
  );
};

export default Awards;
