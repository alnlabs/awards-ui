import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Badge, Button, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { BiPlus, BiEdit, BiCalendar, BiBook } from 'react-icons/bi';
import { fetchCycles } from '../store/slices/cyclesSlice';
import { STATUS_COLORS } from '../utils/constants';
import Loading from '../components/common/Loading';
import { Card as StyledCard, CardHeader, CardTitle, CardBody } from '../components/common/Card';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    margin: 0;
    font-weight: 700;
    color: #212529;
  }
`;

const CycleCard = styled(StyledCard)`
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const Cycles = () => {
  const dispatch = useDispatch();
  const { cycles, loading } = useSelector((state) => state.cycles);

  useEffect(() => {
    dispatch(fetchCycles());
  }, [dispatch]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Container fluid>
      <PageHeader>
        <div>
          <h1><BiBook style={{ marginRight: '0.5rem' }} />Award Cycles</h1>
          <p className="text-muted">Manage quarterly award cycles</p>
        </div>
        <Button variant="primary" size="lg">
          <BiPlus style={{ marginRight: '0.5rem' }} />
          New Cycle
        </Button>
      </PageHeader>

      <Row>
        {cycles.length === 0 ? (
          <Col xs={12}>
            <StyledCard>
              <CardBody>
                <div className="text-center py-5">
                  <BiCalendar style={{ fontSize: '4rem', color: '#dee2e6', marginBottom: '1rem' }} />
                  <h4>No cycles yet</h4>
                  <p className="text-muted">Create your first award cycle to get started</p>
                  <Button variant="primary">
                    <BiPlus style={{ marginRight: '0.5rem' }} />
                    Create Cycle
                  </Button>
                </div>
              </CardBody>
            </StyledCard>
          </Col>
        ) : (
          cycles.map((cycle) => (
            <Col key={cycle.id} xs={12} md={6} lg={4}>
              <CycleCard>
                <CardHeader>
                  <CardTitle>{cycle.name}</CardTitle>
                  <Badge bg={STATUS_COLORS[cycle.status] || 'secondary'}>
                    {cycle.status}
                  </Badge>
                </CardHeader>
                <CardBody>
                  <p className="mb-2">
                    <strong>Quarter:</strong> {cycle.quarter} {cycle.year}
                  </p>
                  <p className="mb-2">
                    <strong>Period:</strong> {new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}
                  </p>
                  {cycle.description && (
                    <p className="text-muted">{cycle.description}</p>
                  )}
                  <div className="d-flex gap-2 mt-3">
                    <Button variant="outline-primary" size="sm">
                      <BiEdit style={{ marginRight: '0.25rem' }} />
                      Edit
                    </Button>
                    <Button variant="primary" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardBody>
              </CycleCard>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Cycles;

