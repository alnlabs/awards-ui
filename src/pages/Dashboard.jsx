import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  BiTrophy,
  BiUser,
  BiListUl,
  BiBook,
  BiCheckCircle,
  BiTimer,
  BiAward,
  BiCalendar,
  BiGroup,
} from "react-icons/bi";

import { fetchCycles } from "../store/slices/cyclesSlice";
import { fetchNominations } from "../store/slices/nominationsSlice";
import { fetchPanels } from "../store/slices/panelSlice";

import { USER_ROLES, STATUS_COLORS } from "../utils/constants";
import { formatDate } from "../utils/dateUtils";
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

const QuickActionsCard = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
`;

const QuickActionButton = styled(Button)`
  width: 100%;
  margin-bottom: 0.75rem;
  text-align: left;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const RecentActivityCard = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
`;

const SectionTitle = styled.h5`
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const StatChange = styled.p`
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  opacity: 0.8;
`;

/* =====================
   Dashboard (COMMON)
===================== */

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { cycles, loading: cyclesLoading } = useSelector(
    (state) => state.cycles
  );
  const { nominations, loading: nominationsLoading } = useSelector(
    (state) => state.nominations
  );
  const { panels } = useSelector((state) => state.panels);
  const { myAssignments: panelAssignments = [] } = useSelector(
    (state) => state.panelAssignments
  );

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

  const panelReviewNominations = nominations.filter(
    (n) => n.status === "PANEL_REVIEW"
  ).length;

  const hrReviewNominations = nominations.filter(
    (n) => n.status === "HR_REVIEW"
  ).length;

  const _pendingPanelReviews =
    user?.role === USER_ROLES.PANEL || user?.is_panel_member
      ? panelAssignments.filter((a) => a.assignment_status !== "COMPLETED").length
      : 0;

  const _completedPanelReviews =
    user?.role === USER_ROLES.PANEL || user?.is_panel_member
      ? panelAssignments.filter((a) => a.assignment_status === "COMPLETED").length
      : 0;

  // Recent nominations (last 5)
  const recentNominations = [...nominations]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

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

            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                $bg="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                $textColor="#212529"
                $accentColor="#a8edea"
                $clickable
                onClick={() => navigate("/nominations")}
              >
                <Card.Body>
                  <StatHeader>
                    <StatIcon $iconBg="rgba(0, 0, 0, 0.1)" $iconColor="#212529">
                      <BiCheckCircle />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>{panelReviewNominations}</StatValue>
                  <StatLabel>Panel Reviews</StatLabel>
                  <StatChange style={{ color: "#495057" }}>
                    {hrReviewNominations} in HR review
                  </StatChange>
                </Card.Body>
              </StatCard>
            </Col>

            {/* Quick Actions */}
            <Col xs={12} md={6} lg={4}>
              <QuickActionsCard>
                <Card.Body>
                  <SectionTitle>Quick Actions</SectionTitle>
                  <QuickActionButton
                    variant="primary"
                    onClick={() => navigate("/cycles/new")}
                  >
                    <BiCalendar className="me-2" />
                    Create New Cycle
                  </QuickActionButton>
                  <QuickActionButton
                    variant="outline-primary"
                    onClick={() => navigate("/nominations")}
                  >
                    <BiListUl className="me-2" />
                    View All Nominations
                  </QuickActionButton>
                  <QuickActionButton
                    variant="outline-primary"
                    onClick={() => navigate("/awards")}
                  >
                    <BiAward className="me-2" />
                    Manage Awards
                  </QuickActionButton>
                  <QuickActionButton
                    variant="outline-primary"
                    onClick={() => navigate("/panels")}
                  >
                    <BiGroup className="me-2" />
                    Manage Panels
                  </QuickActionButton>
                </Card.Body>
              </QuickActionsCard>
            </Col>

            {/* Recent Activity */}
            <Col xs={12} md={6} lg={8}>
              <RecentActivityCard>
                <Card.Body>
                  <SectionTitle>Recent Nominations</SectionTitle>
                  {recentNominations.length === 0 ? (
                    <p className="text-muted">No nominations yet</p>
                  ) : (
                    recentNominations.map((nomination) => {
                      const nominee = nomination.nominee || {};
                      const cycle = nomination.cycle || {};
                      return (
                        <ActivityItem key={nomination.id}>
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="activity-title">
                                {nominee.name || nomination.nominee_id}
                              </div>
                              <div className="activity-meta">
                                {cycle.name
                                  ? `${cycle.name} (${cycle.quarter} ${cycle.year})`
                                  : "Unknown cycle"}{" "}
                                • {formatDate(nomination.created_at)}
                              </div>
                            </div>
                            <div>
                              <Badge bg={STATUS_COLORS[nomination.status] || "secondary"}>
                                {nomination.status}
                              </Badge>
                            </div>
                          </div>
                        </ActivityItem>
                      );
                    })
                  )}
                  {recentNominations.length > 0 && (
                    <div className="mt-3">
                      <AppButton
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate("/nominations")}
                      >
                        View All <BiChevronRight className="ms-1" />
                      </AppButton>
                    </div>
                  )}
                </Card.Body>
              </RecentActivityCard>
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

            {/* Quick Actions */}
            <Col xs={12} md={6} lg={3}>
              <QuickActionsCard>
                <Card.Body>
                  <SectionTitle>Quick Actions</SectionTitle>
                  <QuickActionButton
                    variant="primary"
                    onClick={() => navigate("/nominations/new")}
                  >
                    <BiPlus className="me-2" />
                    Create Nomination
                  </QuickActionButton>
                  <QuickActionButton
                    variant="outline-primary"
                    onClick={() => navigate("/nominations")}
                  >
                    <BiListUl className="me-2" />
                    My Nominations
                  </QuickActionButton>
                </Card.Body>
              </QuickActionsCard>
            </Col>

            {/* Recent Nominations */}
            <Col xs={12} md={6} lg={9}>
              <RecentActivityCard>
                <Card.Body>
                  <SectionTitle>My Recent Nominations</SectionTitle>
                  {myNominations.length === 0 ? (
                    <p className="text-muted">No nominations yet</p>
                  ) : (
                    myNominations
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                      .slice(0, 5)
                      .map((nomination) => {
                        const nominee = nomination.nominee || {};
                        return (
                          <ActivityItem key={nomination.id}>
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="activity-title">
                                  {nominee.name || nomination.nominee_id}
                                </div>
                                <div className="activity-meta">
                                  {formatDate(nomination.created_at)}
                                </div>
                              </div>
                              <div>
                                <Badge bg={STATUS_COLORS[nomination.status] || "secondary"}>
                                  {nomination.status}
                                </Badge>
                              </div>
                            </div>
                          </ActivityItem>
                        );
                      })
                  )}
                </Card.Body>
              </RecentActivityCard>
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
                $bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                $textColor="white"
                $accentColor="#667eea"
                $clickable
                onClick={() => navigate("/reviews")}
              >
                <Card.Body>
                  <StatIcon>
                    <BiTimer />
                  </StatIcon>
                  <StatValue>{panelAssignments.filter((a) => a.assignment_status !== "COMPLETED").length}</StatValue>
                  <StatLabel>Assignments Pending</StatLabel>
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <StatCard
                $bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                $textColor="white"
                $accentColor="#43e97b"
                $clickable
                onClick={() => navigate("/reviews")}
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

            {/* Quick Actions */}
            <Col xs={12} md={6} lg={3}>
              <QuickActionsCard>
                <Card.Body>
                  <SectionTitle>Quick Actions</SectionTitle>
                  <QuickActionButton
                    variant="primary"
                    onClick={() => navigate("/reviews")}
                  >
                    <BiListUl className="me-2" />
                    My Reviews
                  </QuickActionButton>
                </Card.Body>
              </QuickActionsCard>
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
