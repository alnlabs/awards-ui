import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import {
  Card,
  CardHeader,
  CardBody,
} from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import AppButton from "../../components/common/AppButton";

import {
  submitTaskReview,
  fetchMyPanelAssignments,
} from "../../store/slices/panelAssignmentsSlice";

export default function ReviewAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myAssignments = [], loading } = useSelector(
    (state) => state.panelAssignments
  );

  /* =====================
     Ensure assignments loaded (handles page refresh)
  ===================== */
  useEffect(() => {
    if (!myAssignments || myAssignments.length === 0) {
      dispatch(fetchMyPanelAssignments());
    }
  }, [dispatch, myAssignments?.length]);

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
    // Use either edited score or existing review score
    const currentScore =
      scores[task.task_id] !== undefined
        ? scores[task.task_id]
        : task.review?.score;

    if (currentScore === undefined || currentScore === null || currentScore === "") {
      toast.error("Score is required");
      return;
    }

    setSubmittingTaskId(task.task_id);

    const res = await dispatch(
      submitTaskReview({
        assignmentId: assignment.assignment_id,
        taskId: task.task_id,
        score: Number(currentScore),
        comment: comments[task.task_id] ?? task.review?.comment ?? "",
      })
    );

    setSubmittingTaskId(null);

    if (!res.error) {
      toast.success("Review saved");
    }
  };

  const nomination = assignment.nomination || {};
  const nominee = nomination.nominee || {};
  const cycle = nomination.cycle || {};

  return (
    <>
      <PageHeader
        title={assignment.panel.name}
        subtitle={`Review Nomination: ${nominee.name || nomination.nominee_id}`}
        actions={
          <AppButton variant="secondary" onClick={() => navigate("/reviews")}>
            Back
          </AppButton>
        }
      />

      {/* =====================
         Nomination Details
      ===================== */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="mb-0">Nomination Details</h5>
        </CardHeader>
        <CardBody>
          <Row className="g-3">
            <Col md={6}>
              <strong>Nominee:</strong>
              <div>
                {nominee.name || "N/A"}
                {nominee.email && (
                  <span className="text-muted ms-2">({nominee.email})</span>
                )}
              </div>
              {nominee.employee_code && (
                <small className="text-muted">Code: {nominee.employee_code}</small>
              )}
            </Col>

            {cycle.name && (
              <Col md={6}>
                <strong>Cycle:</strong>
                <div>
                  {cycle.name} ({cycle.quarter} {cycle.year})
                </div>
              </Col>
            )}

            {nomination.nominated_by?.name && (
              <Col md={6}>
                <strong>Nominated By:</strong>
                <div>{nomination.nominated_by.name}</div>
              </Col>
            )}

            <Col md={6}>
              <strong>Status:</strong>
              <div>
                <span className="badge bg-secondary">{nomination.status}</span>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* =====================
         Criteria Responses
      ===================== */}
      {nomination.answers && nomination.answers.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <h5 className="mb-0">Criteria Responses</h5>
          </CardHeader>
          <CardBody>
            {nomination.answers.map((answer, idx) => (
              <div key={idx} className="mb-3">
                <label className="fw-semibold d-block mb-1">
                  {answer.field_key.replace(/_/g, " ").replace(/\b\w/g, (l) =>
                    l.toUpperCase()
                  )}
                </label>
                <div className="border rounded p-2 bg-light">
                  {typeof answer.value === "object"
                    ? JSON.stringify(answer.value, null, 2)
                    : String(answer.value)}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* =====================
         Review Tasks
      ===================== */}
      <Card className="mb-3">
        <CardHeader>
          <h5 className="mb-0">Review Tasks</h5>
        </CardHeader>
        <CardBody>
          {assignment.tasks.map((task) => (
            <div key={task.task_id} className="border rounded p-3 mb-3">
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
            </div>
          ))}
        </CardBody>
      </Card>
    </>
  );
}
