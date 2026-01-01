import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import AppButton from "../../components/common/AppButton";

import { fetchMyPanelAssignments } from "../../store/slices/panelAssignmentsSlice";

export default function MyReviews() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    myAssignments = [],
    loading,
    error,
  } = useSelector((state) => state.panelAssignments);

  useEffect(() => {
    dispatch(fetchMyPanelAssignments());
  }, [dispatch]);

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        title="My Review Assignments"
        subtitle="Review nominations assigned to you"
      />

      {error && (
        <Card className="mb-3">
          <p className="text-danger mb-0">
            Failed to load assignments. Please try again.
          </p>
        </Card>
      )}

      {myAssignments.length === 0 ? (
        <Card>
          <p className="text-muted mb-0">
            No panel assignments assigned to you.
          </p>
        </Card>
      ) : (
        <div className="row g-3">
          {myAssignments.map((a) => {
            const isCompleted = a.assignment_status === "COMPLETED";

            return (
              <div key={a.assignment_id} className="col-md-6 col-lg-4">
                <Card>
                  <h6 className="mb-1">{a.panel.name}</h6>

                  <p className="text-muted small mb-2">
                    Nominee ID: {a.nomination.nominee_id}
                  </p>

                  <p className="mb-1">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${
                        isCompleted ? "bg-success" : "bg-warning"
                      }`}
                    >
                      {a.assignment_status}
                    </span>
                  </p>

                  <p className="text-muted small mb-3">
                    Progress: {a.progress.completed} / {a.progress.total}
                  </p>

                  <div className="d-flex justify-content-end">
                    <AppButton
                      size="sm"
                      onClick={() => navigate(`/reviews/${a.assignment_id}`)}
                    >
                      {isCompleted ? "View Review" : "Start Review"}
                    </AppButton>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
