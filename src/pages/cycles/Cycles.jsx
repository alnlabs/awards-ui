import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { BiPlus, BiEdit, BiCalendar, BiBook } from "react-icons/bi";

import { fetchCycles } from "../../store/slices/cyclesSlice";
import { STATUS_COLORS, USER_ROLES } from "../../utils/constants";
import Loading from "../../components/common/Loading";
import PageHeader from "../../components/common/PageHeader";
import AppButton from "../../components/common/AppButton";
import {
  Card as StyledCard,
  CardHeader,
  CardTitle,
  CardBody,
} from "../../components/common/Card";

/* =====================
   Styled Components
===================== */

const CycleGrid = styled(Row)`
  --bs-gutter-x: 1.25rem;
  --bs-gutter-y: 1.25rem;
`;

const CycleCard = styled(StyledCard)`
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-3px);
  }
`;

const CardFooterActions = styled.div`
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
`;

/* =====================
   Component
===================== */

const Cycles = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cycles, loading } = useSelector((state) => state.cycles);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCycles());
  }, [dispatch]);

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        icon={BiBook}
        title="Award Cycles"
        subtitle="Manage quarterly award cycles"
        actions={
          user?.role === USER_ROLES.HR && (
            <AppButton icon={BiPlus} onClick={() => navigate("/cycles/new")}>
              New Cycle
            </AppButton>
          )
        }
      />

      {cycles.length === 0 ? (
        <StyledCard>
          <CardBody className="text-center py-5">
            <BiCalendar style={{ fontSize: "3.5rem", color: "#dee2e6" }} />
            <h4>No cycles yet</h4>
            <p className="text-muted mb-3">
              Create your first award cycle to get started
            </p>
            <AppButton icon={BiPlus} onClick={() => navigate("/cycles/new")}>
              Create Cycle
            </AppButton>
          </CardBody>
        </StyledCard>
      ) : (
        <CycleGrid>
          {cycles.map((cycle) => (
            <Col key={cycle.id} xs={12} md={6} lg={4}>
              <CycleCard>
                <CardHeader>
                  <CardTitle>{cycle.name}</CardTitle>
                  <Badge bg={STATUS_COLORS[cycle.status] || "secondary"}>
                    {cycle.status}
                  </Badge>
                </CardHeader>

                <CardBody>
                  <p>
                    <strong>Quarter:</strong> {cycle.quarter} {cycle.year}
                  </p>

                  <p>
                    <strong>Period:</strong>{" "}
                    {new Date(cycle.start_date).toLocaleDateString()} –{" "}
                    {new Date(cycle.end_date).toLocaleDateString()}
                  </p>

                  {cycle.description && (
                    <p className="text-muted">{cycle.description}</p>
                  )}

                  <CardFooterActions>
                    {user?.role === USER_ROLES.HR && (
                      <AppButton
                        variant="outline-primary"
                        size="sm"
                        icon={BiEdit}
                        onClick={() => navigate(`/cycles/${cycle.id}/edit`)}
                      >
                        Edit
                      </AppButton>
                    )}

                    <AppButton
                      size="sm"
                      onClick={() => navigate(`/cycles/${cycle.id}/view`)}
                    >
                      View Details
                    </AppButton>
                  </CardFooterActions>
                </CardBody>
              </CycleCard>
            </Col>
          ))}
        </CycleGrid>
      )}
    </>
  );
};

export default Cycles;
