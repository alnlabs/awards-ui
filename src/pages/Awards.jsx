import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import styled from 'styled-components';
import { BiTrophy, BiAward, BiMedal } from 'react-icons/bi';
import { fetchCurrentAwards, fetchAwardsHistory } from '../store/slices/awardsSlice';
import Loading from '../components/common/Loading';
import { Card as StyledCard, CardHeader, CardTitle, CardBody } from '../components/common/Card';

const PageHeader = styled.div`
  margin-bottom: 2rem;

  h1 {
    margin: 0;
    font-weight: 700;
    color: #212529;
  }
`;

const AwardCard = styled(StyledCard)`
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;

  .card-body {
    text-align: center;
  }
`;

const AwardIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.9;
`;

const WinnersList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const WinnerCard = styled(StyledCard)`
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .card-body {
    padding: 2rem 1.5rem;
  }
`;

const Awards = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { current, history, loading } = useSelector((state) => state.awards);

  useEffect(() => {
    dispatch(fetchCurrentAwards());
    if (user?.role === 'HR') {
      dispatch(fetchAwardsHistory());
    }
  }, [dispatch, user]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Container fluid>
      <PageHeader>
        <h1><BiTrophy style={{ marginRight: '0.5rem' }} />Awards</h1>
        <p className="text-muted">Recognizing outstanding employees</p>
      </PageHeader>

      {current.length === 0 ? (
        <StyledCard>
          <CardBody>
            <div className="text-center py-5">
              <BiTrophy style={{ fontSize: '4rem', color: '#dee2e6', marginBottom: '1rem' }} />
              <h4>No awards yet</h4>
              <p className="text-muted">Awards will appear here once finalized</p>
            </div>
          </CardBody>
        </StyledCard>
      ) : (
        <>
          <Row>
            {current.map((award) => (
              <Col key={award.id} xs={12} md={6} lg={4}>
                <AwardCard>
                  <CardBody>
                    <AwardIcon>
                      <BiAward />
                    </AwardIcon>
                    <h3>{award.award_type}</h3>
                    <p className="mb-0">{award.cycle?.name || 'N/A'}</p>
                  </CardBody>
                </AwardCard>
              </Col>
            ))}
          </Row>

          <WinnersList>
            {current.map((award) => (
              <WinnerCard key={award.id}>
                <CardBody>
                  <BiMedal style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                  <h4>{award.winner?.name || 'N/A'}</h4>
                  <p className="mb-2">{award.award_type}</p>
                  <Badge bg="light" text="dark">
                    Rank #{award.rank}
                  </Badge>
                </CardBody>
              </WinnerCard>
            ))}
          </WinnersList>
        </>
      )}
    </Container>
  );
};

export default Awards;

