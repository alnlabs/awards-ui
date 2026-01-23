import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import { Card, CardBody } from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import AppButton from "../../components/common/AppButton";

import { createAward, fetchAwardTypes } from "../../store/slices/awardsSlice";
import api from "../../services/api";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

const UpsertAward = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const nominationId = query.get("nominationId");

  const [loading, setLoading] = useState(true);
  const [nomination, setNomination] = useState(null);
  const [cycleId, setCycleId] = useState(null);

  const [winnerId, setWinnerId] = useState("");
  const [awardType, setAwardType] = useState("");
  const [rank, setRank] = useState(1);
  const [comment, setComment] = useState("");
  const [awardTypesLoaded, setAwardTypesLoaded] = useState(false);
  const [cycle, setCycle] = useState(null);

  const { loading: saving, awardTypes = [] } = useSelector(
    (state) => state.awards
  );

  useEffect(() => {
    const loadNomination = async () => {
      if (!nominationId) {
        toast.error("Missing nominationId");
        navigate("/cycles");
        return;
      }

      try {
        const data = await api.get(`/nominations/${nominationId}`);
        // data = { id, cycle_id, nominee_id, status, answers[] ... }
        // During nomination window, nominations can be in various statuses
        // Awards can be created for any valid nomination

        setNomination(data);
        setCycleId(data.cycle_id);
        setWinnerId(data.nominee_id);
        
        // Load cycle details to check status
        if (data.cycle_id) {
          try {
            const cycleData = await api.get(`/cycles/${data.cycle_id}`);
            setCycle(cycleData);
          } catch {
            console.error("Failed to load cycle");
          }
        }
      } catch (err) {
        toast.error("Failed to load nomination");
        navigate("/cycles");
      } finally {
        setLoading(false);
      }
    };

    loadNomination();
    // Load award types if not already loaded
    dispatch(fetchAwardTypes()).then(() => {
      setAwardTypesLoaded(true);
    });
  }, [nominationId, navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cycleId || !nominationId || !winnerId) {
      toast.error("Missing required award details");
      return;
    }

    if (!awardType) {
      toast.error("Please select an award type");
      return;
    }

    try {
      await dispatch(
        createAward({
          cycle_id: cycleId,
          nomination_id: nominationId,
          winner_id: winnerId,
          award_type: awardType,
          rank,
          comment: comment.trim() || null,
        })
      ).unwrap();

      toast.success("Award created successfully");
      navigate("/awards");
    } catch (err) {
      toast.error(err || "Failed to create award");
    }
  };

  // Auto-select award type if only one is available
  useEffect(() => {
    if (awardTypesLoaded && awardTypes.length > 0 && !awardType) {
      const available = awardTypes.filter((t) => t.is_active);
      if (available.length === 1) {
        setAwardType(available[0].code);
      }
    }
  }, [awardTypes, awardTypesLoaded, awardType]);

  if (loading) return <Loading />;

  // Awards can be created during nomination window (OPEN) or if cycle is CLOSED (to finalize)
  const canCreateAward = cycle?.status === "OPEN" || cycle?.status === "CLOSED";
  const availableAwardTypes = awardTypes.filter((t) => t.is_active);
  const selectedAwardType =
    availableAwardTypes.find((t) => t.code === awardType) ||
    availableAwardTypes[0] ||
    null;

  return (
    <>
      <PageHeader
        title="Create Award"
        subtitle="Announce winner for this nomination"
        actions={
          <AppButton variant="secondary" onClick={() => navigate(-1)}>
            Back
          </AppButton>
        }
      />

      {cycle && !canCreateAward && (
        <Card className="mb-3">
          <CardBody>
            <div className="alert alert-warning mb-0">
              <strong>Cycle Status: {cycle.status}</strong>
              <br />
              {cycle.status === "DRAFT" 
                ? "Cycle must be OPEN to start creating awards." 
                : "This cycle is already finalized."}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="row g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nomination</Form.Label>
                <Form.Control
                  value={
                    nomination?.nominee && nomination?.cycle
                      ? `Nomination for ${nomination.nominee.name} - ${nomination.cycle.name} (Q${nomination.cycle.quarter} ${nomination.cycle.year})`
                      : nominationId || ""
                  }
                  disabled
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Cycle</Form.Label>
                <Form.Control
                  value={
                    nomination?.cycle
                      ? `${nomination.cycle.name} (Q${nomination.cycle.quarter} ${nomination.cycle.year})`
                      : cycleId || ""
                  }
                  disabled
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Winner (Nominee)</Form.Label>
                <Form.Control
                  value={
                    nomination?.nominee
                      ? `${nomination.nominee.name} (${nomination.nominee.email})${nomination.nominee.employee_code ? ` - ${nomination.nominee.employee_code}` : ""}`
                      : winnerId || ""
                  }
                  disabled
                />
                <Form.Text className="text-muted">
                  Winner must be the nominee of this nomination.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Award Type</Form.Label>
                {availableAwardTypes.length === 0 ? (
                  <>
                    <Form.Control
                      value="No award types configured"
                      disabled
                    />
                    <Form.Text className="text-muted">
                      Ask HR to configure award types first.
                    </Form.Text>
                  </>
                ) : (
                  <>
                    <Form.Select
                      value={awardType || ""}
                      onChange={(e) => setAwardType(e.target.value)}
                      required
                      isInvalid={!awardType && awardTypesLoaded}
                    >
                      {availableAwardTypes.length === 1 ? (
                        <option value={availableAwardTypes[0].code}>
                          {availableAwardTypes[0].label}
                        </option>
                      ) : (
                        <>
                          <option value="">Select award type</option>
                          {availableAwardTypes.map((t) => (
                            <option key={t.id} value={t.code}>
                              {t.label}
                            </option>
                          ))}
                        </>
                      )}
                    </Form.Select>
                    {!awardType && awardTypesLoaded && availableAwardTypes.length > 1 && (
                      <Form.Control.Feedback type="invalid">
                        Please select an award type
                      </Form.Control.Feedback>
                    )}
                    {selectedAwardType?.description && (
                      <Form.Text className="text-muted d-block">
                        {selectedAwardType.description}
                      </Form.Text>
                    )}
                  </>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Rank</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={rank}
                  onChange={(e) => setRank(Number(e.target.value) || 1)}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>Announcement Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter your announcement comment for this winner..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Form.Text className="text-muted">
                  This comment will be displayed when announcing the winner.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} className="mt-3 d-flex justify-content-end">
              <AppButton type="submit" loading={saving} disabled={!canCreateAward}>
                {canCreateAward ? "Create Award" : "Cannot Create Award"}
              </AppButton>
            </Col>
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default UpsertAward;


