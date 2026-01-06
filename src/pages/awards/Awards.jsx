import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Col, Badge, Table, Form, Alert } from "react-bootstrap";
import toast from "react-hot-toast";
import styled from "styled-components";
import { BiTrophy, BiAward, BiMedal, BiPlus } from "react-icons/bi";

import {
  fetchNominationsWithScores,
  fetchAwardTypes,
  createAwardType,
  updateAwardType,
  deleteAwardType,
} from "../../store/slices/awardsSlice";

import Loading from "../../components/common/Loading";
import PageHeader from "../../components/common/PageHeader";
import { Card as StyledCard, CardBody } from "../../components/common/Card";
import AppButton from "../../components/common/AppButton";
import { USER_ROLES } from "../../utils/constants";

/* =====================
   Styled Components
===================== */

const AwardsGrid = styled(Row)`
  --bs-gutter-x: 1.25rem;
  --bs-gutter-y: 1.25rem;
`;

const AwardCard = styled(StyledCard)`
  height: 100%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  text-align: center;
`;

const AwardIcon = styled.div`
  font-size: 3.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.9;
`;

const WinnersList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-top: 2rem;
`;

const WinnerCard = styled(StyledCard)`
  height: 100%;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .card-body {
    padding: 1.75rem 1.25rem;
  }
`;

/* =====================
   Component
===================== */

const Awards = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeCycle } = useSelector((state) => state.cycles);
  const { user } = useSelector((state) => state.auth);
  const { nominationsWithScores, awardTypes = [], loading } = useSelector(
    (state) => state.awards
  );

  // Awards can be created during nomination window (OPEN) or if there's an OPEN cycle
  const canCreateAwards = activeCycle?.status === "OPEN";

  // Local form state for award type CRUD
  const emptyForm = {
    id: null,
    code: "",
    label: "",
    description: "",
    is_active: true,
  };
  const [typeForm, setTypeForm] = useState(emptyForm);
  const [codeTouched, setCodeTouched] = useState(false);

  useEffect(() => {
    if (activeCycle?.id) {
      dispatch(fetchNominationsWithScores(activeCycle.id));
    }
    if (user?.role === USER_ROLES.HR) {
      dispatch(fetchAwardTypes());
    }
  }, [dispatch, activeCycle, user]);

  const handleTypeChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Track when user manually edits the code field so we don't overwrite it
    if (name === "code") {
      setCodeTouched(true);
    }

    setTypeForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Auto-generate code from label when creating a new type and
      // user hasn't manually changed the code.
      if (name === "label" && !prev.id && !codeTouched) {
        const slug =
          value
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "") || "";
        next.code = slug;
      }

      return next;
    });
  };

  const handleTypeEdit = (t) => {
    setTypeForm({
      id: t.id,
      code: t.code,
      label: t.label,
      description: t.description || "",
      is_active: t.is_active,
    });
    setCodeTouched(true); // don't auto-regenerate code while editing
  };

  const resetTypeForm = () => {
    setTypeForm(emptyForm);
    setCodeTouched(false);
  };

  const handleTypeSubmit = async (e) => {
    e.preventDefault();
    if (!typeForm.code.trim() || !typeForm.label.trim()) {
      toast.error("Code and label are required");
      return;
    }

    try {
      if (typeForm.id) {
        await dispatch(
          updateAwardType({
            id: typeForm.id,
            data: {
              label: typeForm.label,
              description: typeForm.description || null,
              is_active: typeForm.is_active,
            },
          })
        ).unwrap();
        toast.success("Award type updated");
      } else {
        await dispatch(
          createAwardType({
            code: typeForm.code,
            label: typeForm.label,
            description: typeForm.description || null,
            is_active: typeForm.is_active,
          })
        ).unwrap();
        toast.success("Award type created");
      }
      resetTypeForm();
    } catch (err) {
      toast.error(err || "Failed to save award type");
    }
  };

  const handleTypeDelete = async (id) => {
    if (!window.confirm("Deactivate this award type?")) return;
    try {
      await dispatch(deleteAwardType(id)).unwrap();
      toast.success("Award type deactivated");
    } catch (err) {
      toast.error(err || "Failed to deactivate award type");
    }
  };

  if (loading) return <Loading />;

  // Separate finalized nominations (can create awards) from those that already have awards
  const finalizedNominations = nominationsWithScores.filter(
    (n) => n.status === "FINALIZED"
  );
  
  // For now, we'll show all finalized nominations
  // In the future, we can filter out ones that already have awards
  const nominationsNeedingAwards = finalizedNominations;

  return (
    <>
      <PageHeader
        icon={BiTrophy}
        title="Awards"
        subtitle="Recognizing outstanding employees"
      />

      {/* =====================
          HR: Manage Award Types
      ===================== */}
      {user?.role === USER_ROLES.HR && (
        <StyledCard className="mb-4">
          <CardBody>
            <Row className="g-3">
              <Col md={5}>
                <h5 className="mb-3">
                  {typeForm.id ? "Edit Award Type" : "Create Award Type"}
                </h5>
                <form onSubmit={handleTypeSubmit} className="row g-3">
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Label</Form.Label>
                      <Form.Control
                        name="label"
                        value={typeForm.label}
                        onChange={handleTypeChange}
                        placeholder="Employee of the Quarter"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Code</Form.Label>
                      <Form.Control
                        name="code"
                        value={typeForm.code}
                        onChange={handleTypeChange}
                        disabled={!!typeForm.id}
                        placeholder="EMPLOYEE_OF_THE_QUARTER"
                      />
                      <Form.Text className="text-muted">
                        Auto-generated from name, but you can override if needed.
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="description"
                        value={typeForm.description}
                        onChange={handleTypeChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Check
                      type="switch"
                      id="is_active"
                      label="Active"
                      name="is_active"
                      checked={typeForm.is_active}
                      onChange={handleTypeChange}
                    />
                  </Col>

                  <Col xs={12} className="d-flex justify-content-end gap-2">
                    {typeForm.id && (
                      <AppButton
                        type="button"
                        variant="outline-secondary"
                        onClick={resetTypeForm}
                      >
                        Cancel
                      </AppButton>
                    )}
                    <AppButton type="submit">
                      {typeForm.id ? "Update" : "Create"}
                    </AppButton>
                  </Col>
                </form>
              </Col>

              <Col md={7}>
                <h5 className="mb-3">Award Types</h5>
                {awardTypes.length === 0 ? (
                  <p className="text-muted mb-0">
                    No award types configured yet.
                  </p>
                ) : (
                  <Row className="g-3">
                    {awardTypes.map((t) => (
                      <Col key={t.id} xs={12} sm={6}>
                        <StyledCard>
                          <CardBody>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h6 className="mb-1">{t.label}</h6>
                                <small className="text-muted">
                                  {t.code}
                                </small>
                              </div>
                              <span
                                className={`badge ${
                                  t.is_active ? "bg-success" : "bg-secondary"
                                }`}
                              >
                                {t.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>

                            {t.description && (
                              <p className="text-muted small mb-2">
                                {t.description}
                              </p>
                            )}

                            <div className="d-flex gap-2">
                              <AppButton
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleTypeEdit(t)}
                              >
                                Edit
                              </AppButton>
                              {t.is_active && (
                                <AppButton
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => handleTypeDelete(t.id)}
                                >
                                  Deactivate
                                </AppButton>
                              )}
                            </div>
                          </CardBody>
                        </StyledCard>
                      </Col>
                    ))}
                  </Row>
                )}
              </Col>
            </Row>
          </CardBody>
        </StyledCard>
      )}

      {/* HR: Finalized Nominations - Create Awards */}
      {user?.role === USER_ROLES.HR && nominationsNeedingAwards.length > 0 && (
        <StyledCard className="mb-4">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Finalized Nominations - Create Awards</h5>
            </div>
            {!canCreateAwards && (
              <Alert variant="warning" className="mb-3">
                <strong>Cycle Status: {activeCycle?.status}</strong>
                <br />
                Awards can only be created during an active nomination window (Cycle status: OPEN).
              </Alert>
            )}
            <Table bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Nominee</th>
                  <th>Nominated By</th>
                  <th>Avg Score</th>
                  <th>Reviews</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {nominationsNeedingAwards.map((n, idx) => (
                  <tr key={n.nomination_id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="fw-semibold">{n.nominee_name}</div>
                      <small className="text-muted">{n.nominee_email}</small>
                    </td>
                    <td>{n.nominated_by_name}</td>
                    <td>
                      {n.average_score !== null
                        ? n.average_score.toFixed(2)
                        : "-"}
                    </td>
                    <td>{n.review_count}</td>
                    <td>
                      <AppButton
                        size="sm"
                        icon={BiPlus}
                        disabled={!canCreateAwards}
                        onClick={() =>
                          navigate(`/awards/new?nominationId=${n.nomination_id}`)
                        }
                        title={
                          !canCreateAwards
                            ? "Cycle must be OPEN to create awards"
                            : "Create award for this nomination"
                        }
                      >
                        Create Award
                      </AppButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </StyledCard>
      )}

      {/* Empty State */}
      {finalizedNominations.length === 0 ? (
        <StyledCard>
          <CardBody className="text-center py-5">
            <BiTrophy
              style={{
                fontSize: "3.5rem",
                color: "#dee2e6",
                marginBottom: "1rem",
              }}
            />
            <h4>No finalized nominations yet</h4>
            <p className="text-muted">
              Finalized nominations will appear here for award creation
            </p>
          </CardBody>
        </StyledCard>
      ) : (
        <>
          {/* Award Overview */}
          <AwardsGrid>
            {finalizedNominations.map((n) => (
              <Col key={n.nomination_id} xs={12} md={6} lg={4}>
                <AwardCard>
                  <CardBody>
                    <AwardIcon>
                      <BiAward />
                    </AwardIcon>
                    <h4 className="mb-1">{n.nominee_name || "Employee Award"}</h4>
                    <p className="mb-0">
                      Avg Score:{" "}
                      <strong>
                        {n.average_score !== null
                          ? n.average_score.toFixed(2)
                          : "N/A"}
                      </strong>
                    </p>
                  </CardBody>
                </AwardCard>
              </Col>
            ))}
          </AwardsGrid>

          {/* Winners */}
          <WinnersList>
            {finalizedNominations.map((n, index) => (
              <WinnerCard key={n.nomination_id}>
                <CardBody>
                  <BiMedal
                    style={{
                      fontSize: "2.75rem",
                      marginBottom: "0.75rem",
                    }}
                  />
                  <h5 className="mb-1">{n.nominee_name || n.nominee_id}</h5>
                  <p className="mb-2">Final Score</p>
                  <Badge bg="light" text="dark">
                    Rank #{index + 1}
                  </Badge>
                </CardBody>
              </WinnerCard>
            ))}
          </WinnersList>
        </>
      )}
    </>
  );
};

export default Awards;
