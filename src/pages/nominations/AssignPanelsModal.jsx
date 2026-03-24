import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Form, Spinner, Table } from "react-bootstrap";

import AppButton from "../../components/common/AppButton";
import { fetchPanels } from "../../store/slices/panelSlice";
import { 
  assignPanelsToNomination, 
  fetchAssignmentsForNomination 
} from "../../store/slices/panelAssignmentsSlice";
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

  // selectedPanelIds stores a simple list of UUIDs
  const [selectedPanelIds, setSelectedPanelIds] = useState([]);

  /* =====================
     Load panels
  ===================== */
  useEffect(() => {
    dispatch(fetchPanels());
  }, [dispatch]);

  /* =====================
     Handlers
  ===================== */
  const togglePanelSelection = (panelId) => {
    setSelectedPanelIds((prev) =>
      prev.includes(panelId)
        ? prev.filter((id) => id !== panelId)
        : [...prev, panelId]
    );
  };

  const handleAssign = async () => {
    if (selectedPanelIds.length === 0) {
      alert("Please select at least one panel");
      return;
    }

    const res = await dispatch(
      assignPanelsToNomination({
        nominationId,
        panelIds: selectedPanelIds,
      })
    );

    if (!res.error) {
      dispatch(fetchNominationById(nominationId));
      dispatch(fetchAssignmentsForNomination(nominationId));
      onClose();
    }
  };

  /* =====================
     Render
  ===================== */
  return (
    <Modal show onHide={onClose} centered backdrop="static" size="lg">
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
          <div className="table-responsive">
            <Table hover align="middle">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Select</th>
                  <th>Panel Name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {panels.map((panel) => {
                  const isSelected = selectedPanelIds.includes(panel.id);
                  return (
                    <tr key={panel.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePanelSelection(panel.id)}
                        />
                      </td>
                      <td>
                        <strong>{panel.name}</strong>
                      </td>
                      <td className="small text-muted">
                        {panel.description || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <AppButton variant="secondary" onClick={onClose}>
          Cancel
        </AppButton>
        <AppButton
          onClick={handleAssign}
          disabled={loading || selectedPanelIds.length === 0}
        >
          {loading ? "Assigning..." : "Assign Panels"}
        </AppButton>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignPanelsModal;
