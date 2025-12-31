// src/pages/reviews/AssignmentReviews.jsx

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Table, Badge } from "react-bootstrap";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import AppButton from "../../components/common/AppButton";

import { fetchAssignmentReviews } from "../../store/slices/reviewsSlice";

export default function AssignmentReviews() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { assignmentReviews, loading, error } = useSelector(
    (state) => state.reviews
  );

  const data = assignmentReviews[assignmentId];

  useEffect(() => {
    dispatch(fetchAssignmentReviews(assignmentId));
  }, [dispatch, assignmentId]);

  if (loading || !data) return <Loading />;

  if (error) {
    return (
      <Card>
        <p className="text-danger mb-0">Failed to load assignment reviews.</p>
      </Card>
    );
  }

  const { assignment_status, panel, nomination, reviews } = data;

  return (
    <>
      <PageHeader
        title={`All Reviews – ${panel.name}`}
        subtitle={`Nominee: ${
          nomination.nominee_name || nomination.nominee_id
        }`}
        actions={
          <AppButton
            variant="secondary"
            onClick={() => navigate(`/reviews/${assignmentId}/summary`)}
          >
            Back to Summary
          </AppButton>
        }
      />

      {/* =====================
          Assignment Status
      ===================== */}
      <Card className="mb-3">
        <strong>Status:</strong>{" "}
        <Badge bg={assignment_status === "COMPLETED" ? "success" : "warning"}>
          {assignment_status}
        </Badge>
      </Card>

      {/* =====================
          Reviews Table
      ===================== */}
      <Card>
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>Panel Member</th>
              <th>Task</th>
              <th style={{ width: 120 }}>Score</th>
              <th>Comment</th>
              <th style={{ width: 160 }}>Reviewed At</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  No reviews submitted yet.
                </td>
              </tr>
            )}

            {reviews.map((r) => (
              <tr key={r.review_id}>
                <td>
                  <div className="fw-semibold">{r.reviewer_name}</div>
                  <small className="text-muted">{r.reviewer_email}</small>
                </td>
                <td>
                  <div className="fw-semibold">{r.task_title}</div>
                  <small className="text-muted">Max Score: {r.max_score}</small>
                </td>
                <td>
                  <Badge bg="primary">{r.score}</Badge>
                </td>
                <td>{r.comment || "-"}</td>
                <td>
                  {r.reviewed_at
                    ? new Date(r.reviewed_at).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
