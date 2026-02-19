import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Form, Spinner, Table } from "react-bootstrap";

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

  // selectedPanels now stores objects: { panel_id, role }
  const [panelAssignments, setPanelAssignments] = useState([]);

  /* =====================
     Load panels
  ===================== */
  useEffect(() => {
    dispatch(fetchPanels());
  }, [dispatch]);

  /* =====================
     Handlers
  ===================== */
  const handleRoleChange = (panelId, role) => {
    setPanelAssignments((prev) => {
      const existing = prev.find((pa) => pa.panel_id === panelId);
      
      if (role === "") {
        // Remove if "None" selected
        return prev.filter((pa) => pa.panel_id !== panelId);
      }

      if (existing) {
        return prev.map((pa) => 
          pa.panel_id === panelId ? { ...pa, role } : pa
        );
      } else {
        return [...prev, { panel_id: panelId, role }];
      }
    });
  };

  const handleAssign = async () => {
    if (panelAssignments.length === 0) {
      alert("Please assign at least one panel");
      return;
    }

    // Ensure we send objects with panel_id and role
    const res = await dispatch(
      assignPanelsToNomination({
        nominationId,
        assignments: panelAssignments, // Expects [{panel_id: UUID, role: "CHAIR"|"REVIEWER"}]
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
                  <th>Panel Name</th>
                  <th>Description</th>
                  <th style={{ width: '150px' }}>Assignment</th>
                </tr>
              </thead>
              <tbody>
                {panels.map((panel) => {
                  const assignment = panelAssignments.find(pa => pa.panel_id === panel.id);
                  return (
                    <tr key={panel.id}>
                      <td>
                        <strong>{panel.name}</strong>
                      </td>
                      <td className="small text-muted">
                        {panel.description || "-"}
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={assignment?.role || ""}
                          onChange={(e) => handleRoleChange(panel.id, e.target.value)}
                        >
                          <option value="">None</option>
                          <option value="REVIEWER">Reviewer</option>
                          <option value="CHAIR">Chair</option>
                        </Form.Select>
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
          disabled={loading || panelAssignments.length === 0}
        >
          {loading ? "Assigning..." : "Assign Panels"}
        </AppButton>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignPanelsModal;
