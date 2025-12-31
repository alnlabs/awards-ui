import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { BiEdit } from "react-icons/bi";

import Loading from "../../components/common/Loading";
import PageHeader from "../../components/common/PageHeader";
import AppButton from "../../components/common/AppButton";
import { fetchCriteriaById } from "../../store/slices/criteriaSlice";

const RenderCriteria = () => {
  const { criteriaId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { current, loading } = useSelector((state) => state.criteria);

  useEffect(() => {
    dispatch(fetchCriteriaById(criteriaId));
  }, [dispatch, criteriaId]);

  if (loading && !current) return <Loading />;
  if (!current) return null;

  return (
    <>
      <PageHeader
        title={current.name}
        subtitle={current.description || "Criteria details"}
        actions={
          <AppButton
            icon={BiEdit}
            variant="outline-primary"
            onClick={() => navigate(`/criteria/${criteriaId}/edit`)}
          >
            Edit Criteria
          </AppButton>
        }
      />

      {current.fields.map((f) => (
        <div key={f.field_key} className="border rounded p-3 mb-3 bg-light">
          <div className="fw-semibold">{f.label}</div>

          <div className="text-muted small mt-1">
            Type: <strong>{f.field_type}</strong>
            {f.is_required && (
              <span className="text-danger ms-2">Required</span>
            )}
          </div>

          {f.field_type === "SELECT" && f.options && (
            <ul className="mt-2 small">
              {Object.values(f.options).map((opt) => (
                <li key={opt}>{opt}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
};

export default RenderCriteria;
