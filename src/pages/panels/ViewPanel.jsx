import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import AppButton from "../../components/common/AppButton";
import ConfirmActionModal from "../../components/common/ConfirmActionModal";

import UpsertPanelMemberModal from "./UpsertPanelMemberModal";
import UpsertPanelTaskModal from "./UpsertPanelTaskModal";

import {
  fetchPanelById,
  deletePanel,
  removeMemberFromPanel,
  removeTaskFromPanel,
} from "../../store/slices/panelSlice";
import { fetchUsers } from "../../store/slices/usersSlice";
import { fetchCriteria } from "../../store/slices/criteriaSlice";

export default function ViewPanel() {
  const { panelId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const { panelById, loading } = useSelector((state) => state.panels);
  const { users = [] } = useSelector((state) => state.users);
  const { list: criteriaList = [] } = useSelector((state) => state.criteria);

  const panel = panelById[panelId];

  /* =====================
     Load required data
  ===================== */
  useEffect(() => {
    dispatch(fetchPanelById(panelId));
    dispatch(fetchUsers());

    if (criteriaList.length === 0) {
      dispatch(fetchCriteria()); // ✅ load once
    }
  }, [dispatch, panelId, criteriaList.length]);

  /* =====================
     Build lookups
  ===================== */

  const userMap = useMemo(() => {
    const map = {};
    users.forEach((u) => (map[u.id] = u));
    return map;
  }, [users]);

  const criteriaFieldMap = useMemo(() => {
    const map = {};
    criteriaList.forEach((c) => {
      (c.fields || []).forEach((f) => {
        map[f.id] = f;
      });
    });
    return map;
  }, [criteriaList]);

  if (loading || !panel) {
    return <Loading />;
  }

  /* =====================
     Confirm handlers
  ===================== */

  const handleConfirmDelete = () => {
    if (!confirmState) return;

    if (confirmState.type === "panel") {
      dispatch(deletePanel(panel.id));
      navigate("/panels");
    }

    if (confirmState.type === "member") {
      dispatch(
        removeMemberFromPanel({
          panelId,
          memberId: confirmState.id,
        })
      );
    }

    if (confirmState.type === "task") {
      dispatch(
        removeTaskFromPanel({
          panelId,
          taskId: confirmState.id,
        })
      );
    }

    setConfirmState(null);
  };

  return (
    <>
      <PageHeader
        title={panel.name}
        subtitle={panel.description}
        actions={
          <div className="d-flex gap-2">
            <AppButton
              variant="secondary"
              onClick={() => navigate(`/panels/${panel.id}/edit`)}
            >
              Edit Panel
            </AppButton>

            <AppButton
              variant="danger"
              onClick={() => setConfirmState({ type: "panel", id: panel.id })}
            >
              Delete Panel
            </AppButton>

            <AppButton onClick={() => setShowAddMember(true)}>
              Add Member
            </AppButton>

            <AppButton variant="secondary" onClick={() => setShowAddTask(true)}>
              Add Task
            </AppButton>
          </div>
        }
      />

      {/* =====================
          Panel Members
      ===================== */}
      <Card className="mb-3">
        <h6>Panel Members</h6>

        {(panel.members || []).length === 0 ? (
          <p className="text-muted mb-0">No members added.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {panel.members.map((m) => {
              const user = userMap[m.user_id];

              return (
                <li
                  key={m.id}
                  className="list-group-item d-flex justify-content-between"
                >
                  <div>
                    <div className="fw-semibold">
                      {user?.name || "Unknown User"}
                    </div>
                    <small className="text-muted">
                      {user?.email || m.user_id} · Role: {m.role}
                    </small>
                  </div>

                  <div className="d-flex gap-2">
                    <AppButton
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => setEditMember(m)}
                    >
                      Edit
                    </AppButton>

                    <AppButton
                      size="sm"
                      variant="outline-danger"
                      onClick={() =>
                        setConfirmState({ type: "member", id: m.id })
                      }
                    >
                      Remove
                    </AppButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* =====================
          Panel Tasks (Criteria-aware)
      ===================== */}
      <Card>
        <h6>Panel Tasks</h6>

        {(panel.tasks || []).length === 0 ? (
          <p className="text-muted mb-0">No tasks added.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {panel.tasks
              .slice()
              .sort((a, b) => a.order_index - b.order_index)
              .map((t) => {
                const criteriaField =
                  t.criteria_field_id && criteriaFieldMap[t.criteria_field_id];

                return (
                  <li
                    key={t.id}
                    className="list-group-item d-flex justify-content-between"
                  >
                    <div>
                      <div className="fw-semibold">
                        {criteriaField ? criteriaField.label : t.title}
                        {" · "}
                        Max: {t.max_score}
                      </div>

                      {!t.is_required && (
                        <small className="text-muted">(Optional)</small>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      <AppButton
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => setEditTask(t)}
                      >
                        Edit
                      </AppButton>

                      <AppButton
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          setConfirmState({ type: "task", id: t.id })
                        }
                      >
                        Delete
                      </AppButton>
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </Card>

      {/* =====================
          Modals
      ===================== */}

      {showAddMember && (
        <UpsertPanelMemberModal
          panelId={panelId}
          users={users}
          onClose={() => setShowAddMember(false)}
        />
      )}

      {editMember && (
        <UpsertPanelMemberModal
          panelId={panelId}
          users={users}
          member={editMember}
          onClose={() => setEditMember(null)}
        />
      )}

      {showAddTask && (
        <UpsertPanelTaskModal
          panelId={panelId}
          criteriaList={criteriaList}
          onClose={() => setShowAddTask(false)}
        />
      )}

      {editTask && (
        <UpsertPanelTaskModal
          panelId={panelId}
          task={editTask}
          criteriaList={criteriaList}
          onClose={() => setEditTask(null)}
        />
      )}

      {confirmState && (
        <ConfirmActionModal
          title="Confirm Action"
          message="Are you sure you want to proceed?"
          confirmText="Confirm"
          onCancel={() => setConfirmState(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}
