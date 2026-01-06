import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge, Table, Modal } from "react-bootstrap";
import styled from "styled-components";
import { BiPlus, BiListUl, BiUser, BiTrash } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  fetchNominations,
  fetchNominationHistory,
  deleteNomination,
  deleteAllNominationsForCycle,
} from "../../store/slices/nominationsSlice";
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

  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'single' | 'all', id?: string, cycleId?: string }
  const [deleting, setDeleting] = useState(false);

  /* =====================
     FETCH (ROLE AWARE)
  ===================== */

  useEffect(() => {
    if (!user) return;

    if (user.role === USER_ROLES.MANAGER) {
      dispatch(fetchNominationHistory());
    } else {
      dispatch(fetchNominations({}));
    }
  }, [dispatch, user]);

  if (loading) return <Loading />;

  const displayNominations =
    user?.role === USER_ROLES.MANAGER ? history : nominations;

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
              displayNominations.length > 0 &&
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

      {displayNominations.length === 0 ? (
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
        <>
          {/* Show "Delete All" per cycle if multiple cycles exist */}
          {user?.role === USER_ROLES.HR &&
            Object.keys(nominationsByCycle).length > 1 && (
              <StyledCard className="mb-3">
                <CardHeader>
                  <CardTitle>Bulk Delete by Cycle</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="d-flex flex-wrap gap-2">
                    {Object.values(nominationsByCycle).map((cycle) => (
                      <AppButton
                        key={cycle.cycleId}
                        variant="outline-danger"
                        size="sm"
                        icon={BiTrash}
                        onClick={() =>
                          setDeleteTarget({
                            type: "all",
                            cycleId: cycle.cycleId,
                            cycleName: cycle.cycleName,
                            count: cycle.count,
                          })
                        }
                      >
                        Delete All ({cycle.count}) - {cycle.cycleName}
                      </AppButton>
                    ))}
                  </div>
                </CardBody>
              </StyledCard>
            )}

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
                  {displayNominations.map((n) => {
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
                            ? `${cycle.name} (${cycle.quarter} ${cycle.year})`
                            : n.cycle_id}
                        </td>

                      <td>
                        <Badge bg={STATUS_COLORS[n.status] || "secondary"}>
                          {n.status}
                        </Badge>
                      </td>

                        <td>
                          {n.submitted_at
                            ? new Date(n.submitted_at).toLocaleDateString()
                            : "Draft"}
                        </td>

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
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>
          </CardBody>
        </StyledCard>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={!!deleteTarget}
        onHide={() => !deleting && setDeleteTarget(null)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton={!deleting}>
          <Modal.Title>
            {deleteTarget?.type === "single"
              ? "Delete Nomination"
              : "Delete All Nominations"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {deleteTarget?.type === "single" ? (
            <>
              <p>
                Are you sure you want to delete the nomination for{" "}
                <strong>{deleteTarget.nomineeName}</strong>?
              </p>
              <p className="text-danger">
                <strong>Warning:</strong> This will permanently delete:
              </p>
              <ul>
                <li>The nomination</li>
                <li>All form answers</li>
                <li>All panel assignments</li>
                <li>All panel reviews</li>
              </ul>
              <p className="text-danger">
                <strong>This action cannot be undone.</strong>
              </p>
            </>
          ) : (
            <>
              <p>
                Are you sure you want to delete{" "}
                <strong>
                  all {deleteTarget?.count || ""} nomination(s) for{" "}
                  {deleteTarget?.cycleName || "this cycle"}
                </strong>
                ?
              </p>
              <p className="text-danger">
                <strong>Warning:</strong> This will permanently delete:
              </p>
              <ul>
                <li>
                  All {deleteTarget?.count || ""} nomination(s) for{" "}
                  {deleteTarget?.cycleName || "this cycle"}
                </li>
                <li>All form answers</li>
                <li>All panel assignments</li>
                <li>All panel reviews</li>
              </ul>
              <p className="text-danger">
                <strong>This action cannot be undone.</strong>
              </p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <AppButton
            variant="outline-secondary"
            disabled={deleting}
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </AppButton>

          <AppButton
            variant="danger"
            loading={deleting}
            onClick={handleDelete}
          >
            {deleteTarget?.type === "single"
              ? "Delete Nomination"
              : "Delete All"}
          </AppButton>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Nominations;
