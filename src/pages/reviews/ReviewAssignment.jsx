import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import AppButton from "../../components/common/AppButton";

import { submitTaskReview } from "../../store/slices/panelAssignmentsSlice";
import { BASE_URL } from "../../config/api";

export default function ReviewAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myAssignments = [], loading } = useSelector(
    (state) => state.panelAssignments
  );

  /* =====================
     Resolve assignment locally
  ===================== */
  const assignment = useMemo(
    () => myAssignments.find((a) => a.assignment_id === assignmentId),
    [myAssignments, assignmentId]
  );

  const [scores, setScores] = useState({});
  const [comments, setComments] = useState({});
  const [submittingTaskId, setSubmittingTaskId] = useState(null);

  if (loading) return <Loading />;

  if (!assignment) {
    return (
      <Card>
        <p className="text-danger mb-0">Assignment not found.</p>
      </Card>
    );
  }

  /* =====================
     Submit single task
  ===================== */
  const handleSubmitTask = async (task) => {
    if (scores[task.task_id] === undefined) {
      toast.error("Score is required");
      return;
    }

    setSubmittingTaskId(task.task_id);

    const res = await dispatch(
      submitTaskReview({
        assignmentId: assignment.assignment_id,
        taskId: task.task_id,
        score: Number(scores[task.task_id]),
        comment: comments[task.task_id] || "",
      })
    );

    setSubmittingTaskId(null);

    if (!res.error) {
      toast.success("Review saved");
    }
  };

  return (
    <>
      <PageHeader
        title={assignment.panel.name}
        subtitle={`Review Nomination: ${assignment.nomination.nominee_id}`}
        actions={
          <AppButton variant="secondary" onClick={() => navigate("/reviews")}>
            Back
          </AppButton>
        }
      />

      {/* ================= NOMINATION BASIS ================= */}
      <Card className="mb-4">
        <h6 className="mb-3">Nomination Basis</h6>
        {assignment.nomination.answers && assignment.nomination.answers.length > 0 ? (
          <div className="row g-3">
            {assignment.nomination.answers.map((ans, idx) => (
              <div key={idx} className="col-12 border-bottom pb-2 mb-2">
                <div className="small text-muted fw-bold">{ans.field_key.replace(/_/g, ' ').toUpperCase()}</div>
                <div className="mt-1">{ans.value}</div>
                {ans.attachment && (
                  <div className="mt-2">
                    <a 
                      href={`${BASE_URL}${ans.attachment}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-primary py-0 px-2 small"
                    >
                      View Supporting Document
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted mb-0 small">No responses available for this nomination.</p>
        )}
      </Card>

      <h6 className="mb-3">Review & Score</h6>

      {assignment.tasks.map((task) => (
        <Card key={task.task_id} className="mb-3">
          <h6 className="mb-1">
            {task.title}{" "}
            {!task.is_required && (
              <small className="text-muted">(Optional)</small>
            )}
          </h6>

          {task.description && (
            <p className="text-muted small">{task.description}</p>
          )}

          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Score (Max {task.max_score})</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={task.max_score}
                  value={scores[task.task_id] ?? task.review?.score ?? ""}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [task.task_id]: e.target.value,
                    }))
                  }
                />
              </Form.Group>
            </Col>

            <Col md={7}>
              <Form.Group>
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={comments[task.task_id] ?? task.review?.comment ?? ""}
                  onChange={(e) =>
                    setComments((prev) => ({
                      ...prev,
                      [task.task_id]: e.target.value,
                    }))
                  }
                />
              </Form.Group>
            </Col>

            <Col md={2} className="d-flex">
              <AppButton
                className="w-100"
                loading={submittingTaskId === task.task_id}
                onClick={() => handleSubmitTask(task)}
              >
                Save
              </AppButton>
            </Col>
          </Row>
        </Card>
      ))}
    </>
  );
}
