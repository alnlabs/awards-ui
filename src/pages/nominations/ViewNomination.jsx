import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "react-bootstrap";
import { BiArrowBack, BiUser, BiCheckCircle } from "react-icons/bi";

import {
  fetchNominationById,
  clearCurrentNomination,
} from "../../store/slices/nominationsSlice";
import { STATUS_COLORS, USER_ROLES } from "../../utils/constants";

import PageHeader from "../../components/common/PageHeader";
import AppButton from "../../components/common/AppButton";
import Loading from "../../components/common/Loading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from "../../components/common/Card";

/* =====================
   Component
===================== */

const ViewNomination = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentNomination, loading } = useSelector(
    (state) => state.nominations
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchNominationById(id));

    return () => {
      dispatch(clearCurrentNomination());
    };
  }, [dispatch, id]);

  if (loading || !currentNomination) return <Loading />;

  const {
    nominee_id,
    cycle_id,
    status,
    submitted_at,
    created_at,
    answers = [],
    reviews = [],
  } = currentNomination;

  return (
    <>
      <PageHeader
        icon={BiCheckCircle}
        title="View Nomination"
        subtitle={`Status: ${status}`}
        actions={
          <AppButton
            variant="secondary"
            icon={BiArrowBack}
            onClick={() => navigate("/nominations")}
          >
            Back
          </AppButton>
        }
      />

      {/* ================= BASIC INFO ================= */}
      <Card className="mb-3">
        <CardHeader>
          <CardTitle>Nomination Details</CardTitle>
        </CardHeader>

        <CardBody className="row g-3">
          <div className="col-md-6">
            <strong>Nominee ID</strong>
            <div className="text-muted">{nominee_id}</div>
          </div>

          <div className="col-md-6">
            <strong>Cycle ID</strong>
            <div className="text-muted">{cycle_id}</div>
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
              {submitted_at ? new Date(submitted_at).toLocaleString() : "Draft"}
            </div>
          </div>

          <div className="col-md-6">
            <strong>Created At</strong>
            <div className="text-muted">
              {new Date(created_at).toLocaleString()}
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
            answers.map((a) => (
              <div key={a.id} className="mb-3">
                <label className="fw-semibold">{a.field_key}</label>
                <div className="border rounded p-2 bg-light">
                  {typeof a.value === "object"
                    ? JSON.stringify(a.value)
                    : String(a.value)}
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* ================= PANEL REVIEWS ================= */}
      {(user?.role === USER_ROLES.HR || user?.role === USER_ROLES.PANEL) && (
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
                    <strong>Panel Member</strong>
                  </div>

                  <div className="mb-1">
                    <strong>Score:</strong> {r.score} / 5
                  </div>

                  {r.comments && (
                    <div className="mb-1">
                      <strong>Comments:</strong>
                      <div className="text-muted">{r.comments}</div>
                    </div>
                  )}

                  <div className="text-muted small">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      )}
    </>
  );
};

export default ViewNomination;
