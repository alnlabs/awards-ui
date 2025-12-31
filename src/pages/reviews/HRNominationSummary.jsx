import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Table, Badge } from "react-bootstrap";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import AppButton from "../../components/common/AppButton";

import { fetchNominationsWithScores } from "../../store/slices/awardsSlice";

export default function HRNominationSummary() {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { nominationsWithScores, loading, error } = useSelector(
    (state) => state.awards
  );

  useEffect(() => {
    dispatch(fetchNominationsWithScores(cycleId));
  }, [dispatch, cycleId]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <Card>
        <p className="text-danger mb-0">Failed to load nomination summary</p>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="HR Nomination Summary"
        subtitle="Panel-reviewed nominations ranked by score"
        actions={
          <AppButton variant="secondary" onClick={() => navigate("/cycles")}>
            Back to Cycles
          </AppButton>
        }
      />

      <Card>
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Nominee</th>
              <th>Nominated By</th>
              <th>Status</th>
              <th>Avg Score</th>
              <th>Reviews</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {nominationsWithScores.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted">
                  No nominations found
                </td>
              </tr>
            )}

            {nominationsWithScores.map((n, idx) => (
              <tr key={n.nomination_id}>
                <td>{idx + 1}</td>

                <td>
                  <div className="fw-semibold">{n.nominee_name}</div>
                  <small className="text-muted">{n.nominee_email}</small>
                </td>

                <td>{n.nominated_by_name}</td>

                <td>
                  <Badge
                    bg={
                      n.status === "FINALIZED"
                        ? "success"
                        : n.status === "HR_REVIEW"
                        ? "info"
                        : "secondary"
                    }
                  >
                    {n.status}
                  </Badge>
                </td>

                <td>
                  {n.average_score !== null ? n.average_score.toFixed(2) : "-"}
                </td>

                <td>{n.review_count}</td>

                <td>
                  <div className="d-flex gap-2">
                    <AppButton
                      size="sm"
                      variant="outline-primary"
                      onClick={() =>
                        navigate(`/nominations/${n.nomination_id}/view`)
                      }
                    >
                      View
                    </AppButton>

                    <AppButton
                      size="sm"
                      disabled={n.status !== "HR_REVIEW"}
                      onClick={() =>
                        navigate(`/awards/new?nominationId=${n.nomination_id}`)
                      }
                    >
                      Finalize
                    </AppButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
