import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Modal, Form } from "react-bootstrap";

import AppButton from "../../components/common/AppButton";
import {
  addMemberToPanel,
  updatePanelMember,
} from "../../store/slices/panelSlice";
import { USER_ROLES } from "../../utils/constants";

/**
 * UpsertPanelMemberModal
 */
export default function UpsertPanelMemberModal({
  panelId,
  users = [],
  member = null,
  onClose,
}) {
  const dispatch = useDispatch();
  const isEdit = Boolean(member);

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("REVIEWER");

  /* =====================
     Init for edit
  ===================== */
  useEffect(() => {
    if (member) {
      setUserId(member.user_id);
      setRole(member.role);
    } else {
      setUserId("");
      setRole("REVIEWER");
    }
  }, [member]);

  /* =====================
     Submit
  ===================== */
  const handleSubmit = () => {
    if (!userId) {
      alert("Please select a user");
      return;
    }

    const action = isEdit
      ? updatePanelMember({
          panelId,
          memberId: member.id,
          payload: { role },
        })
      : addMemberToPanel({
          panelId,
          payload: {
            user_id: userId,
            role,
          },
        });

    dispatch(action).then(() => onClose());
  };

  /* =====================
     FILTER: Exclude MANAGERS
  ===================== */
  const eligibleUsers = users.filter((u) => u.role !== USER_ROLES.MANAGER);

  return (
    <Modal show onHide={onClose} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? "Edit Panel Member" : "Add Panel Member"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>User</Form.Label>
            <Form.Select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isEdit}
            >
              <option value="">Select user</option>

              {eligibleUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </Form.Select>

            {!isEdit && (
              <Form.Text muted>
                Managers cannot be added as panel members
              </Form.Text>
            )}

            {isEdit && (
              <Form.Text muted>User cannot be changed once added</Form.Text>
            )}
          </Form.Group>

          <Form.Group>
            <Form.Label>Role</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="REVIEWER">Reviewer</option>
              <option value="CHAIR">Chair</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <AppButton variant="secondary" onClick={onClose}>
          Cancel
        </AppButton>
        <AppButton variant="primary" onClick={handleSubmit}>
          {isEdit ? "Update Member" : "Add Member"}
        </AppButton>
      </Modal.Footer>
    </Modal>
  );
}
