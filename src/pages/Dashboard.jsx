import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Col, Card } from "react-bootstrap";
import styled from "styled-components";
import {
  BiTrophy,
  BiUser,
  BiListUl,
  BiBook,
  BiCheckCircle,
  BiTimer,
} from "react-icons/bi";

import { fetchCycles } from "../store/slices/cyclesSlice";
import { fetchNominations } from "../store/slices/nominationsSlice";
import { fetchPanels } from "../store/slices/panelSlice";

import { USER_ROLES } from "../utils/constants";
import Loading from "../components/common/Loading";

/* =====================
   Styled Components
===================== */

const StatCard = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  background: ${(props) => props.bg || "white"};
  color: ${(props) => props.textColor || "#212529"};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .card-body {
    padding: 1.5rem;
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  margin-bottom: 1rem;
  font-size: 2rem;
`;

const StatValue = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
`;

const StatLabel = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const WelcomeCard = styled(Card)`
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 2rem;

  .card-body {
    padding: 2rem;
  }
`;

/* =====================
   Dashboard (COMMON)
===================== */

const Dashboard = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { cycles, loading: cyclesLoading } = useSelector(
    (state) => state.cycles
  );
  const { nominations, loading: nominationsLoading } = useSelector(
    (state) => state.nominations
  );
  const { panels } = useSelector((state) => state.panels);

  /* =====================
     Fetch Core Data
  ===================== */

  useEffect(() => {
    dispatch(fetchCycles());
    dispatch(fetchNominations({}));

    if (user?.role === USER_ROLES.HR) {
      dispatch(fetchPanels());
    }
  }, [dispatch, user?.role]);

  const loading = cyclesLoading || nominationsLoading;
  if (loading) return <Loading />;

  /* =====================
     Derived Metrics
  ===================== */

  const openCycles = cycles.filter((c) => c.status === "OPEN").length;

  const myNominations = nominations.filter(
    (n) => n.nominated_by_id === user?.id
  ).length;

  const finalizedNominations = nominations.filter(
    (n) => n.status === "FINALIZED"
  ).length;

  const panelReviewItems =
    user?.role === USER_ROLES.PANEL
      ? nominations.filter((n) => n.status === "PANEL_REVIEW").length
      : 0;

  /* =====================
     Render
  ===================== */

  return (
    <Container fluid>
      {/* =====================
          Welcome
      ===================== */}
      <WelcomeCard>
        <Card.Body>
          <h1>Welcome back, {user?.name}!</h1>
          <p className="mb-0">
            Here's what's happening with the Employee Awards program.
          </p>
        </Card.Body>
      </WelcomeCard>

      <Row className="g-4">
        {/* =====================
            HR DASHBOARD
        ===================== */}
        {user?.role === USER_ROLES.HR && (
          <>
            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                textColor="white"
              >
                <Card.Body>
                  <StatIcon>
                    <BiBook />
                  </StatIcon>
                  <StatValue>{cycles.length}</StatValue>
                  <StatLabel>Total Cycles</StatLabel>
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                textColor="white"
              >
                <Card.Body>
                  <StatIcon>
                    <BiTimer />
                  </StatIcon>
                  <StatValue>{openCycles}</StatValue>
                  <StatLabel>Open Cycles</StatLabel>
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                textColor="white"
              >
                <Card.Body>
                  <StatIcon>
                    <BiUser />
                  </StatIcon>
                  <StatValue>{panels.length}</StatValue>
                  <StatLabel>Panels</StatLabel>
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                bg="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                textColor="white"
              >
                <Card.Body>
                  <StatIcon>
                    <BiTrophy />
                  </StatIcon>
                  <StatValue>{finalizedNominations}</StatValue>
                  <StatLabel>Finalized Awards</StatLabel>
                </Card.Body>
              </StatCard>
            </Col>
          </>
        )}

        {/* =====================
            MANAGER DASHBOARD
        ===================== */}
        {user?.role === USER_ROLES.MANAGER && (
          <>
            <Col xs={12} sm={6} md={4}>
              <StatCard
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                textColor="white"
              >
                <Card.Body>
                  <StatIcon>
                    <BiListUl />
                  </StatIcon>
                  <StatValue>{myNominations}</StatValue>
                  <StatLabel>My Nominations</StatLabel>
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <StatCard
                bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                textColor="white"
              >
                <Card.Body>
                  <StatIcon>
                    <BiBook />
                  </StatIcon>
                  <StatValue>{openCycles}</StatValue>
                  <StatLabel>Open Cycles</StatLabel>
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <StatCard
                bg="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                textColor="white"
              >
                <Card.Body>
                  <StatIcon>
                    <BiTrophy />
                  </StatIcon>
                  <StatValue>{finalizedNominations}</StatValue>
                  <StatLabel>Finalized Awards</StatLabel>
                </Card.Body>
              </StatCard>
            </Col>
          </>
        )}

        {/* =====================
            PANEL DASHBOARD
        ===================== */}
        {user?.role === USER_ROLES.PANEL && (
          <>
            <Col xs={12} sm={6} md={4}>
              <StatCard
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                textColor="white"
              >
                <Card.Body>
                  <StatIcon>
                    <BiTimer />
                  </StatIcon>
                  <StatValue>{panelReviewItems}</StatValue>
                  <StatLabel>Assignments Pending</StatLabel>
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <StatCard
                bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                textColor="white"
              >
                <Card.Body>
                  <StatIcon>
                    <BiCheckCircle />
                  </StatIcon>
                  <StatValue>{nominations.length}</StatValue>
                  <StatLabel>Total Assigned</StatLabel>
                </Card.Body>
              </StatCard>
            </Col>
          </>
        )}

        {/* =====================
            EMPLOYEE DASHBOARD
        ===================== */}
        {user?.role === USER_ROLES.EMPLOYEE && (
          <Col xs={12} sm={6} md={4}>
            <StatCard
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              textColor="white"
            >
              <Card.Body>
                <StatIcon>
                  <BiTrophy />
                </StatIcon>
                <StatValue>{finalizedNominations}</StatValue>
                <StatLabel>Awards Received</StatLabel>
              </Card.Body>
            </StatCard>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Dashboard;
