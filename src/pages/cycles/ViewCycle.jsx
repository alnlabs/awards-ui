import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Badge } from "react-bootstrap";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { BiEdit } from "react-icons/bi";

import PageHeader from "../../components/common/PageHeader";
import { Card, CardBody } from "../../components/common/Card";
import AppButton from "../../components/common/AppButton";
import Loading from "../../components/common/Loading";
import api from "../../services/api";
import { USER_ROLES } from "../../utils/constants";
import { formatDate } from "../../utils/dateUtils";

const ViewCycle = () => {
  // ✅ CORRECT PARAM NAME
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pendingStatus, setPendingStatus] = useState(null); // OPEN | CLOSED
  const [updating, setUpdating] = useState(false);
  const [showEarlyClosureModal, setShowEarlyClosureModal] = useState(false);

  /* =====================
     Fetch cycle
  ===================== */
  useEffect(() => {
    if (!cycleId) {
      setError("Invalid cycle id");
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadCycle = async () => {
      try {
        // ✅ api returns BUSINESS DATA directly
        const data = await api.get(`/cycles/${cycleId}`);
        if (mounted) setCycle(data);
      } catch {
        if (mounted) {
          setError("Failed to load award cycle");
          toast.error("Failed to load cycle");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCycle();
    return () => {
      mounted = false;
    };
  }, [cycleId]);

  /* =====================
     Update Status
  ===================== */
  const handleUpdateStatus = async (dropCycle = false, statusOverride = null) => {
    const statusToUse = statusOverride || pendingStatus;
    if (!statusToUse || !cycle) return;

    setUpdating(true);
    try {
      await api.patch(`/cycles/${cycle.id}`, {
        status: statusToUse,
        drop_cycle: dropCycle
      });

      toast.success(`Cycle ${statusToUse.toLowerCase()} successfully`);
      setCycle((prev) => ({ ...prev, status: statusToUse }));
      setPendingStatus(null);
      setShowEarlyClosureModal(false);
    } catch (err) {
      toast.error(err?.error || "Failed to update cycle status");
    } finally {
      setUpdating(false);
    }
  };

  const handleEarlyClosureChoice = (drop) => {
    handleUpdateStatus(drop, "CLOSED");
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
            The award cycle may not exist or you don’t have access.
          </p>
          <AppButton onClick={() => navigate("/cycles")}>
            Back to Cycles
          </AppButton>
        </CardBody>
      </Card>
    );
  }

  if (!cycle) {
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
            {(user?.role === USER_ROLES.HR || user?.role === USER_ROLES.SUPER_ADMIN) && cycle.status === "DRAFT" && (
              <AppButton
                icon={BiEdit}
                variant="outline-primary"
                onClick={() => navigate(`/cycles/${cycleId}/edit`)}
              >
                Edit
              </AppButton>
            )}

            {/* Activate/Deactivate cycle - only toggle between DRAFT and ACTIVE */}
            {(user?.role === USER_ROLES.HR || user?.role === USER_ROLES.SUPER_ADMIN) && cycle.status === "DRAFT" && (
              <AppButton
                variant="success"
                onClick={() => setPendingStatus("ACTIVE")}
              >
                Activate Cycle
              </AppButton>
            )}
            
            {(user?.role === USER_ROLES.HR || user?.role === USER_ROLES.SUPER_ADMIN) && cycle.status === "ACTIVE" && (
              <>
                <AppButton
                  variant="outline-secondary"
                  onClick={() => setPendingStatus("DRAFT")}
                >
                  Deactivate Cycle
                </AppButton>
                <AppButton
                  variant="outline-primary"
                  icon={BiEdit}
                  onClick={() => navigate(`/cycles/${cycleId}/edit`)}
                >
                  Edit Details
                </AppButton>
              </>
            )}

            {/* Close cycle */}
            {(user?.role === USER_ROLES.HR || user?.role === USER_ROLES.SUPER_ADMIN) && cycle.status === "OPEN" && (
              <AppButton
                variant={new Date(cycle.end_date) < new Date().setHours(0,0,0,0) ? "primary" : "danger"}
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
                {new Date(cycle.end_date) < new Date().setHours(0,0,0,0) ? "Finalize & Close Cycle" : "Close Cycle"}
              </AppButton>
            )}

            <AppButton variant="secondary" onClick={() => navigate("/cycles")}>
              Back
            </AppButton>
          </>
        }
      />

      {cycle.status === "OPEN" && new Date(cycle.end_date) < new Date().setHours(0,0,0,0) && (
        <Card className="mb-3 border-danger">
          <CardBody className="bg-danger bg-opacity-10 text-danger">
            <div className="d-flex align-items-center gap-2">
              <strong>OVERDUE:</strong>
              <span>This cycle's period ended on {formatDate(cycle.end_date)}. Please close the cycle to proceed with the final review and awards.</span>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <p>
            <strong>Status:</strong>
            <Badge bg="secondary" className="ms-2">
              {cycle.status}
            </Badge>
            {cycle.status === "OPEN" && new Date(cycle.end_date) < new Date().setHours(0,0,0,0) && (
              <Badge bg="danger" className="ms-2">OVERDUE</Badge>
            )}
          </p>

          <p>
            <strong>Quarter:</strong> {cycle.quarter} {cycle.year}
          </p>

          <p>
            <strong>Period:</strong>{" "}
            {formatDate(cycle.start_date)} –{" "}
            {formatDate(cycle.end_date)}
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
         Confirmation Modal
      ===================== */}
      <Modal
        show={!!pendingStatus}
        onHide={() => !updating && setPendingStatus(null)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton={!updating}>
          <Modal.Title>
            {pendingStatus === "ACTIVE"
              ? "Activate Award Cycle"
              : "Close Award Cycle"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {pendingStatus === "ACTIVE" ? (
            <>
              <p>
                You are about to <strong>activate this award cycle</strong>.
              </p>
              <ul>
                <li>Cycle will be scheduled to open automatically when start date arrives</li>
                <li>Nominations will be accepted during the configured window</li>
                <li>You can toggle back to DRAFT anytime before the window opens</li>
              </ul>
            </>
          ) : pendingStatus === "DRAFT" ? (
            <>
              <p>
                You are about to <strong>deactivate this award cycle</strong>.
              </p>
              <ul>
                <li>Cycle will return to DRAFT status</li>
                <li>It will not open automatically</li>
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
            variant={pendingStatus === "ACTIVE" ? "success" : pendingStatus === "DRAFT" ? "warning" : "danger"}
            loading={updating}
            onClick={() => handleUpdateStatus(false)}
          >
            Yes, {pendingStatus === "ACTIVE" ? "Activate" : pendingStatus === "DRAFT" ? "Deactivate" : "Close"} Cycle
          </AppButton>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ViewCycle;
