import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import AppButton from "../../components/common/AppButton";

import { submitReview } from "../../store/slices/reviewsSlice";

export default function ReviewAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myAssignments = [], loading } = useSelector((state) => state.reviews);

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
    if (!scores[task.task_id]) {
      toast.error("Score is required");
      return;
    }

    setSubmittingTaskId(task.task_id);

    await dispatch(
      submitReview({
        panelAssignmentId: assignment.assignment_id,
        taskId: task.task_id,
        score: Number(scores[task.task_id]),
        comment: comments[task.task_id] || "",
      })
    );

    setSubmittingTaskId(null);
    toast.success("Review saved");
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
                    setScores({
                      ...scores,
                      [task.task_id]: e.target.value,
                    })
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
                    setComments({
                      ...comments,
                      [task.task_id]: e.target.value,
                    })
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
