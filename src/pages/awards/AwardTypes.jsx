import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Form, Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import AppButton from "../../components/common/AppButton";

import {
  fetchAwardTypes,
  createAwardType,
  updateAwardType,
  deleteAwardType,
} from "../../store/slices/awardsSlice";

const emptyForm = {
  id: null,
  code: "",
  label: "",
  description: "",
  is_active: true,
};

const AwardTypes = () => {
  const dispatch = useDispatch();
  const { awardTypes = [], loading } = useSelector((state) => state.awards);

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchAwardTypes());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (type) => {
    setForm({
      id: type.id,
      code: type.code,
      label: type.label,
      description: type.description || "",
      is_active: type.is_active,
    });
  };

  const handleReset = () => setForm(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code.trim() || !form.label.trim()) {
      toast.error("Code and label are required");
      return;
    }

    try {
      if (form.id) {
        await dispatch(
          updateAwardType({
            id: form.id,
            data: {
              label: form.label,
              description: form.description || null,
              is_active: form.is_active,
            },
          })
        ).unwrap();
        toast.success("Award type updated");
      } else {
        await dispatch(
          createAwardType({
            code: form.code,
            label: form.label,
            description: form.description || null,
            is_active: form.is_active,
          })
        ).unwrap();
        toast.success("Award type created");
      }
      handleReset();
    } catch (err) {
      toast.error(err || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this award type?"))
      return;

    try {
      await dispatch(deleteAwardType(id)).unwrap();
      toast.success("Award type deactivated");
    } catch (err) {
      toast.error(err || "Failed to deactivate award type");
    }
  };

  if (loading && awardTypes.length === 0) return <Loading />;

  return (
    <>
      <PageHeader
        title="Award Types"
        subtitle="Configure available award types for nominations and awards"
      />

      <Row className="g-3">
        <Col md={5}>
          <Card className="mb-3">
            <Card.Body>
              <h5 className="mb-3">
                {form.id ? "Edit Award Type" : "Create Award Type"}
              </h5>

              <form onSubmit={handleSubmit} className="row g-3">
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Code</Form.Label>
                    <Form.Control
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      disabled={!!form.id}
                      placeholder="EMPLOYEE_OF_THE_QUARTER"
                    />
                    <Form.Text className="text-muted">
                      Unique identifier (used by backend).
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Label</Form.Label>
                    <Form.Control
                      name="label"
                      value={form.label}
                      onChange={handleChange}
                      placeholder="Employee of the Quarter"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Check
                    type="switch"
                    id="is_active"
                    label="Active"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                  />
                </Col>

                <Col xs={12} className="d-flex justify-content-end gap-2">
                  {form.id && (
                    <AppButton
                      type="button"
                      variant="outline-secondary"
                      onClick={handleReset}
                    >
                      Cancel
                    </AppButton>
                  )}
                  <AppButton type="submit">
                    {form.id ? "Update" : "Create"}
                  </AppButton>
                </Col>
              </form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={7}>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Existing Award Types</h5>
              {awardTypes.length === 0 ? (
                <p className="text-muted mb-0">No award types configured yet.</p>
              ) : (
                <Table bordered hover responsive>
                  <thead className="table-light">
                    <tr>
                      <th>Code</th>
                      <th>Label</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {awardTypes.map((t) => (
                      <tr key={t.id}>
                        <td>{t.code}</td>
                        <td>{t.label}</td>
                        <td className="text-muted small">
                          {t.description || "-"}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              t.is_active ? "bg-success" : "bg-secondary"
                            }`}
                          >
                            {t.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <AppButton
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleEdit(t)}
                            >
                              Edit
                            </AppButton>
                            {t.is_active && (
                              <AppButton
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDelete(t.id)}
                              >
                                Deactivate
                              </AppButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AwardTypes;


