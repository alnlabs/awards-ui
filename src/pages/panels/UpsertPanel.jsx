import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import AppButton from "../../components/common/AppButton";
import Loading from "../../components/common/Loading";

import {
  createNewPanel,
  updateExistingPanel,
  fetchPanelById,
} from "../../store/slices/panelSlice";

export default function UpsertPanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { panelId } = useParams();

  const isEditMode = Boolean(panelId);

  const { panelById, loading } = useSelector((state) => state.panels);
  const panel = panelById[panelId];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  /**
   * Fetch panel when editing
   */
  useEffect(() => {
    if (isEditMode && panelId) {
      dispatch(fetchPanelById(panelId));
    }
  }, [dispatch, isEditMode, panelId]);

  /**
   * Populate form when panel is loaded
   */
  useEffect(() => {
    if (isEditMode && panel) {
      setName(panel.name || "");
      setDescription(panel.description || "");
    }
  }, [isEditMode, panel]);

  if (isEditMode && loading && !panel) {
    return <Loading />;
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      return; // toast handled in slice if needed
    }

    const payload = { name, description };

    let result;

    if (isEditMode) {
      result = await dispatch(
        updateExistingPanel({
          panelId,
          payload,
        })
      );
    } else {
      result = await dispatch(createNewPanel(payload));
    }

    // Navigate only if request succeeded
    if (!result.error) {
      navigate("/panels");
    }
  };

  return (
    <>
      <PageHeader
        title={isEditMode ? "Edit Panel" : "Create Panel"}
        subtitle={
          isEditMode
            ? "Update panel configuration"
            : "Define a reusable review panel"
        }
      />

      <Card>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Leadership Review Panel"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </div>

        <div className="d-flex gap-2">
          <AppButton onClick={handleSubmit} disabled={loading}>
            {isEditMode ? "Update Panel" : "Save Panel"}
          </AppButton>

          <AppButton
            variant="secondary"
            onClick={() => navigate("/panels")}
            disabled={loading}
          >
            Cancel
          </AppButton>
        </div>
      </Card>
    </>
  );
}
