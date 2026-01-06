import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
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
  BiGroup,
  BiCalendar,
  BiTrendingUp,
  BiChevronRight,
  BiPlus,
} from "react-icons/bi";

import { fetchCycles } from "../store/slices/cyclesSlice";
import { fetchNominations } from "../store/slices/nominationsSlice";
import { fetchPanels } from "../store/slices/panelSlice";
import { fetchMyPanelAssignments } from "../store/slices/panelAssignmentsSlice";

import { USER_ROLES, STATUS_COLORS } from "../utils/constants";
import Loading from "../components/common/Loading";
import AppButton from "../components/common/AppButton";

/* =====================
   Styled Components
===================== */

const DashboardContainer = styled(Container)`
  padding: 2rem 1rem;
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2.5rem;
  color: white;
  margin-bottom: 2.5rem;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.1rem;
    opacity: 0.95;
    margin: 0;
  }
`;

const StatCard = styled(Card)`
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
  background: ${(props) => props.$bg || "white"};
  color: ${(props) => props.$textColor || "#212529"};
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};
  overflow: hidden;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => props.$accentColor || "transparent"};
  }

  &:hover {
    transform: ${(props) => (props.$clickable ? "translateY(-6px)" : "none")};
    box-shadow: ${(props) =>
      props.$clickable
        ? "0 8px 24px rgba(0, 0, 0, 0.12)"
        : "0 4px 12px rgba(0, 0, 0, 0.08)"};
  }

  .card-body {
    padding: 1.75rem;
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.$iconBg || "rgba(255, 255, 255, 0.2)"};
  font-size: 1.75rem;
  color: ${(props) => props.$iconColor || "inherit"};
`;

const StatValue = styled.h2`
  font-size: 2.75rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
`;

const StatLabel = styled.p`
  margin: 0.5rem 0 0;
  opacity: 0.85;
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatChange = styled.div`
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const QuickActionsCard = styled(Card)`
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: 100%;

  .card-body {
    padding: 1.75rem;
  }
`;

const QuickActionButton = styled(AppButton)`
  width: 100%;
  justify-content: flex-start;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  font-weight: 500;

  &:last-child {
    margin-bottom: 0;
  }
`;

const RecentActivityCard = styled(Card)`
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: 100%;

  .card-body {
    padding: 1.75rem;
  }
`;

const ActivityItem = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;

  &:last-child {
    border-bottom: none;
  }

  .activity-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .activity-meta {
    font-size: 0.85rem;
    color: #6c757d;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #212529;
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
  const { assignments: panelAssignments } = useSelector(
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

    if (user?.role === USER_ROLES.PANEL || user?.is_panel_member) {
      dispatch(fetchMyPanelAssignments());
    }
  }, [dispatch, user?.role, user?.is_panel_member]);

  const loading = cyclesLoading || nominationsLoading;
  if (loading) return <Loading />;

  /* =====================
     Derived Metrics
  ===================== */

  const openCycles = cycles.filter((c) => c.status === "OPEN");
  const closedCycles = cycles.filter((c) => c.status === "CLOSED");
  const activeCycle = cycles.find((c) => c.status === "OPEN");

  const totalNominations = nominations.length;
  const myNominations = nominations.filter(
    (n) => n.nominated_by_id === user?.id
  );
  const submittedNominations = nominations.filter(
    (n) => n.status === "SUBMITTED"
  ).length;
  const panelReviewNominations = nominations.filter(
    (n) => n.status === "PANEL_REVIEW"
  ).length;
  const hrReviewNominations = nominations.filter(
    (n) => n.status === "HR_REVIEW"
  ).length;
  const finalizedNominations = nominations.filter(
    (n) => n.status === "FINALIZED"
  );

  const pendingPanelReviews =
    user?.role === USER_ROLES.PANEL || user?.is_panel_member
      ? panelAssignments.filter((a) => a.status !== "COMPLETED").length
      : 0;

  const completedPanelReviews =
    user?.role === USER_ROLES.PANEL || user?.is_panel_member
      ? panelAssignments.filter((a) => a.status === "COMPLETED").length
      : 0;

  // Recent nominations (last 5)
  const recentNominations = [...nominations]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  /* =====================
     Render
  ===================== */

  return (
    <DashboardContainer fluid>
      {/* =====================
          Welcome Section
      ===================== */}
      <WelcomeSection>
        <h1>Welcome back, {user?.name}!</h1>
        <p>
          {activeCycle
            ? `Active cycle: ${activeCycle.name} (${activeCycle.quarter} ${activeCycle.year})`
            : "Here's what's happening with the Employee Awards program."}
        </p>
      </WelcomeSection>

      <Row className="g-4">
        {/* =====================
            HR DASHBOARD
        ===================== */}
        {user?.role === USER_ROLES.HR && (
          <>
            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                $bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                $textColor="white"
                $accentColor="#667eea"
                $clickable
                onClick={() => navigate("/cycles")}
              >
                <Card.Body>
                  <StatHeader>
                    <StatIcon $iconBg="rgba(255, 255, 255, 0.2)">
                      <BiBook />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>{cycles.length}</StatValue>
                  <StatLabel>Total Cycles</StatLabel>
                  <StatChange>
                    <BiTrendingUp /> {openCycles.length} active
                  </StatChange>
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                $bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                $textColor="white"
                $accentColor="#43e97b"
                $clickable
                onClick={() => navigate("/cycles")}
              >
                <Card.Body>
                  <StatHeader>
                    <StatIcon $iconBg="rgba(255, 255, 255, 0.2)">
                      <BiTimer />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>{openCycles.length}</StatValue>
                  <StatLabel>Open Cycles</StatLabel>
                  <StatChange>
                    <BiCalendar /> {closedCycles.length} closed
                  </StatChange>
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                $bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                $textColor="white"
                $accentColor="#f093fb"
                $clickable
                onClick={() => navigate("/panels")}
              >
                <Card.Body>
                  <StatHeader>
                    <StatIcon $iconBg="rgba(255, 255, 255, 0.2)">
                      <BiGroup />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>{panels.length}</StatValue>
                  <StatLabel>Review Panels</StatLabel>
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                $bg="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                $textColor="white"
                $accentColor="#fa709a"
                $clickable
                onClick={() => navigate("/nominations")}
              >
                <Card.Body>
                  <StatHeader>
                    <StatIcon $iconBg="rgba(255, 255, 255, 0.2)">
                      <BiListUl />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>{totalNominations}</StatValue>
                  <StatLabel>Total Nominations</StatLabel>
                  <StatChange>
                    {submittedNominations} submitted, {hrReviewNominations}{" "}
                    in review
                  </StatChange>
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                $bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                $textColor="white"
                $accentColor="#4facfe"
                $clickable
                onClick={() => navigate("/awards")}
              >
                <Card.Body>
                  <StatHeader>
                    <StatIcon $iconBg="rgba(255, 255, 255, 0.2)">
                      <BiTrophy />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>{finalizedNominations.length}</StatValue>
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
                                • {new Date(nomination.created_at).toLocaleDateString()}
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
            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                $bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                $textColor="white"
                $accentColor="#667eea"
                $clickable
                onClick={() => navigate("/nominations")}
              >
                <Card.Body>
                  <StatHeader>
                    <StatIcon $iconBg="rgba(255, 255, 255, 0.2)">
                      <BiListUl />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>{myNominations.length}</StatValue>
                  <StatLabel>My Nominations</StatLabel>
                  <StatChange>
                    {myNominations.filter((n) => n.status === "SUBMITTED").length}{" "}
                    submitted
                  </StatChange>
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                $bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                $textColor="white"
                $accentColor="#43e97b"
                $clickable
                onClick={() => navigate("/cycles")}
              >
                <Card.Body>
                  <StatHeader>
                    <StatIcon $iconBg="rgba(255, 255, 255, 0.2)">
                      <BiBook />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>{openCycles.length}</StatValue>
                  <StatLabel>Open Cycles</StatLabel>
                  {activeCycle && (
                    <StatChange>{activeCycle.name}</StatChange>
                  )}
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                $bg="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                $textColor="white"
                $accentColor="#fa709a"
                $clickable
                onClick={() => navigate("/awards")}
              >
                <Card.Body>
                  <StatHeader>
                    <StatIcon $iconBg="rgba(255, 255, 255, 0.2)">
                      <BiTrophy />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>{finalizedNominations.length}</StatValue>
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
                                  {new Date(nomination.created_at).toLocaleDateString()}
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
        {(user?.role === USER_ROLES.PANEL || user?.is_panel_member) && (
          <>
            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                $bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                $textColor="white"
                $accentColor="#667eea"
                $clickable
                onClick={() => navigate("/reviews/my")}
              >
                <Card.Body>
                  <StatHeader>
                    <StatIcon $iconBg="rgba(255, 255, 255, 0.2)">
                      <BiTimer />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>{pendingPanelReviews}</StatValue>
                  <StatLabel>Pending Reviews</StatLabel>
                  <StatChange>
                    {completedPanelReviews} completed
                  </StatChange>
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                $bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                $textColor="white"
                $accentColor="#43e97b"
                $clickable
                onClick={() => navigate("/reviews/my")}
              >
                <Card.Body>
                  <StatHeader>
                    <StatIcon $iconBg="rgba(255, 255, 255, 0.2)">
                      <BiCheckCircle />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>{panelAssignments.length}</StatValue>
                  <StatLabel>Total Assignments</StatLabel>
                  <StatChange>
                    {completedPanelReviews} completed
                  </StatChange>
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
                    onClick={() => navigate("/reviews/my")}
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
          <>
            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                $bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                $textColor="white"
                $accentColor="#667eea"
                $clickable
                onClick={() => navigate("/awards")}
              >
                <Card.Body>
                  <StatHeader>
                    <StatIcon $iconBg="rgba(255, 255, 255, 0.2)">
                      <BiTrophy />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>
                    {finalizedNominations.filter(
                      (n) => n.nominee_id === user?.id
                    ).length}
                  </StatValue>
                  <StatLabel>Awards Received</StatLabel>
                </Card.Body>
              </StatCard>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <StatCard
                $bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                $textColor="white"
                $accentColor="#43e97b"
                $clickable
                onClick={() => navigate("/cycles")}
              >
                <Card.Body>
                  <StatHeader>
                    <StatIcon $iconBg="rgba(255, 255, 255, 0.2)">
                      <BiBook />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>{openCycles.length}</StatValue>
                  <StatLabel>Active Cycles</StatLabel>
                </Card.Body>
              </StatCard>
            </Col>
          </>
        )}
      </Row>
    </DashboardContainer>
  );
};

export default Dashboard;
