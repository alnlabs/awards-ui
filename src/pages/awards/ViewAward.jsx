import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "react-bootstrap";
import { BiArrowBack, BiTrophy, BiUser } from "react-icons/bi";

import api from "../../services/api";

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
  const { id: nominationId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    let mounted = true;

    api
      .get(`/nominations/${nominationId}/panel-summary`)
      .then((res) => {
        if (mounted) {
          setData(res);
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [nominationId]);

  if (loading || !data) return <Loading />;

  const { nominee_id, final_score, panels } = data;

  return (
    <>
      <PageHeader
        icon={BiTrophy}
        title="Award Result"
        subtitle="Final evaluation summary"
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

      {/* ================= WINNER ================= */}
      <Card className="mb-3">
        <CardHeader>
          <CardTitle>Winner</CardTitle>
        </CardHeader>

        <CardBody className="row g-3">
          <div className="col-md-6">
            <strong>Employee</strong>
            <div className="d-flex align-items-center text-muted">
              <BiUser className="me-2" />
              {nominee_id}
            </div>
          </div>

          <div className="col-md-6">
            <strong>Final Score</strong>
            <div>
              <Badge bg="success">{final_score}</Badge>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ================= PANEL BREAKDOWN ================= */}
      {panels.map((panel) => (
        <Card key={panel.panel_id} className="mb-3">
          <CardHeader>
            <CardTitle>{panel.panel_name}</CardTitle>
          </CardHeader>

          <CardBody>
            {panel.tasks.map((task) => (
              <div key={task.task_id} className="mb-3">
                <div className="fw-semibold">
                  {task.title}
                  {!task.is_required && (
                    <small className="text-muted ms-2">(Optional)</small>
                  )}
                </div>

                <div className="text-muted">
                  Avg Score:{" "}
                  <strong>
                    {task.average_score !== null ? task.average_score : "—"}
                  </strong>
                </div>
              </div>
            ))}

            <hr />

            <div className="fw-bold">
              Panel Total: {panel.panel_total_score}
            </div>
          </CardBody>
        </Card>
      ))}
    </>
  );
};

export default ViewAward;
