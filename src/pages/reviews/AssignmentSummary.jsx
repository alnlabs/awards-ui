import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Badge, ProgressBar } from "react-bootstrap";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import AppButton from "../../components/common/AppButton";

import { fetchAssignmentSummary } from "../../store/slices/reviewsSlice";

export default function AssignmentSummary() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { summaries, loading } = useSelector((state) => state.reviews);
  const summary = summaries[assignmentId];

  useEffect(() => {
    dispatch(fetchAssignmentSummary(assignmentId));
  }, [dispatch, assignmentId]);

  if (loading || !summary) return <Loading />;

  const { assignment_status, panel, nomination, completion, tasks, members } =
    summary;

  return (
    <>
      <PageHeader
        title={`Panel Summary: ${panel.name}`}
        subtitle={`Nominee: ${
          nomination.nominee_name || nomination.nominee_id
        }`}
        actions={
          <>
            <AppButton
              variant="secondary"
              onClick={() => navigate("/nominations")}
            >
              Back
            </AppButton>

            <AppButton
              variant="outline-primary"
              onClick={() => navigate(`/reviews/${assignmentId}/all`)}
            >
              View All Reviews
            </AppButton>
          </>
        }
      />

      {/* =====================
          Assignment Status
      ===================== */}
      <Card className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Assignment Status</h6>
          <Badge bg={assignment_status === "COMPLETED" ? "success" : "warning"}>
            {assignment_status}
          </Badge>
        </div>

        <ProgressBar
          now={completion.percentage}
          label={`${completion.percentage}%`}
          variant={completion.percentage === 100 ? "success" : "info"}
        />
      </Card>

      {/* =====================
          Task-wise Summary
      ===================== */}
      <Card className="mb-3">
        <h6 className="mb-3">Task Summary</h6>

        {tasks.map((t) => (
          <div
            key={t.task_id}
            className="d-flex justify-content-between align-items-center mb-2"
          >
            <div>
              <div className="fw-semibold">
                {t.title}
                {!t.is_required && (
                  <small className="text-muted ms-2">(Optional)</small>
                )}
              </div>
              <small className="text-muted">Max Score: {t.max_score}</small>
            </div>

            <div className="text-end">
              <div>
                Avg Score:{" "}
                <strong>
                  {t.average_score !== null ? t.average_score.toFixed(2) : "-"}
                </strong>
              </div>
              <small className="text-muted">Reviews: {t.review_count}</small>
            </div>
          </div>
        ))}
      </Card>

      {/* =====================
          Panel Member Progress
      ===================== */}
      <Card>
        <h6 className="mb-3">Panel Member Progress</h6>

        {members.map((m) => (
          <div key={m.user_id} className="mb-2">
            <div className="d-flex justify-content-between">
              <span>{m.name}</span>
              <span>
                {m.completed_tasks}/{m.required_tasks}
              </span>
            </div>

            <ProgressBar
              now={m.completion_percentage}
              variant={m.completion_percentage === 100 ? "success" : "info"}
            />
          </div>
        ))}
      </Card>
    </>
  );
}
