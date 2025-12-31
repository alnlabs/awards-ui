import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import AppButton from "../../components/common/AppButton";
import ConfirmActionModal from "../../components/common/ConfirmActionModal";

import { fetchPanels, deletePanel } from "../../store/slices/panelSlice";
import { fetchUsers } from "../../store/slices/usersSlice";
import { USER_ROLES } from "../../utils/constants";

export default function Panels() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { panels, loading, error } = useSelector((state) => state.panels);
  const { user } = useSelector((state) => state.auth);

  const [confirmPanelId, setConfirmPanelId] = useState(null);

  /* =====================
     Initial Load
  ===================== */
  useEffect(() => {
    dispatch(fetchPanels());
    dispatch(fetchUsers()); // 🔑 preload users for name mapping
  }, [dispatch]);

  /* =====================
     Role checks
  ===================== */
  const isHR = user?.role === USER_ROLES.HR;

  /* =====================
     Delete Handler
  ===================== */
  const handleDeletePanel = async () => {
    if (!confirmPanelId) return;

    await dispatch(deletePanel(confirmPanelId)).unwrap();
    setConfirmPanelId(null);
  };

  /* =====================
     Loading / Error UI
  ===================== */
  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <PageHeader
        title="Panels"
        subtitle="Manage review panels and criteria"
        actions={
          isHR && (
            <AppButton onClick={() => navigate("/panels/new")}>
              Create Panel
            </AppButton>
          )
        }
      />

      {error && (
        <Card className="mb-3">
          <p className="text-danger mb-0">
            Failed to load panels. Please try again.
          </p>
        </Card>
      )}

      {panels.length === 0 ? (
        <Card>
          <p className="text-muted mb-0">
            No panels created yet. Create one to start assigning reviews.
          </p>
        </Card>
      ) : (
        <div className="row g-3">
          {panels.map((panel) => (
            <div key={panel.id} className="col-md-6 col-lg-4">
              <Card>
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h6 className="mb-0">{panel.name}</h6>

                  {typeof panel.is_active === "boolean" && (
                    <span
                      className={`badge ${
                        panel.is_active ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {panel.is_active ? "Active" : "Inactive"}
                    </span>
                  )}
                </div>

                <p className="text-muted small mb-3">
                  {panel.description || "No description provided"}
                </p>

                <div className="d-flex gap-2 flex-wrap">
                  <AppButton
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/panels/${panel.id}`)}
                  >
                    Manage
                  </AppButton>

                  {isHR && (
                    <>
                      <AppButton
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => navigate(`/panels/${panel.id}/edit`)}
                      >
                        Edit
                      </AppButton>

                      <AppButton
                        size="sm"
                        variant="outline-danger"
                        onClick={() => setConfirmPanelId(panel.id)}
                      >
                        Delete
                      </AppButton>
                    </>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* =====================
          Confirm Delete Modal
      ===================== */}
      {confirmPanelId && (
        <ConfirmActionModal
          title="Delete Panel"
          message="This panel will be permanently deleted. Panels already assigned to nominations cannot be deleted."
          confirmText="Delete Panel"
          onCancel={() => setConfirmPanelId(null)}
          onConfirm={handleDeletePanel}
        />
      )}
    </>
  );
}
