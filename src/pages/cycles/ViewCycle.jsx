import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Badge } from "react-bootstrap";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import PageHeader from "../../components/common/PageHeader";
import { Card, CardBody } from "../../components/common/Card";
import AppButton from "../../components/common/AppButton";
import Loading from "../../components/common/Loading";
import api from "../../services/api";
import { USER_ROLES } from "../../utils/constants";

const ViewCycle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pendingStatus, setPendingStatus] = useState(null); // "OPEN" | "CLOSED"
  const [updating, setUpdating] = useState(false);

  /* =====================
     Fetch cycle
  ===================== */
  useEffect(() => {
    api
      .get(`/cycles/${id}`)
      .then((res) => setCycle(res.data))
      .catch(() => {
        toast.error("Failed to load cycle");
        navigate("/cycles");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  /* =====================
     Update Status
  ===================== */
  const updateStatus = async () => {
    if (!pendingStatus) return;

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

  if (loading) return <Loading />;
  if (!cycle) return null;

  return (
    <>
      <PageHeader
        title={cycle.name}
        subtitle={`${cycle.quarter} ${cycle.year}`}
        actions={
          <>
            {/* Edit → DRAFT only */}
            {user?.role === USER_ROLES.HR && cycle.status === "DRAFT" && (
              <AppButton
                variant="outline-primary"
                onClick={() => navigate(`/cycles/${cycle.id}/edit`)}
              >
                Edit
              </AppButton>
            )}

            {/* Open → DRAFT */}
            {user?.role === USER_ROLES.HR && cycle.status === "DRAFT" && (
              <AppButton
                variant="success"
                onClick={() => setPendingStatus("OPEN")}
              >
                Open Cycle
              </AppButton>
            )}

            {/* Close → OPEN */}
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
                <li>Managers can start submissions</li>
              </ul>
            </>
          ) : (
            <>
              <p>
                You are about to <strong>close this award cycle</strong>.
              </p>
              <ul>
                <li>No new nominations can be submitted</li>
                <li>Pending reviews must be completed</li>
                <li>
                  <strong>This action cannot be undone</strong>
                </li>
              </ul>
            </>
          )}

          <div className="alert alert-warning mb-0">
            Please confirm only if you are absolutely sure.
          </div>
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
