import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Badge, Button, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { BiPlus, BiListUl, BiUser, BiCalendar } from 'react-icons/bi';
import { fetchNominations, fetchNominationHistory } from '../store/slices/nominationsSlice';
import { STATUS_COLORS } from '../utils/constants';
import { USER_ROLES } from '../utils/constants';
import Loading from '../components/common/Loading';
import { Card as StyledCard, CardHeader, CardTitle, CardBody } from '../components/common/Card';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  h1 {
    margin: 0;
    font-weight: 700;
    color: #212529;
  }
`;

const Nominations = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { nominations, history, loading } = useSelector((state) => state.nominations);

  useEffect(() => {
    if (user?.role === USER_ROLES.MANAGER) {
      dispatch(fetchNominationHistory());
    } else {
      dispatch(fetchNominations({}));
    }
  }, [dispatch, user]);

  if (loading) {
    return <Loading />;
  }

  const displayNominations = user?.role === USER_ROLES.MANAGER ? history : nominations;

  return (
    <Container fluid>
      <PageHeader>
        <div>
          <h1><BiListUl style={{ marginRight: '0.5rem' }} />Nominations</h1>
          <p className="text-muted">
            {user?.role === USER_ROLES.MANAGER ? 'Your nominations' : 'All nominations'}
          </p>
        </div>
        {user?.role === USER_ROLES.MANAGER && (
          <Button variant="primary" size="lg">
            <BiPlus style={{ marginRight: '0.5rem' }} />
            New Nomination
          </Button>
        )}
      </PageHeader>

      {displayNominations.length === 0 ? (
        <StyledCard>
          <CardBody>
            <div className="text-center py-5">
              <BiListUl style={{ fontSize: '4rem', color: '#dee2e6', marginBottom: '1rem' }} />
              <h4>No nominations yet</h4>
              <p className="text-muted">
                {user?.role === USER_ROLES.MANAGER
                  ? 'Create your first nomination to recognize outstanding employees'
                  : 'No nominations available'}
              </p>
              {user?.role === USER_ROLES.MANAGER && (
                <Button variant="primary">
                  <BiPlus style={{ marginRight: '0.5rem' }} />
                  Create Nomination
                </Button>
              )}
            </div>
          </CardBody>
        </StyledCard>
      ) : (
        <StyledCard>
          <CardHeader>
            <CardTitle>Nominations List</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Nominee</th>
                    <th>Cycle</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayNominations.map((nomination) => (
                    <tr key={nomination.id}>
                      <td>
                        <BiUser style={{ marginRight: '0.5rem' }} />
                        {nomination.nominee?.name || 'N/A'}
                      </td>
                      <td>{nomination.cycle?.name || 'N/A'}</td>
                      <td>
                        <Badge bg={STATUS_COLORS[nomination.status] || 'secondary'}>
                          {nomination.status}
                        </Badge>
                      </td>
                      <td>
                        {nomination.submitted_at
                          ? new Date(nomination.submitted_at).toLocaleDateString()
                          : 'Draft'}
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </StyledCard>
      )}
    </Container>
  );
};

export default Nominations;

