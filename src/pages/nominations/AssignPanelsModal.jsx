import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Form, Spinner } from "react-bootstrap";

import AppButton from "../../components/common/AppButton";
import { fetchPanels } from "../../store/slices/panelSlice";
import { assignPanelsToNomination } from "../../store/slices/panelAssignmentsSlice";
import { fetchNominationById } from "../../store/slices/nominationsSlice";

/**
 * AssignPanelsModal
 *
 * Props:
 * - nominationId
 * - onClose
 */
const AssignPanelsModal = ({ nominationId, onClose }) => {
  const dispatch = useDispatch();

  const { panels, loading: panelsLoading } = useSelector(
    (state) => state.panels
  );
  const { loading } = useSelector((state) => state.panelAssignments);

  const [selectedPanels, setSelectedPanels] = useState([]);

  /* =====================
     Load panels
  ===================== */
  useEffect(() => {
    dispatch(fetchPanels());
  }, [dispatch]);

  /* =====================
     Handlers
  ===================== */
  const togglePanel = (panelId) => {
    setSelectedPanels((prev) =>
      prev.includes(panelId)
        ? prev.filter((id) => id !== panelId)
        : [...prev, panelId]
    );
  };

  const handleAssign = async () => {
    if (selectedPanels.length === 0) {
      alert("Please select at least one panel");
      return;
    }

    const res = await dispatch(
      assignPanelsToNomination({
        nominationId,
        panelIds: selectedPanels, // ✅ FIXED
      })
    );

    if (!res.error) {
      dispatch(fetchNominationById(nominationId));
      onClose();
    }
  };

  /* =====================
     Render
  ===================== */
  return (
    <Modal show onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Assign Panels</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {panelsLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : panels.length === 0 ? (
          <p className="text-muted text-center">
            No panels available. Create a panel first.
          </p>
        ) : (
          <Form>
            {panels.map((panel) => (
              <Form.Check
                key={panel.id}
                type="checkbox"
                className="mb-2"
                label={
                  <div>
                    <strong>{panel.name}</strong>
                    {panel.description && (
                      <div className="text-muted small">
                        {panel.description}
                      </div>
                    )}
                  </div>
                }
                checked={selectedPanels.includes(panel.id)}
                onChange={() => togglePanel(panel.id)}
              />
            ))}
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <AppButton variant="secondary" onClick={onClose}>
          Cancel
        </AppButton>
        <AppButton
          onClick={handleAssign}
          disabled={loading || selectedPanels.length === 0}
        >
          {loading ? "Assigning..." : "Assign Panels"}
        </AppButton>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignPanelsModal;
