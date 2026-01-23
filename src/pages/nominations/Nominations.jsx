import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge, Table, Modal, Form } from "react-bootstrap";
import styled from "styled-components";
import { BiPlus, BiListUl, BiUser } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

import {
  fetchNominations,
  fetchNominationHistory,
} from "../../store/slices/nominationsSlice";
import { fetchCycles } from "../../store/slices/cyclesSlice";
import { STATUS_COLORS, USER_ROLES } from "../../utils/constants";
import { formatDate } from "../../utils/dateUtils";
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

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

/* =====================
   Component
===================== */

const Nominations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const {
    nominations = [],
    history = [],
    loading,
  } = useSelector((state) => state.nominations);
  const { cycles = [], activeCycle } = useSelector((state) => state.cycles);

  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'single' | 'all', id?: string, cycleId?: string }
  const [deleting, setDeleting] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState(""); // Filter by cycle

  /* =====================
     FETCH (ROLE AWARE)
  ===================== */

  useEffect(() => {
    dispatch(fetchCycles());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;

    if (user.role === USER_ROLES.MANAGER) {
      dispatch(fetchNominationHistory());
    } else {
      dispatch(fetchNominations({}));
    }
  }, [dispatch, user]);

  // Auto-select current OPEN cycle or newest cycle
  useEffect(() => {
    if (cycles.length > 0 && !selectedCycleId) {
      // Find OPEN cycle first, fallback to first cycle (newest due to created_at DESC sort)
      const openCycle = cycles.find((c) => c.status === "OPEN");
      const fallbackCycle = openCycle || cycles[0]; // cycles[0] is newest due to API DESC sort
      if (fallbackCycle) {
        setSelectedCycleId(fallbackCycle.id);
      }
    }
  }, [cycles, selectedCycleId]);

  if (loading) return <Loading />;

  const displayNominations =
    user?.role === USER_ROLES.MANAGER ? history : nominations;

  // Filter nominations by selected cycle
  const filteredNominations = selectedCycleId
    ? displayNominations.filter((n) => n.cycle_id === selectedCycleId)
    : displayNominations;

  // Group nominations by cycle for "Delete All" functionality
  const nominationsByCycle = displayNominations.reduce((acc, n) => {
    const cycleId = n.cycle_id;
    if (!acc[cycleId]) {
      acc[cycleId] = {
        cycleId,
        cycleName: n.cycle?.name || `Cycle ${cycleId}`,
        count: 0,
      };
    }
    acc[cycleId].count++;
    return acc;
  }, {});

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "all" && !deleteTarget.cycleId) {
      toast.error("Cycle ID is required to delete all nominations");
      return;
    }

    setDeleting(true);
    try {
      if (deleteTarget.type === "single") {
        await dispatch(deleteNomination(deleteTarget.id)).unwrap();
        toast.success("Nomination deleted successfully");
      } else if (deleteTarget.type === "all" && deleteTarget.cycleId) {
        const result = await dispatch(
          deleteAllNominationsForCycle(deleteTarget.cycleId)
        ).unwrap();
        toast.success(
          `Deleted ${result.deleted_count} nomination(s) successfully`
        );
      }

      // Refresh the list
      if (user.role === USER_ROLES.MANAGER) {
        dispatch(fetchNominationHistory());
      } else {
        dispatch(fetchNominations({}));
      }

      setDeleteTarget(null);
    } catch (err) {
      toast.error(err || "Failed to delete nomination(s)");
    } finally {
      setDeleting(false);
    }
  };

  /* =====================
     UI
  ===================== */

  return (
    <>
      <PageHeader
        icon={BiListUl}
        title="Nominations"
        subtitle={
          user?.role === USER_ROLES.MANAGER
            ? "Your nominations"
            : "All nominations"
        }
        actions={
          <>
            {user?.role === USER_ROLES.MANAGER && (
              <AppButton
                icon={BiPlus}
                onClick={() => navigate("/nominations/new")}
              >
                New Nomination
              </AppButton>
            )}
            {user?.role === USER_ROLES.HR &&
              filteredNominations.length > 0 &&
              Object.keys(nominationsByCycle).length === 1 && (
                <AppButton
                  variant="danger"
                  icon={BiTrash}
                  onClick={() => {
                    const cycles = Object.values(nominationsByCycle);
                    setDeleteTarget({
                      type: "all",
                      cycleId: cycles[0].cycleId,
                      cycleName: cycles[0].cycleName,
                      count: cycles[0].count,
                    });
                  }}
                >
                  Delete All ({Object.values(nominationsByCycle)[0].count})
                </AppButton>
              )}
          </>
        }
      />

      {/* Cycle Filter */}
      {cycles.length > 0 && (
        <StyledCard className="mb-3">
          <CardBody>
            <Form.Group>
              <Form.Label><strong>Filter by Cycle</strong></Form.Label>
              <Form.Select
                value={selectedCycleId}
                onChange={(e) => setSelectedCycleId(e.target.value)}
              >
                <option value="">All Cycles</option>
                {cycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {`${cycle.name} (Q${cycle.quarter} ${cycle.year}) - ${cycle.status}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </CardBody>
        </StyledCard>
      )}

      {filteredNominations.length === 0 ? (
        <StyledCard>
          <CardBody className="text-center py-5">
            <BiListUl
              style={{
                fontSize: "3.5rem",
                color: "#dee2e6",
                marginBottom: "1rem",
              }}
            />
            <h4>No nominations yet</h4>
            <p className="text-muted mb-3">
              {user?.role === USER_ROLES.MANAGER
                ? "Create your first nomination to recognize outstanding employees"
                : "No nominations available"}
            </p>

            {user?.role === USER_ROLES.MANAGER && (
              <AppButton
                icon={BiPlus}
                onClick={() => navigate("/nominations/new")}
              >
                Create Nomination
              </AppButton>
            )}
          </CardBody>
        </StyledCard>
      ) : (
        <StyledCard>
          <CardHeader>
            <CardTitle>Nominations List</CardTitle>
          </CardHeader>

          <CardBody>
            <TableWrapper>
              <Table hover responsive>
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
                  {filteredNominations.map((n) => {
                    const nominee = n.nominee || {};
                    const cycle = n.cycle || {};
                    return (
                      <tr key={n.id}>
                        <td>
                          <BiUser style={{ marginRight: "0.35rem" }} />
                          {nominee.name || n.nominee_id}
                          {nominee.email && (
                            <div className="text-muted small">{nominee.email}</div>
                          )}
                        </td>

                      <td>
                        {cycle.name
                          ? `${cycle.name} (Q${cycle.quarter} ${cycle.year})`
                          : n.cycle_id}
                      </td>

                      <td>
                        <Badge bg={STATUS_COLORS[n.status] || "secondary"}>
                          {n.status}
                        </Badge>
                      </td>

                      <td>{formatDate(n.submitted_at) || "Draft"}</td>

                      <td>
                        <div className="d-flex gap-2">
                          <AppButton
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/nominations/${n.id}/view`)}
                          >
                            View
                          </AppButton>
                          {user?.role === USER_ROLES.HR && (
                            <AppButton
                              variant="outline-danger"
                              size="sm"
                              icon={BiTrash}
                              onClick={() =>
                                setDeleteTarget({
                                  type: "single",
                                  id: n.id,
                                  nomineeName: nominee.name || n.nominee_id,
                                })
                              }
                            >
                              Delete
                            </AppButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          </CardBody>
        </StyledCard>
      )}
    </>
  );
};

export default Nominations;
