import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  BiTrophy,
  BiUser,
  BiUserPlus,
  BiListUl,
  BiBook,
  BiCheckCircle,
  BiTimer,
  BiAward,
  BiCalendar,
  BiGroup,
  BiPlus,
  BiChevronRight,
  BiX,
  BiCog,
} from "react-icons/bi";

import { fetchCycles } from "../store/slices/cyclesSlice";
import { fetchNominations } from "../store/slices/nominationsSlice";
import { fetchPanels } from "../store/slices/panelSlice";
import { fetchMyPanelAssignments } from "../store/slices/panelAssignmentsSlice";

import { USER_ROLES, STATUS_COLORS } from "../utils/constants";
import { formatDate } from "../utils/dateUtils";
import Loading from "../components/common/Loading";
import AppButton from "../components/common/AppButton";
import api from "../services/api";

/* =====================
   Styled Components
===================== */

const StatCard = styled(Card)`
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  background: white;
  box-shadow: 0 4px 12px rgba(31, 38, 135, 0.03);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(31, 38, 135, 0.06);
    background: white;
    border-color: #6366f1;
  }

  .card-body {
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
    z-index: 1;
  }
`;

const WatermarkIcon = styled.div`
  position: absolute;
  bottom: -10px;
  right: -10px;
  font-size: 5rem;
  color: ${props => props.color || '#6366f1'};
  opacity: 0.15;
  transform: rotate(-10deg);
  pointer-events: none;
  transition: all 0.4s ease;
  z-index: 0;

  ${StatCard}:hover & {
    transform: rotate(0deg) scale(1.1);
    opacity: 0.25;
  }
`;

const StatIconGlow = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color || 'rgba(99, 102, 241, 0.1)'};
  color: ${props => props.iconColor || '#6366f1'};
  font-size: 1.5rem;
  margin-right: 1.25rem;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;

  ${StatCard}:hover & {
    transform: scale(1.1);
    box-shadow: 0 8px 16px -4px ${props => props.iconColor || '#6366f1'}40;
  }
`;

const StatValue = styled.h2`
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0 0 0.15rem;
  font-family: var(--font-heading);
  letter-spacing: -0.025em;
`;

const StatLabel = styled.p`
  margin: 0;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  white-space: nowrap;
`;

const WelcomeCard = styled.div`
  padding: 2rem 2.5rem;
  border-radius: 24px;
  background: var(--primary-gradient);
  color: white;
  margin-bottom: 2.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;

  &::after {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    filter: blur(40px);
  }

  &::before {
    content: '';
    position: absolute;
    bottom: -80px;
    left: 10%;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
    filter: blur(60px);
  }

  h1 {
    font-size: 2.25rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    font-family: var(--font-heading);
    letter-spacing: -0.025em;
    position: relative;
    z-index: 1;
  }

  p {
    font-size: 1.1rem;
    opacity: 0.95;
    font-weight: 400;
    max-width: 700px;
    margin: 0;
    position: relative;
    z-index: 1;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ContentGrid = styled(Row)`
  margin-top: 0.5rem;
`;

const SidebarSection = styled(Col)`
  @media (max-width: 991px) {
    margin-top: 1.5rem;
  }
`;

const QuickActionsCard = styled(Card)`
  border: none;
  border-radius: 20px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
`;

const QuickActionButton = styled(Button)`
  width: 100%;
  margin-bottom: 0.875rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  
  &:hover {
    transform: translateX(4px);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const RecentActivityCard = styled(Card)`
  border: none;
  border-radius: 20px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
`;

const SectionTitle = styled.h5`
  margin-bottom: 1.5rem;
  font-weight: 800;
  color: var(--text-main);
  font-family: var(--font-heading);
  font-size: 1.25rem;
`;

const ActivityItem = styled.div`
  padding: 1.25rem;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  background: #f8fafc;
  border: 1px solid transparent;
  transition: all 0.2s;

  &:hover {
    background: white;
    border-color: #e2e8f0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  .activity-title {
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 0.25rem;
  }

  .activity-meta {
    font-size: 0.875rem;
    color: var(--text-muted);
  }
`;

/* =====================
   Dashboard (COMMON)
===================== */

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem("hideDashboardWelcome") !== "true";
  });
  const [systemStatus, setSystemStatus] = useState(null);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem("hideDashboardWelcome", "true");
  };

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

  const fetchSystemStatus = useCallback(async () => {
    try {
      const data = await api.get("/system/status");
      setSystemStatus(data);
      
      // Automatically trigger setup wizard if not complete
      if (data && data.setup_complete === false) {
        navigate("/setup");
      }
    } catch (error) {
      console.error("Failed to fetch system status", error);
    }
  }, [navigate]);

  useEffect(() => {
    dispatch(fetchCycles());
    dispatch(fetchNominations({}));

    if (user?.role === USER_ROLES.HR || user?.role === USER_ROLES.SUPER_ADMIN) {
      dispatch(fetchPanels());
    }

    if (user?.role === USER_ROLES.PANEL || user?.is_panel_member) {
      dispatch(fetchMyPanelAssignments());
    }

    if (user?.role === USER_ROLES.SUPER_ADMIN) {
      // Use a timeout or a separate effect to avoid synchronous setState in effect
      const timeout = setTimeout(() => {
        fetchSystemStatus();
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [dispatch, user?.role, user?.is_panel_member, fetchSystemStatus]);

  const loading = cyclesLoading || nominationsLoading;
  if (loading) return <Loading />;

  /* =====================
     Derived Metrics
  ===================== */

  const openCycles = cycles.filter((c) => c.status === "OPEN").length;

  const myNominationsArray = nominations.filter(
    (n) => n.nominated_by_id === user?.id
  );
  const myNominations = myNominationsArray.length;

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
      ? panelAssignments.filter((a) => a.progress?.is_complete === false || a.assignment_status !== "COMPLETED").length
      : 0;

  const _completedPanelReviews =
    user?.role === USER_ROLES.PANEL || user?.is_panel_member
      ? panelAssignments.filter((a) => a.progress?.is_complete === true || a.assignment_status === "COMPLETED").length
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
      {showWelcome && (
        <WelcomeCard>
          <CloseButton onClick={handleCloseWelcome} aria-label="Close welcome banner">
            <BiX />
          </CloseButton>
          <h1>Welcome back, {user?.name}!</h1>
          <p className="mb-0">
            Everything is looking great! Here's a quick look at the awards program activity.
          </p>
        </WelcomeCard>
      )}

      <Row className="g-4 mb-5">
        {/* =====================
            STATS ROW (Role Based)
        ===================== */}
        {(user?.role === USER_ROLES.HR || user?.role === USER_ROLES.SUPER_ADMIN) && (
          <>
            <Col xs={12} sm={6} lg={3}>
              <StatCard>
                <WatermarkIcon color="#6366f1"><BiBook /></WatermarkIcon>
                <Card.Body>
                  <StatIconGlow color="rgba(99, 102, 241, 0.1)" iconColor="#6366f1">
                    <BiBook />
                  </StatIconGlow>
                  <div>
                    <StatValue>{cycles.length}</StatValue>
                    <StatLabel>Total Cycles</StatLabel>
                  </div>
                </Card.Body>
              </StatCard>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <StatCard>
                <WatermarkIcon color="#10b981"><BiTimer /></WatermarkIcon>
                <Card.Body>
                  <StatIconGlow color="rgba(16, 185, 129, 0.1)" iconColor="#10b981">
                    <BiTimer />
                  </StatIconGlow>
                  <div>
                    <StatValue>{openCycles}</StatValue>
                    <StatLabel>Open Cycles</StatLabel>
                  </div>
                </Card.Body>
              </StatCard>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <StatCard>
                <WatermarkIcon color="#8b5cf6"><BiUser /></WatermarkIcon>
                <Card.Body>
                  <StatIconGlow color="rgba(139, 92, 246, 0.1)" iconColor="#8b5cf6">
                    <BiUser />
                  </StatIconGlow>
                  <div>
                    <StatValue>{panels.length}</StatValue>
                    <StatLabel>Active Panels</StatLabel>
                  </div>
                </Card.Body>
              </StatCard>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <StatCard 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate("/nominations")}
              >
                <WatermarkIcon color="#ec4899"><BiCheckCircle /></WatermarkIcon>
                <Card.Body>
                  <StatIconGlow color="rgba(236, 72, 153, 0.1)" iconColor="#ec4899">
                    <BiCheckCircle />
                  </StatIconGlow>
                  <div>
                    <StatValue>{panelReviewNominations}</StatValue>
                    <StatLabel>Panel Reviews</StatLabel>
                    <div style={{ marginTop: '0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)', position: 'relative', zIndex: 1, whiteSpace: 'nowrap' }}>
                      <strong>{hrReviewNominations}</strong> pending HR
                    </div>
                  </div>
                </Card.Body>
              </StatCard>
            </Col>
          </>
        )}

        {user?.role === USER_ROLES.MANAGER && (
          <>
            <Col xs={12} sm={4}>
              <StatCard>
                <WatermarkIcon color="#6366f1"><BiListUl /></WatermarkIcon>
                <Card.Body>
                  <StatIconGlow color="rgba(99, 102, 241, 0.1)" iconColor="#6366f1">
                    <BiListUl />
                  </StatIconGlow>
                  <div>
                    <StatValue>{myNominations}</StatValue>
                    <StatLabel>My Nominations</StatLabel>
                  </div>
                </Card.Body>
              </StatCard>
            </Col>
            <Col xs={12} sm={4}>
              <StatCard>
                <WatermarkIcon color="#10b981"><BiBook /></WatermarkIcon>
                <Card.Body>
                  <StatIconGlow color="rgba(16, 185, 129, 0.1)" iconColor="#10b981">
                    <BiBook />
                  </StatIconGlow>
                  <div>
                    <StatValue>{openCycles}</StatValue>
                    <StatLabel>Open Cycles</StatLabel>
                  </div>
                </Card.Body>
              </StatCard>
            </Col>
            <Col xs={12} sm={4}>
              <StatCard>
                <WatermarkIcon color="#f59e0b"><BiTrophy /></WatermarkIcon>
                <Card.Body>
                  <StatIconGlow color="rgba(245, 158, 11, 0.1)" iconColor="#f59e0b">
                    <BiTrophy />
                  </StatIconGlow>
                  <div>
                    <StatValue>{finalizedNominations}</StatValue>
                    <StatLabel>Finalized Awards</StatLabel>
                  </div>
                </Card.Body>
              </StatCard>
            </Col>
          </>
        )}

        {(user?.role === USER_ROLES.PANEL || user?.is_panel_member) && (
          <>
            <Col xs={12} sm={6}>
              <StatCard 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate("/reviews")}
              >
                <WatermarkIcon color="#6366f1"><BiTimer /></WatermarkIcon>
                <Card.Body>
                  <StatIconGlow color="rgba(99, 102, 241, 0.1)" iconColor="#6366f1">
                    <BiTimer />
                  </StatIconGlow>
                  <div>
                    <StatValue>{_pendingPanelReviews}</StatValue>
                    <StatLabel>Pending Reviews</StatLabel>
                  </div>
                </Card.Body>
              </StatCard>
            </Col>
            <Col xs={12} sm={6}>
              <StatCard 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate("/reviews")}
              >
                <WatermarkIcon color="#10b981"><BiCheckCircle /></WatermarkIcon>
                <Card.Body>
                  <StatIconGlow color="rgba(16, 185, 129, 0.1)" iconColor="#10b981">
                    <BiCheckCircle />
                  </StatIconGlow>
                  <div>
                    <StatValue>{panelAssignments.length}</StatValue>
                    <StatLabel>Total Assignments</StatLabel>
                  </div>
                </Card.Body>
              </StatCard>
            </Col>
          </>
        )}

        {user?.role === USER_ROLES.EMPLOYEE && !user?.is_panel_member && (
          <Col xs={12} md={6}>
            <StatCard>
              <WatermarkIcon color="#6366f1"><BiTrophy /></WatermarkIcon>
              <Card.Body>
                <StatIconGlow color="rgba(99, 102, 241, 0.1)" iconColor="#6366f1">
                  <BiTrophy />
                </StatIconGlow>
                <div>
                  <StatValue>{finalizedNominations}</StatValue>
                  <StatLabel>Total Awards Finalized</StatLabel>
                </div>
              </Card.Body>
            </StatCard>
          </Col>
        )}
      </Row>

      <ContentGrid className="g-4">
        {/* =====================
            LEFT CONTENT AREA
        ===================== */}
        <Col xs={12} lg={8} xl={9}>
          <RecentActivityCard className="h-100">
            <Card.Body className="p-4">
              {(user?.role === USER_ROLES.HR || user?.role === USER_ROLES.SUPER_ADMIN) && (
                <>
                  <SectionTitle>Recent Global Nominations</SectionTitle>
                  {recentNominations.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted mb-0">No nominations found in the system.</p>
                    </div>
                  ) : (
                    recentNominations.map((nomination) => {
                      const nominee = nomination.nominee || {};
                      const cycle = nomination.cycle || {};
                      return (
                        <ActivityItem key={nomination.id}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="flex-grow-1">
                              <div className="activity-title">
                                {nominee.name || "Unknown Nominee"}
                              </div>
                              <div className="activity-meta">
                                {cycle.name || "Award Cycle"} • {formatDate(nomination.created_at)}
                              </div>
                            </div>
                             <div>
                               <Badge bg={STATUS_COLORS[nomination.status] || "secondary"} className="px-3 py-2 rounded-pill">
                                 {nomination.status}
                               </Badge>
                             </div>
                          </div>
                        </ActivityItem>
                      );
                    })
                  )}
                  {recentNominations.length > 0 && (
                    <div className="mt-4">
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none fw-bold"
                        onClick={() => navigate("/nominations")}
                      >
                        View All Nominations <BiChevronRight />
                      </Button>
                    </div>
                  )}
                </>
              )}

              {user?.role === USER_ROLES.MANAGER && (
                <>
                  <SectionTitle>My Recent Nominations</SectionTitle>
                  {myNominationsArray.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted mb-3">You haven't submitted any nominations yet.</p>
                      <AppButton onClick={() => navigate("/nominations/new")}>
                        Create Your First Nomination
                      </AppButton>
                    </div>
                  ) : (
                    myNominationsArray
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                      .slice(0, 5)
                      .map((nomination) => {
                        const nominee = nomination.nominee || {};
                        return (
                          <ActivityItem key={nomination.id}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="flex-grow-1">
                                <div className="activity-title">
                                  {nominee.name || nomination.nominee_id}
                                </div>
                                <div className="activity-meta">
                                  {formatDate(nomination.created_at)}
                                </div>
                              </div>
                              <div>
                                <Badge bg={STATUS_COLORS[nomination.status] || "secondary"} className="px-3 py-2 rounded-pill">
                                  {nomination.status}
                                </Badge>
                              </div>
                            </div>
                          </ActivityItem>
                        );
                      })
                  )}
                </>
              )}

              {(user?.role === USER_ROLES.PANEL || user?.is_panel_member) && (
                <>
                  <SectionTitle>My Pending Assignments</SectionTitle>
                  {panelAssignments.filter(a => !a.progress?.is_complete).length === 0 ? (
                    <div className="text-center py-5">
                      <BiCheckCircle size={40} color="#10b981" className="mb-3" />
                      <p className="text-muted mb-0">All caught up! No pending reviews.</p>
                    </div>
                  ) : (
                    panelAssignments
                      .filter(a => !a.progress?.is_complete)
                      .slice(0, 5)
                      .map((assignment) => {
                        const nomination = assignment.nomination || {};
                        const nominee = nomination.nominee || {};
                        return (
                          <ActivityItem key={assignment.assignment_id}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="flex-grow-1">
                                <div className="activity-title">
                                  {nominee.name || "Nominee"}
                                </div>
                                <div className="activity-meta">
                                  {assignment.panel?.name} • Assigned {formatDate(assignment.assigned_at)}
                                </div>
                              </div>
                              <div className="text-end">
                                <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill mb-1">
                                  Pending
                                </Badge>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {assignment.progress?.completed}/{assignment.progress?.total} tasks
                                </div>
                              </div>
                            </div>
                          </ActivityItem>
                        );
                      })
                  )}
                  <div className="mt-4">
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none fw-bold"
                      onClick={() => navigate("/reviews")}
                    >
                      View All Assignments <BiChevronRight />
                    </Button>
                  </div>
                </>
              )}

              {user?.role === USER_ROLES.EMPLOYEE && !user?.is_panel_member && !user?.role === USER_ROLES.MANAGER && (
                <div className="text-center py-5">
                  <SectionTitle>Awards Program</SectionTitle>
                  <p className="text-muted">
                    Welcome to the awards portal. Here you can track your recognition and view program updates.
                  </p>
                </div>
              )}
            </Card.Body>
          </RecentActivityCard>
        </Col>

        {/* =====================
            SIDEBAR (Quick Actions)
        ===================== */}
        <SidebarSection xs={12} lg={4} xl={3}>
          {user?.role === USER_ROLES.SUPER_ADMIN && (
            <QuickActionsCard className="mb-4">
              <Card.Body className="p-4">
                <SectionTitle>System Status</SectionTitle>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Database</span>
                  <Badge bg={systemStatus?.database?.status === 'connected' ? "success" : "danger"}>
                    {systemStatus?.database?.status === 'connected' ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                   <span className="text-muted">Total Users</span>
                   <span className="fw-bold">{systemStatus?.users?.total || '...'}</span>
                </div>
                <div className="d-flex justify-content-between">
                   <span className="text-muted">Active Cycles</span>
                   <span className="fw-bold text-primary">{openCycles}</span>
                </div>
              </Card.Body>
            </QuickActionsCard>
          )}

          <QuickActionsCard className="h-100">
            <Card.Body className="p-4">
              <SectionTitle>Quick Actions</SectionTitle>

              {user?.role === USER_ROLES.SUPER_ADMIN && (
                <div className="mb-4">
                  <h6 className="text-uppercase text-muted fw-bold small mb-2">Platform Control</h6>
                  <QuickActionButton variant="outline-dark" onClick={() => navigate("/admin/settings")}>
                    <BiCog className="me-2" /> System Settings
                  </QuickActionButton>
                </div>
              )}
              
              {(user?.role === USER_ROLES.HR || user?.role === USER_ROLES.SUPER_ADMIN) && (
                <>
                  <QuickActionButton variant="primary" onClick={() => navigate("/cycles/new")}>
                    <BiPlus className="me-2" /> Create New Cycle
                  </QuickActionButton>
                  <QuickActionButton variant="outline-primary" onClick={() => navigate("/nominations")}>
                    <BiListUl className="me-2" /> View All Nominations
                  </QuickActionButton>
                  <QuickActionButton variant="outline-primary" onClick={() => navigate("/awards")}>
                    <BiAward className="me-2" /> Manage Awards
                  </QuickActionButton>
                  <QuickActionButton variant="outline-primary" onClick={() => navigate("/panels")}>
                    <BiGroup className="me-2" /> Manage Panels
                  </QuickActionButton>
                  <QuickActionButton variant="outline-primary" onClick={() => navigate("/users/new")}>
                    <BiUserPlus className="me-2" /> Add Employee
                  </QuickActionButton>
                  <QuickActionButton variant="outline-primary" onClick={() => navigate("/users")}>
                    <BiUser className="me-2" /> User Management
                  </QuickActionButton>
                </>
              )}

              {user?.role === USER_ROLES.MANAGER && (
                <>
                  <QuickActionButton variant="primary" onClick={() => navigate("/nominations/new")}>
                    <BiPlus className="me-2" /> Create Nomination
                  </QuickActionButton>
                  <QuickActionButton variant="outline-primary" onClick={() => navigate("/nominations")}>
                    <BiListUl className="me-2" /> My Nominations
                  </QuickActionButton>
                </>
              )}

              {(user?.role === USER_ROLES.PANEL || user?.is_panel_member) && (
                <QuickActionButton variant="primary" onClick={() => navigate("/reviews")}>
                  <BiCheckCircle className="me-2" /> Go to Reviews
                </QuickActionButton>
              )}

              <QuickActionButton variant="outline-secondary" onClick={() => navigate("/profile")}>
                <BiUser className="me-2" /> View My Profile
              </QuickActionButton>
            </Card.Body>
          </QuickActionsCard>
        </SidebarSection>
      </ContentGrid>
    </Container>
  );
};

export default Dashboard;
