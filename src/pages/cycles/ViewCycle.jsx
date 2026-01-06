import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Badge } from "react-bootstrap";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { BiEdit } from "react-icons/bi";

import PageHeader from "../../components/common/PageHeader";
import { Card, CardBody } from "../../components/common/Card";
import AppButton from "../../components/common/AppButton";
import Loading from "../../components/common/Loading";
import { USER_ROLES } from "../../utils/constants";
import {
  fetchCycleById,
  updateCycle,
  clearError,
} from "../../store/slices/cyclesSlice";

const ViewCycle = () => {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { currentCycle, loading, error } = useSelector((state) => state.cycles);

  const [pendingStatus, setPendingStatus] = useState(null); // OPEN | CLOSED
  const [updating, setUpdating] = useState(false);
  const [showEarlyClosureModal, setShowEarlyClosureModal] = useState(false);
  const [dropCycle, setDropCycle] = useState(false);

  /* =====================
     Fetch cycle
  ===================== */
  useEffect(() => {
    if (!cycleId) return;

    dispatch(fetchCycleById(cycleId));

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, cycleId]);

  /* =====================
     Update Status
  ===================== */
  const handleUpdateStatus = async (shouldDrop = false) => {
    if (!pendingStatus || !currentCycle) return;

    setUpdating(true);
    try {
      await dispatch(
        updateCycle({
          id: currentCycle.id,
          data: { 
            status: pendingStatus,
            drop_cycle: shouldDrop,
          },
        })
      ).unwrap();

      const action = shouldDrop ? "dropped" : pendingStatus.toLowerCase();
      toast.success(`Cycle ${action} successfully`);
      setPendingStatus(null);
      setShowEarlyClosureModal(false);
      setDropCycle(false);
      
      // Refresh cycle data
      dispatch(fetchCycleById(cycleId));
    } catch (err) {
      toast.error(err || "Failed to update cycle status");
    } finally {
      setUpdating(false);
    }
  };

  const handleEarlyClosureChoice = async (drop) => {
    setShowEarlyClosureModal(false);
    setUpdating(true);
    
    try {
      await dispatch(
        updateCycle({
          id: currentCycle.id,
          data: { 
            status: "CLOSED",
            drop_cycle: drop,
          },
        })
      ).unwrap();

      const action = drop ? "dropped" : "closed";
      toast.success(`Cycle ${action} successfully`);
      setPendingStatus(null);
      setDropCycle(false);
      
      // Refresh cycle data
      dispatch(fetchCycleById(cycleId));
    } catch (err) {
      toast.error(err || "Failed to update cycle status");
    } finally {
      setUpdating(false);
    }
  };

  /* =====================
     Render Guards
  ===================== */
  if (loading) return <Loading />;

  if (error) {
    return (
      <Card>
        <CardBody className="text-center">
          <h5 className="mb-2">{error}</h5>
          <p className="text-muted">
            The award cycle may not exist or you don't have access.
          </p>
          <AppButton onClick={() => navigate("/cycles")}>
            Back to Cycles
          </AppButton>
        </CardBody>
      </Card>
    );
  }

  if (!currentCycle) {
    return (
      <Card>
        <CardBody className="text-center">
          <h5>Unable to load cycle</h5>
          <AppButton onClick={() => navigate("/cycles")}>
            Back to Cycles
          </AppButton>
        </CardBody>
      </Card>
    );
  }

  const cycle = currentCycle;

  /* =====================
     UI
  ===================== */
  return (
    <>
      <PageHeader
        title={cycle.name}
        subtitle={`${cycle.quarter} ${cycle.year}`}
        actions={
          <>
            {/* Edit (HR + DRAFT only) */}
            {user?.role === USER_ROLES.HR && cycle.status === "DRAFT" && (
              <AppButton
                icon={BiEdit}
                variant="outline-primary"
                onClick={() => navigate(`/cycles/${cycleId}/edit`)}
              >
                Edit
              </AppButton>
            )}

            {/* Open cycle */}
            {user?.role === USER_ROLES.HR && cycle.status === "DRAFT" && (
              <AppButton
                variant="success"
                onClick={() => setPendingStatus("OPEN")}
              >
                Open Cycle
              </AppButton>
            )}

            {/* Close cycle */}
            {user?.role === USER_ROLES.HR && cycle.status === "OPEN" && (
              <AppButton
                variant="danger"
                onClick={() => {
                  // Check if closing before end_date
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const endDate = new Date(cycle.end_date);
                  endDate.setHours(0, 0, 0, 0);
                  
                  if (today < endDate) {
                    // Early closure - show two-option modal
                    setShowEarlyClosureModal(true);
                  } else {
                    // Normal closure
                    setPendingStatus("CLOSED");
                  }
                }}
              >
                Close Cycle
              </AppButton>
            )}

            <AppButton variant="secondary" onClick={() => navigate("/cycles")}>
              Back
            </AppButton>
          </>
        }
      />

      <Card>
        <CardBody>
          <p>
            <strong>Status:</strong>
            <Badge bg="secondary" className="ms-2">
              {cycle.status}
            </Badge>
          </p>

          <p>
            <strong>Quarter:</strong> {cycle.quarter} {cycle.year}
          </p>

          <p>
            <strong>Period:</strong>{" "}
            {new Date(cycle.start_date).toLocaleDateString()} –{" "}
            {new Date(cycle.end_date).toLocaleDateString()}
          </p>

          {cycle.description && (
            <p className="text-muted mt-2">{cycle.description}</p>
          )}
        </CardBody>
      </Card>

      {/* =====================
         Early Closure Confirmation Modal (Two Options)
      ===================== */}
      <Modal
        show={showEarlyClosureModal}
        onHide={() => !updating && setShowEarlyClosureModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton={!updating}>
          <Modal.Title>Early Cycle Closure</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-warning mb-3">
            <strong>Warning:</strong> You are closing this cycle before the scheduled end date.
          </p>
          <p>Please choose how to proceed:</p>
          
          <div className="mb-3">
            <h6>Option 1: End Cycle</h6>
            <ul>
              <li>Close the cycle normally</li>
              <li>Keep all nominations and awards</li>
              <li>Continue with review process</li>
            </ul>
          </div>
          
          <div className="mb-3">
            <h6>Option 2: Drop Cycle</h6>
            <ul>
              <li>Close the cycle and <strong className="text-danger">delete all data</strong></li>
              <li>Remove all nominations</li>
              <li>Remove all awards</li>
              <li><strong className="text-danger">This action cannot be undone</strong></li>
            </ul>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <AppButton
            variant="outline-secondary"
            disabled={updating}
            onClick={() => setShowEarlyClosureModal(false)}
          >
            Cancel
          </AppButton>

          <AppButton
            variant="danger"
            disabled={updating}
            onClick={() => handleEarlyClosureChoice(true)}
          >
            Drop Cycle
          </AppButton>

          <AppButton
            variant="primary"
            disabled={updating}
            onClick={() => handleEarlyClosureChoice(false)}
          >
            End Cycle
          </AppButton>
        </Modal.Footer>
      </Modal>

      {/* =====================
         Normal Confirmation Modal
      ===================== */}
      <Modal
        show={!!pendingStatus && !showEarlyClosureModal}
        onHide={() => !updating && setPendingStatus(null)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton={!updating}>
          <Modal.Title>
            {pendingStatus === "OPEN"
              ? "Open Award Cycle"
              : "Close Award Cycle"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {pendingStatus === "OPEN" ? (
            <>
              <p>
                You are about to <strong>open this award cycle</strong>.
              </p>
              <ul>
                <li>Nominations will be enabled</li>
                <li>Managers can submit nominations</li>
              </ul>
            </>
          ) : (
            <>
              <p>
                You are about to <strong>close this award cycle</strong>.
              </p>
              <ul>
                <li>No new nominations allowed</li>
                <li>All reviews must be completed</li>
                <li>
                  <strong>This action cannot be undone</strong>
                </li>
              </ul>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <AppButton
            variant="outline-secondary"
            disabled={updating}
            onClick={() => setPendingStatus(null)}
          >
            Cancel
          </AppButton>

          <AppButton
            variant={pendingStatus === "OPEN" ? "success" : "danger"}
            loading={updating}
            onClick={() => handleUpdateStatus(false)}
          >
            Yes, {pendingStatus === "OPEN" ? "Open" : "Close"} Cycle
          </AppButton>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ViewCycle;
