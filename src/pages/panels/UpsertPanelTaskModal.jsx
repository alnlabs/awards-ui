import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Modal, Form, Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";

import AppButton from "../../components/common/AppButton";
import { addTaskToPanel, updatePanelTask } from "../../store/slices/panelSlice";

/**
 * UpsertPanelTaskModal
 * - Uses criteria fields (NO API CALL)
 * - Allows custom task optionally
 */
export default function UpsertPanelTaskModal({
  panelId,
  task = null,
  criteriaList = [],
  onClose,
}) {
  const dispatch = useDispatch();
  const isEdit = Boolean(task);

  /* =====================
     Build criteria field list
  ===================== */
  const criteriaFields = useMemo(() => {
    return criteriaList.flatMap((c) =>
      (c.fields || []).map((f) => ({
        ...f,
        criteria_name: c.name,
      }))
    );
  }, [criteriaList]);

  /* =====================
     State
  ===================== */
  const [criteriaFieldId, setCriteriaFieldId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxScore, setMaxScore] = useState(5);
  const [orderIndex, setOrderIndex] = useState(0);
  const [isRequired, setIsRequired] = useState(true);

  /* =====================
     Init edit mode
     Using queueMicrotask to defer setState and avoid cascading renders
  ===================== */
  useEffect(() => {
    if (!task) return;

    queueMicrotask(() => {
      setCriteriaFieldId(task.criteria_field_id || "");
      setTitle(task.title);
      setDescription(task.description || "");
      setMaxScore(task.max_score);
      setOrderIndex(task.order_index);
      setIsRequired(task.is_required);
    });
  }, [task]);

  /* =====================
     On criteria field select
  ===================== */
  const handleCriteriaFieldChange = (fieldId) => {
    setCriteriaFieldId(fieldId);

    const field = criteriaFields.find((f) => f.id === fieldId);
    if (!field) return;

    setTitle(field.label);
    setDescription(field.description || "");
    setMaxScore(field.max_score || 5);
    setIsRequired(field.is_required ?? true);
  };

  /* =====================
     Submit
  ===================== */
  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    const payload = {
      title,
      description,
      max_score: Number(maxScore),
      order_index: Number(orderIndex),
      is_required: isRequired,
      ...(criteriaFieldId && {
        criteria_field_id: criteriaFieldId,
      }),
    };

    const action = isEdit
      ? updatePanelTask({
          panelId,
          taskId: task.id,
          payload,
        })
      : addTaskToPanel({
          panelId,
          payload,
        });

    dispatch(action).then(() => onClose());
  };

  return (
    <Modal show onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? "Edit Panel Task" : "Add Panel Task"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* =====================
              Criteria field selector (ADD only)
          ===================== */}
          {!isEdit && (
            <Form.Group className="mb-3">
              <Form.Label>Criteria Field (optional)</Form.Label>
              <Form.Select
                value={criteriaFieldId}
                onChange={(e) => handleCriteriaFieldChange(e.target.value)}
              >
                <option value="">Custom task (no criteria)</option>
                {criteriaFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.criteria_name} → {f.label}
                  </option>
                ))}
              </Form.Select>

              <small className="text-muted">
                Selecting a criteria auto-fills title & max score
              </small>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Max Score</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Order</Form.Label>
                <Form.Control
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={4} className="d-flex align-items-end">
              <Form.Check
                type="checkbox"
                label="Required"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
              />
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <AppButton variant="secondary" onClick={onClose}>
          Cancel
        </AppButton>
        <AppButton variant="primary" onClick={handleSubmit}>
          {isEdit ? "Update Task" : "Add Task"}
        </AppButton>
      </Modal.Footer>
    </Modal>
  );
}
