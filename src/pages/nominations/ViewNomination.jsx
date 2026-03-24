import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "react-bootstrap";
import { BiArrowBack, BiUser, BiCheckCircle, BiGroup, BiFile } from "react-icons/bi";

import {
  fetchNominationById,
  clearCurrentNomination,
} from "../../store/slices/nominationsSlice";

import { fetchAssignmentsForNomination } from "../../store/slices/panelAssignmentsSlice";

import { STATUS_COLORS, USER_ROLES } from "../../utils/constants";
import { formatDateTime } from "../../utils/dateUtils";
import { BASE_URL } from "../../config/api";

import PageHeader from "../../components/common/PageHeader";
import AppButton from "../../components/common/AppButton";
import Loading from "../../components/common/Loading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from "../../components/common/Card";

import AssignPanelsModal from "./AssignPanelsModal";

/* =====================
   Component
===================== */

const ViewNomination = () => {
  const { nominationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentNomination, loading } = useSelector(
    (state) => state.nominations
  );

  // ✅ CORRECT SELECTOR (THIS WAS THE BUG)
  const assignedPanels =
    useSelector(
      (state) => state.panelAssignments.assignmentsByNomination?.[nominationId]
    ) || [];

  const { user } = useSelector((state) => state.auth);

  const [showAssignModal, setShowAssignModal] = useState(false);

  /* =====================
     Load data
  ===================== */
  useEffect(() => {
    if (nominationId) {
      dispatch(fetchNominationById(nominationId));
      dispatch(fetchAssignmentsForNomination(nominationId));
    }

    return () => {
      dispatch(clearCurrentNomination());
    };
  }, [dispatch, nominationId]);

  if (loading || !currentNomination) return <Loading />;

  const {
    nominee,
    nominated_by,
    cycle,
    status,
    submitted_at,
    created_at,
    answers = [],
    reviews = [],
  } = currentNomination;

  /* =====================
     Permissions
  ===================== */
  const canAssignPanels =
    (user?.role === USER_ROLES.HR || user?.role === USER_ROLES.SUPER_ADMIN) && ["SUBMITTED", "HR_REVIEW"].includes(status);

  /* =====================
     Render
  ===================== */
  return (
    <>
      {/* ================= HEADER ================= */}
      <PageHeader
        icon={BiCheckCircle}
        title="View Nomination"
        subtitle={`Status: ${status}`}
        actions={
          <>
            {canAssignPanels && (
              <AppButton
                className="me-2"
                icon={BiGroup}
                onClick={() => setShowAssignModal(true)}
              >
                Assign to Panel
              </AppButton>
            )}

            <AppButton
              variant="secondary"
              icon={BiArrowBack}
              onClick={() => navigate("/nominations")}
            >
              Back
            </AppButton>
          </>
        }
      />

      {/* ================= BASIC INFO ================= */}
      <Card className="mb-3">
        <CardHeader>
          <CardTitle>Nomination Details</CardTitle>
        </CardHeader>

        <CardBody className="row g-3">
          <div className="col-md-6">
            <strong>Nominee</strong>
            <div className="text-muted">
              {nominee?.name} <br />
              <small>{nominee?.email}</small>
            </div>
          </div>

          <div className="col-md-6">
            <strong>Cycle</strong>
            <div className="text-muted">
              {cycle ? `${cycle.name} (${cycle.quarter} ${cycle.year})` : "-"}
            </div>
          </div>

          <div className="col-md-6">
            <strong>Nominated By</strong>
            <div className="text-muted">
              {nominated_by?.name || "System"} <br />
              <small>{nominated_by?.email}</small>
            </div>
          </div>

          <div className="col-md-6">
            <strong>Status</strong>
            <div>
              <Badge bg={STATUS_COLORS[status] || "secondary"}>{status}</Badge>
            </div>
          </div>

          <div className="col-md-6">
            <strong>Submitted At</strong>
            <div className="text-muted">
              {formatDateTime(submitted_at) || "Draft"}
            </div>
          </div>

          <div className="col-md-6">
            <strong>Created At</strong>
            <div className="text-muted">
              {formatDateTime(created_at)}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ================= ANSWERS ================= */}
      <Card className="mb-3">
        <CardHeader>
          <CardTitle>Criteria Responses</CardTitle>
        </CardHeader>

        <CardBody>
          {answers.length === 0 ? (
            <p className="text-muted">No answers submitted</p>
          ) : (
            answers.map((a, idx) => (
              <div key={idx} className="mb-3">
                <label className="fw-semibold">{a.field_key}</label>
                <div className="border rounded p-2 bg-light">
                  {typeof a.value === "object"
                    ? JSON.stringify(a.value)
                    : String(a.value)}
                </div>
                {a.attachment && (
                  <div className="mt-1">
                    <a 
                      href={`${BASE_URL}${a.attachment}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-decoration-none small d-inline-flex align-items-center"
                    >
                      <BiFile className="me-1" /> View Supporting Attachment
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* ================= ASSIGNED PANELS (FIXED) ================= */}
      {/* ================= ASSIGNED PANELS WITH MEMBERS ================= */}
      {assignedPanels.length > 0 && (
        <Card className="mb-3">
          <CardHeader>
            <CardTitle>Assigned Panels</CardTitle>
          </CardHeader>

          <CardBody>
            {assignedPanels.map((a) => (
              <div key={a.assignment_id} className="mb-3 border rounded p-3">
                <div className="fw-semibold">{a.panel?.name || "Unknown Panel"}</div>

                <small className="text-muted d-block mb-2">
                  Status: {a.status} · Assigned at{" "}
                  {formatDateTime(a.assigned_at)}
                </small>

                {/* PANEL MEMBERS */}
                <div>
                  <strong>Members</strong>
                  {(!a.panel?.members || a.panel.members.length === 0) ? (
                    <div className="text-muted small">No members</div>
                  ) : (
                    <ul className="list-group list-group-flush mt-1">
                      {a.panel.members.map((m) => (
                        <li key={m.id} className="list-group-item px-0 py-1">
                          <BiUser className="me-2" />
                          {m.name}{" "}
                          <span className="text-muted small">({m.email})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* ================= PANEL REVIEWS ================= */}
      {(user?.role === USER_ROLES.HR || user?.role === USER_ROLES.SUPER_ADMIN || user?.role === USER_ROLES.PANEL) && (
        <Card>
          <CardHeader>
            <CardTitle>Panel Reviews</CardTitle>
          </CardHeader>

          <CardBody>
            {reviews.length === 0 ? (
              <p className="text-muted">No reviews submitted yet</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="border rounded p-3 mb-2">
                  <div className="d-flex align-items-center mb-1">
                    <BiUser className="me-2" />
                    <strong>{r.reviewer?.name || "Panel Member"}</strong>
                    {r.reviewer?.email && (
                      <span className="text-muted small ms-2">({r.reviewer.email})</span>
                    )}
                  </div>

                  <div className="mb-1">
                    <strong>Score:</strong> {r.score}
                  </div>

                  {r.comment && (
                    <div className="mb-1">
                      <strong>Comments:</strong>
                      <div className="text-muted">{r.comment}</div>
                    </div>
                  )}

                  <div className="text-muted small">
                    {formatDateTime(r.reviewed_at)}
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      )}

      {/* ================= ASSIGN PANELS MODAL ================= */}
      {showAssignModal && (
        <AssignPanelsModal
          nominationId={nominationId}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </>
  );
};

export default ViewNomination;
