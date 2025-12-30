import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiPlus, BiListUl } from "react-icons/bi";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import AppButton from "../../components/common/AppButton";
import Loading from "../../components/common/Loading";
import { listCriteria } from "../../services/criteriaService";

const CriteriaList = () => {
  const navigate = useNavigate();

  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCriteria()
      .then((res) => {
        setCriteria(res.data || []);
      })
      .catch(() => {
        toast.error("Failed to load criteria");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        icon={BiListUl}
        title="Criteria Configuration"
        subtitle="Reusable evaluation criteria required before creating cycles"
        actions={
          <AppButton icon={BiPlus} onClick={() => navigate("/criteria/new")}>
            Create Criteria
          </AppButton>
        }
      />

      {criteria.length === 0 ? (
        <p className="text-muted">
          No criteria created yet. Create criteria before creating a cycle.
        </p>
      ) : (
        criteria.map((c) => (
          <div
            key={c.id}
            className="border rounded p-3 mb-2 d-flex justify-content-between align-items-center"
          >
            <div>
              <div className="fw-semibold">{c.name}</div>

              {c.description && (
                <div className="text-muted small">{c.description}</div>
              )}

              <div className="text-muted small mt-1">
                Status: {c.is_active ? "Active" : "Inactive"}
              </div>
            </div>

            <AppButton
              size="sm"
              variant="outline-secondary"
              onClick={() => navigate(`/criteria/${c.id}/clone`)}
            >
              Clone
            </AppButton>
          </div>
        ))
      )}
    </>
  );
};

export default CriteriaList;
