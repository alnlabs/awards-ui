import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BiPlus, BiListUl, BiEdit, BiShow } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import AppButton from "../../components/common/AppButton";
import Loading from "../../components/common/Loading";

import { fetchCriteria } from "../../store/slices/criteriaSlice";

const CriteriaList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const criteriaData = useSelector((state) => state.criteria);

  console.log(criteriaData, "criteriaData");

  const { list, loading, error } = criteriaData;

  /* =====================
     Load Criteria
  ===================== */
  useEffect(() => {
    dispatch(fetchCriteria());
  }, [dispatch]);

  /* =====================
     Error Toast
  ===================== */
  useEffect(() => {
    if (error) {
      toast.error("Failed to load criteria");
    }
  }, [error]);

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        icon={BiListUl}
        title="Criteria Configuration"
        subtitle="Reusable evaluation criteria used by panels during reviews"
        actions={
          <AppButton icon={BiPlus} onClick={() => navigate("/criteria/new")}>
            Create Criteria
          </AppButton>
        }
      />

      {list.length === 0 ? (
        <p className="text-muted">
          No criteria created yet. Create criteria to use them in panels.
        </p>
      ) : (
        list.map((c) => (
          <div
            key={c.id}
            className="border rounded p-3 mb-2 d-flex justify-content-between align-items-center"
          >
            {/* =====================
                Info
            ===================== */}
            <div>
              <div className="fw-semibold">{c.name}</div>

              {c.description && (
                <div className="text-muted small">{c.description}</div>
              )}

              <div className="mt-1">
                <span
                  className={`badge ${
                    c.is_active ? "bg-success" : "bg-secondary"
                  }`}
                >
                  {c.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* =====================
                Actions
            ===================== */}
            <div className="d-flex gap-2">
              {/* View */}
              <AppButton
                size="sm"
                variant="outline-primary"
                icon={BiShow}
                onClick={() => navigate(`/criteria/${c.id}/view`)}
              >
                View
              </AppButton>

              {/* Clone */}
              <AppButton
                size="sm"
                variant="outline-secondary"
                icon={BiEdit}
                onClick={() => navigate(`/criteria/${c.id}/clone`)}
              >
                Clone
              </AppButton>
            </div>
          </div>
        ))
      )}
    </>
  );
};

export default CriteriaList;
