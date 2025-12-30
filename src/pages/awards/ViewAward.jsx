import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "react-bootstrap";
import { BiArrowBack, BiTrophy, BiUser, BiCalendar } from "react-icons/bi";

import {
  fetchAwardById,
  clearCurrentAward,
} from "../../store/slices/awardsSlice";
import { USER_ROLES, STATUS_COLORS } from "../../utils/constants";

import PageHeader from "../../components/common/PageHeader";
import AppButton from "../../components/common/AppButton";
import Loading from "../../components/common/Loading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from "../../components/common/Card";

/* =====================
   Component
===================== */

const ViewAward = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentAward, loading } = useSelector((state) => state.awards);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAwardById(id));

    return () => {
      dispatch(clearCurrentAward());
    };
  }, [dispatch, id]);

  if (loading || !currentAward) return <Loading />;

  const { title, cycle, nominee, nomination, final_score, created_at } =
    currentAward;

  return (
    <>
      <PageHeader
        icon={BiTrophy}
        title="Award Details"
        subtitle={title}
        actions={
          <AppButton
            variant="secondary"
            icon={BiArrowBack}
            onClick={() => navigate("/awards")}
          >
            Back
          </AppButton>
        }
      />

      {/* ================= BASIC INFO ================= */}
      <Card className="mb-3">
        <CardHeader>
          <CardTitle>Award Summary</CardTitle>
        </CardHeader>

        <CardBody className="row g-3">
          <div className="col-md-6">
            <strong>Award Title</strong>
            <div className="text-muted">{title}</div>
          </div>

          <div className="col-md-6">
            <strong>Cycle</strong>
            <div className="text-muted">{cycle?.name || "N/A"}</div>
          </div>

          <div className="col-md-6">
            <strong>Winner</strong>
            <div className="d-flex align-items-center text-muted">
              <BiUser className="me-2" />
              {nominee?.name || "N/A"}
            </div>
          </div>

          <div className="col-md-6">
            <strong>Final Score</strong>
            <div>
              <Badge bg="success">{final_score} / 5</Badge>
            </div>
          </div>

          <div className="col-md-6">
            <strong>Awarded On</strong>
            <div className="text-muted d-flex align-items-center">
              <BiCalendar className="me-2" />
              {new Date(created_at).toLocaleDateString()}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ================= NOMINATION SNAPSHOT ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Winning Nomination</CardTitle>
        </CardHeader>

        <CardBody>
          {nomination?.answers?.length === 0 ? (
            <p className="text-muted">No nomination details available</p>
          ) : (
            nomination.answers.map((a) => (
              <div key={a.id} className="mb-3">
                <label className="fw-semibold">{a.field_key}</label>
                <div className="border rounded p-2 bg-light">
                  {typeof a.value === "object"
                    ? JSON.stringify(a.value)
                    : String(a.value)}
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default ViewAward;
