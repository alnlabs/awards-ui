import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Col, Badge, Table, Form, Alert, Tabs, Tab, InputGroup, Container } from "react-bootstrap";
import toast from "react-hot-toast";
import styled from "styled-components";
import { 
  BiTrophy, 
  BiAward, 
  BiMedal, 
  BiPlus, 
  BiSearch, 
  BiSortAlt2, 
  BiStar,
  BiCheckCircle,
  BiCog
} from "react-icons/bi";

import {
  fetchNominationsWithScores,
  fetchAwardTypes,
  createAwardType,
  updateAwardType,
  deleteAwardType,
  fetchCurrentAwards,
} from "../../store/slices/awardsSlice";
import { fetchCycles } from "../../store/slices/cyclesSlice";
import { USER_ROLES } from "../../utils/constants";

import Loading from "../../components/common/Loading";
import PageHeader from "../../components/common/PageHeader";
import AppButton from "../../components/common/AppButton";
import { Card as StyledCard, CardBody } from "../../components/common/Card";

/* =====================
   Styled Components
===================== */

const AwardsGrid = styled(Row)`
  --bs-gutter-x: 1.5rem;
  --bs-gutter-y: 1.5rem;
`;

const PremiumCard = styled(StyledCard)`
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  position: relative;
`;

const AwardCard = styled(PremiumCard)`
  text-align: center;
  padding: 2.5rem 1.5rem;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #d4af37 0%, #f9d976 100%);
  }
`;

const AwardIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d4af37;
  display: flex;
  justify-content: center;
`;

const WinnerCard = styled(PremiumCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border-radius: 20px;
  
  .rank-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: #f8f9fa;
    color: #495057;
    font-weight: 700;
    padding: 0.4rem 0.8rem;
    border-radius: 50px;
    font-size: 0.8rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  background: #f8f9fa;
  border-radius: 24px;
  border: 2px dashed #dee2e6;
  margin-top: 2rem;

  svg {
    font-size: 4rem;
    color: #adb5bd;
    margin-bottom: 1.5rem;
  }

  h4 {
    color: #495057;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    color: #6c757d;
    max-width: 400px;
  }
`;

const StyledTabs = styled(Tabs)`
  border-bottom: 2px solid #f1f3f5;
  margin-bottom: 2rem;
  gap: 1rem;

  .nav-link {
    border: none;
    color: #868e96;
    font-weight: 600;
    padding: 0.75rem 1.25rem;
    border-radius: 10px;
    transition: all 0.2s;

    &:hover {
      background: #f1f3f5;
      color: #495057;
    }

    &.active {
      background: #74c0fc22;
      color: #228be6;
      position: relative;
      
      &::after {
        content: "";
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: #228be6;
      }
    }
  }
`;

const WinnersGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
`;

/* =====================
   Component
===================== */

const Awards = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeCycle } = useSelector((state) => state.cycles);
  const { user } = useSelector((state) => state.auth);
  const { nominationsWithScores, awardTypes = [], current: currentAwards = [], loading } = useSelector(
    (state) => state.awards
  );

  // Awards can be created during nomination window (ACTIVE) or if there's an ACTIVE or CLOSED cycle
  const canCreateAwards = activeCycle?.status === "ACTIVE" || activeCycle?.status === "CLOSED";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("score"); // score, name
  const [activeTab, setActiveTab] = useState("winners");

  useEffect(() => {
    dispatch(fetchCycles()); // Fetch cycles first to set activeCycle
    dispatch(fetchCurrentAwards());
    if (user?.role === USER_ROLES.HR || user?.role === USER_ROLES.SUPER_ADMIN) {
      dispatch(fetchAwardTypes());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (activeCycle?.id) {
      dispatch(fetchNominationsWithScores(activeCycle.id));
    }
  }, [dispatch, activeCycle]);

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

  // Separate finalized or under-review nominations
  const finalizedNominations = nominationsWithScores.filter(
    (n) => ["FINALIZED", "HR_REVIEW"].includes(n.status)
  );

  // Filter and sort nominations
  const filteredNominations = finalizedNominations
    .filter((n) =>
      n.nominee_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.nominee_name.localeCompare(b.nominee_name);
      return (b.average_score || 0) - (a.average_score || 0);
    });

  const nominationsNeedingAwards = filteredNominations;

  return (
    <Container fluid className="py-4">
      <PageHeader
        icon={BiTrophy}
        title="Awards Recognition"
        subtitle="Celebrating excellence and outstanding contributions"
      />

      <StyledTabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        id="awards-tabs"
      >
        <Tab
          eventKey="winners"
          title={
            <span>
              <BiStar className="me-2" />
              Winners Gallery
            </span>
          }
        >
          {currentAwards.length === 0 ? (
            <EmptyStateContainer>
              <BiTrophy />
              <h4>No winners to display yet</h4>
              <p>
                Once nominations are finalized and awards are granted, they will
                shine here.
              </p>
            </EmptyStateContainer>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Ceremonial Gallery</h4>
                <div className="d-flex gap-3" style={{ maxWidth: "400px" }}>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <BiSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search winners..."
                      className="border-start-0 ps-0"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </div>
              </div>

              <WinnersGallery>
                {currentAwards
                  .filter((a) =>
                    a.winner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.award_type?.label?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((award) => (
                    <WinnerCard key={award.id} $hoverable onClick={() => navigate(`/awards/${award.id}/view`)}>
                      <div className="rank-badge">{award.cycle?.name || "Award"}</div>
                      <AwardIcon>
                        <BiMedal />
                      </AwardIcon>
                      <CardBody className="text-center">
                        <h5 className="fw-bold mb-1">
                          {award.winner?.name || "Exemplary Employee"}
                        </h5>
                        <p className="text-primary small fw-bold mb-3">{award.award_type?.label}</p>

                        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                          <Badge bg="light" text="dark" className="border">
                            {award.cycle?.quarter} {award.cycle?.year}
                          </Badge>
                        </div>

                        <div className="border-top pt-3 mt-2 d-flex justify-content-between align-items-center">
                          <p className="small text-muted mb-0">
                            {new Date(award.created_at).toLocaleDateString()}
                          </p>
                          <AppButton 
                            size="sm" 
                            variant="primary" 
                            className="py-1 px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/awards/${award.id}/certificate`);
                            }}
                          >
                            Certificate
                          </AppButton>
                        </div>
                      </CardBody>
                    </WinnerCard>
                  ))}
              </WinnersGallery>
            </>
          )}
        </Tab>

        {(user?.role === USER_ROLES.HR || user?.role === USER_ROLES.SUPER_ADMIN) && (
          <Tab
            eventKey="nominations"
            title={
              <span>
                <BiCheckCircle className="me-2" />
                Finalized Nominations
              </span>
            }
          >
            <StyledCard>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">Nominations Ready for Awards</h5>
                  <div className="d-flex gap-2">
                    <Form.Select
                      size="sm"
                      style={{ width: "auto" }}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="score">Sort by Score</option>
                      <option value="name">Sort by Name</option>
                    </Form.Select>
                  </div>
                </div>

                {!canCreateAwards && activeCycle?.status !== "CLOSED" && (
                  <Alert variant="info" className="d-flex align-items-center border-0 bg-light-info">
                    <BiCog className="me-3 fs-4" />
                    <div>
                      <strong>Note:</strong> Awards can only be created during an
                      active nomination window or after the period has ended (Cycle status: ACTIVE or CLOSED).
                    </div>
                  </Alert>
                )}

                {nominationsNeedingAwards.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">No pending nominations found</p>
                  </div>
                ) : (
                  <Table hover responsive className="align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0">Nominee</th>
                        <th className="border-0 text-center">Avg Score</th>
                        <th className="border-0 text-center">Reviews</th>
                        <th className="border-0 text-center">Status</th>
                        <th className="border-0 text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nominationsNeedingAwards.map((n) => (
                        <tr key={n.nomination_id}>
                          <td>
                            <div className="fw-bold">{n.nominee_name}</div>
                            <div className="small text-muted">
                              {n.nominee_email}
                            </div>
                          </td>
                          <td className="text-center">
                            <Badge
                              bg={
                                n.average_score >= 4
                                  ? "success"
                                  : n.average_score >= 3
                                  ? "primary"
                                  : "secondary"
                              }
                              className="px-2 py-1"
                            >
                              {(n.average_score || 0).toFixed(2)}
                            </Badge>
                          </td>
                          <td className="text-center">{n.review_count}</td>
                          <td className="text-center">
                            <Badge bg={n.status === "FINALIZED" ? "success" : "warning"} className="small px-2 py-1">
                              {n.status.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="text-end d-flex justify-content-end gap-2">
                            <AppButton
                              size="sm"
                              variant="outline-secondary"
                              onClick={() =>
                                navigate(
                                  `/awards/preview?nominationId=${n.nomination_id}`
                                )
                              }
                            >
                              Preview
                            </AppButton>
                            <AppButton
                              size="sm"
                              variant="outline-primary"
                              icon={BiPlus}
                              disabled={!canCreateAwards}
                              onClick={() =>
                                navigate(
                                  `/awards/new?nominationId=${n.nomination_id}`
                                )
                              }
                            >
                              Create Award
                            </AppButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </StyledCard>
          </Tab>
        )}

        {(user?.role === USER_ROLES.HR || user?.role === USER_ROLES.SUPER_ADMIN) && (
          <Tab
            eventKey="types"
            title={
              <span>
                <BiCog className="me-2" />
                Award Settings
              </span>
            }
          >
            <StyledCard>
              <CardBody>
                <Row className="g-4">
                  <Col lg={4}>
                    <div className="p-4 border rounded-4 bg-light bg-opacity-10">
                      <h5 className="fw-bold mb-4">
                        {typeForm.id ? "Edit Award Type" : "New Award Type"}
                      </h5>
                      <Form onSubmit={handleTypeSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold">Label</Form.Label>
                          <Form.Control
                            name="label"
                            value={typeForm.label}
                            onChange={handleTypeChange}
                            placeholder="e.g. Star Performer"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold">Code</Form.Label>
                          <Form.Control
                            name="code"
                            value={typeForm.code}
                            onChange={handleTypeChange}
                            disabled={!!typeForm.id}
                            placeholder="STAR_PERFORMER"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold">
                            Description
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            value={typeForm.description}
                            onChange={handleTypeChange}
                          />
                        </Form.Group>

                        <Form.Check
                          type="switch"
                          id="type-active"
                          label="Active for new awards"
                          name="is_active"
                          className="mb-4"
                          checked={typeForm.is_active}
                          onChange={handleTypeChange}
                        />

                        <div className="d-flex gap-2">
                          <AppButton
                            type="submit"
                            className="flex-grow-1"
                            variant="primary"
                          >
                            {typeForm.id ? "Update Type" : "Create Type"}
                          </AppButton>
                          {typeForm.id && (
                            <AppButton
                              variant="outline-secondary"
                              onClick={resetTypeForm}
                            >
                              Cancel
                            </AppButton>
                          )}
                        </div>
                      </Form>
                    </div>
                  </Col>

                  <Col lg={8}>
                    <h5 className="fw-bold mb-4">Configured Award Types</h5>
                    <Row className="g-3">
                      {awardTypes.map((t) => (
                        <Col key={t.id} md={6}>
                          <StyledCard className="h-100 border shadow-none">
                            <CardBody className="p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="fw-bold mb-0">{t.label}</h6>
                                  <code className="small">{t.code}</code>
                                </div>
                                <Badge
                                  bg={t.is_active ? "success" : "secondary"}
                                  pill
                                >
                                  {t.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-muted small mb-3">
                                {t.description || "No description provided."}
                              </p>
                              <div className="d-flex gap-2">
                                <AppButton
                                  size="sm"
                                  variant="link"
                                  className="p-0 text-decoration-none"
                                  onClick={() => handleTypeEdit(t)}
                                >
                                  Edit Details
                                </AppButton>
                                {t.is_active && (
                                  <AppButton
                                    size="sm"
                                    variant="link"
                                    className="p-0 text-danger text-decoration-none"
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
                  </Col>
                </Row>
              </CardBody>
            </StyledCard>
          </Tab>
        )}
      </StyledTabs>
    </Container>
  );
};

export default Awards;
