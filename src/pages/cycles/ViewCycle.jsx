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
  const updateStatus = async () => {
    if (!pendingStatus || !cycle) return;

    setUpdating(true);
    try {
      await api.patch(`/cycles/${cycle.id}/status`, {
        status: pendingStatus,
      });

      toast.success(`Cycle ${pendingStatus.toLowerCase()} successfully`);
      setCycle((prev) => ({ ...prev, status: pendingStatus }));
      setPendingStatus(null);
    } catch {
      toast.error("Failed to update cycle status");
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
                onClick={() => setPendingStatus("CLOSED")}
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
            onClick={updateStatus}
          >
            Yes, {pendingStatus === "OPEN" ? "Open" : "Close"} Cycle
          </AppButton>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ViewCycle;
