import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import { Card, CardBody } from "../../components/common/Card";
import AppButton from "../../components/common/AppButton";
import Loading from "../../components/common/Loading";
import api from "../../services/api";

/* =====================
   Initial State
===================== */
const EMPTY_FORM = {
  cycle_id: "",
  nominee_id: "",
  answers: [],
};

const UpsertNomination = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [values, setValues] = useState(EMPTY_FORM);
  const [criteria, setCriteria] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [cycle, setCycle] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* =====================
     LOAD ACTIVE CYCLE
  ===================== */
  useEffect(() => {
    api
      .get("/cycles")
      .then((res) => {
        // ✅ api service returns data directly, not res.data
        const cycles = Array.isArray(res) ? res : [];
        const active = cycles.find((c) => c.status === "OPEN");
        if (!active) {
          toast.error("No active cycle available");
          navigate("/nominations");
          return;
        }

        setCycle(active);
        setValues((p) => ({ ...p, cycle_id: active.id }));
      })
      .catch(() => {
        toast.error("Failed to load cycles");
        navigate("/nominations");
      });
  }, [navigate]);

  /* =====================
     LOAD EMPLOYEES
  ===================== */
  useEffect(() => {
    api
      .get("/users", {
        params: {
          role: "EMPLOYEE",
          skip: 0,
          limit: 100, // backend max = 100
        },
      })
      .then((res) => {
        // ✅ api service returns data directly (array), not res.data
        const employees = Array.isArray(res) ? res : [];
        setEmployees(employees);
      })
      .catch(() => {
        toast.error("Failed to load employees");
      });
  }, []);

  /* =====================
     LOAD ACTIVE CRITERIA
  ===================== */
  useEffect(() => {
    api
      .get("/forms/active")
      .then((res) => {
        // ✅ api service returns data directly, not res.data
        setCriteria(res);
      })
      .catch(() => {
        toast.error("No active criteria configured");
        navigate("/nominations");
      });
  }, [navigate]);

  /* =====================
     LOAD NOMINATION (EDIT)
  ===================== */
  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

    api
      .get(`/nominations/${id}`)
      .then((res) => {
        // ✅ api service returns data directly, not res.data
        if (res.status !== "DRAFT") {
          toast.error("Only draft nominations can be edited");
          navigate("/nominations");
          return;
        }

        setValues({
          cycle_id: res.cycle_id,
          nominee_id: res.nominee_id,
          answers: res.answers || [],
        });
      })
      .catch(() => {
        toast.error("Failed to load nomination");
        navigate("/nominations");
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  /* =====================
     HELPERS
  ===================== */
  const getAnswerValue = (field_key) =>
    values.answers.find((a) => a.field_key === field_key)?.value ?? "";

  const handleAnswerChange = (field_key, value) => {
    setValues((prev) => {
      const exists = prev.answers.some((a) => a.field_key === field_key);
      return {
        ...prev,
        answers: exists
          ? prev.answers.map((a) =>
              a.field_key === field_key ? { ...a, value } : a
            )
          : [...prev.answers, { field_key, value }],
      };
    });
  };

  const getMissingRequiredFields = () => {
    if (!criteria?.fields) return [];

    return criteria.fields
      .filter(
        (f) =>
          f.is_required &&
          !values.answers.some(
            (a) => a.field_key === f.field_key && a.value !== "" && a.value !== null
          )
      )
      .map((f) => f.label || f.field_key);
  };

  const hasMissingRequired = () => {
    return getMissingRequiredFields().length > 0;
  };

  const isFieldMissing = (field_key) => {
    if (!criteria?.fields) return false;
    const field = criteria.fields.find((f) => f.field_key === field_key);
    if (!field || !field.is_required) return false;

    const answer = values.answers.find((a) => a.field_key === field_key);
    return !answer || answer.value === "" || answer.value === null;
  };

  /* =====================
     SUBMIT
  ===================== */
  const submit = async (status) => {
    // Validate nominee
    if (!values.nominee_id) {
      toast.error("Please select a nominee");
      return;
    }

    // Validate required fields for submission
    if (status === "SUBMITTED") {
      const missingFields = getMissingRequiredFields();
      if (missingFields.length > 0) {
        const fieldList = missingFields.join(", ");
        toast.error(
          `Please fill all required fields: ${fieldList}`,
          { duration: 5000 }
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      // Get form_id from criteria
      if (!criteria?.form_id) {
        toast.error("Active criteria form not found");
        setSubmitting(false);
        return;
      }

      await api.post("/nominations", {
        cycle_id: values.cycle_id,
        form_id: criteria.form_id,
        nominee_id: values.nominee_id,
        answers: values.answers,
        status,
      });

      toast.success(
        status === "DRAFT"
          ? "Draft saved successfully"
          : "Nomination submitted successfully"
      );

      navigate("/nominations");
    } catch (error) {
      // Handle backend validation errors
      const errorMessage =
        error?.error || error?.message || "Failed to submit nomination";
      
      // Check if it's a missing fields error
      if (errorMessage.includes("Missing required fields")) {
        toast.error(errorMessage, { duration: 6000 });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !criteria || !cycle) return <Loading />;

  /* =====================
     UI
  ===================== */
  return (
    <>
      <PageHeader
        title={isEdit ? "Edit Nomination" : "New Nomination"}
        subtitle="Recognize outstanding performance"
      />

      <Card>
        <CardBody>
          <form className="row g-3">
            {/* Cycle */}
            <div className="col-md-6">
              <label className="form-label">Cycle</label>
              <input
                className="form-control"
                value={`${cycle.name} (${cycle.quarter} ${cycle.year})`}
                disabled
              />
            </div>

            {/* Nominee */}
            <div className="col-md-6">
              <label className="form-label">
                Nominee <span className="text-danger">*</span>
              </label>
              <select
                className={
                  !values.nominee_id ? "form-select is-invalid" : "form-select"
                }
                value={values.nominee_id}
                onChange={(e) =>
                  setValues({ ...values, nominee_id: e.target.value })
                }
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
              {!values.nominee_id && (
                <div className="invalid-feedback">
                  Please select a nominee
                </div>
              )}
            </div>

            <hr />

            {/* Criteria Fields */}
            <div className="col-12">
              <h5>Evaluation Criteria</h5>
            </div>

            {criteria.fields.map((field) => {
              const type = field.field_type?.toUpperCase();
              const value = getAnswerValue(field.field_key);
              const isMissing = isFieldMissing(field.field_key);
              const inputClass = isMissing
                ? "form-control is-invalid"
                : "form-control";
              const selectClass = isMissing
                ? "form-select is-invalid"
                : "form-select";

              return (
                <div key={field.field_key} className="col-12">
                  <label className="form-label">
                    {field.label}
                    {field.is_required && (
                      <span className="text-danger ms-1">*</span>
                    )}
                  </label>

                  {/* TEXT */}
                  {type === "TEXT" && (
                    <>
                      <input
                        className={inputClass}
                        value={value}
                        onChange={(e) =>
                          handleAnswerChange(field.field_key, e.target.value)
                        }
                      />
                      {isMissing && (
                        <div className="invalid-feedback">
                          This field is required
                        </div>
                      )}
                    </>
                  )}

                  {/* TEXTAREA */}
                  {type === "TEXTAREA" && (
                    <>
                      <textarea
                        className={inputClass}
                        rows={3}
                        value={value}
                        onChange={(e) =>
                          handleAnswerChange(field.field_key, e.target.value)
                        }
                      />
                      {isMissing && (
                        <div className="invalid-feedback">
                          This field is required
                        </div>
                      )}
                    </>
                  )}

                  {/* NUMBER */}
                  {type === "NUMBER" && (
                    <>
                      <input
                        type="number"
                        className={inputClass}
                        value={value}
                        onChange={(e) =>
                          handleAnswerChange(field.field_key, e.target.value)
                        }
                      />
                      {isMissing && (
                        <div className="invalid-feedback">
                          This field is required
                        </div>
                      )}
                    </>
                  )}

                  {/* ✅ SELECT (FIXED) */}
                  {type === "SELECT" && (
                    <>
                      <select
                        className={selectClass}
                        value={value}
                        onChange={(e) =>
                          handleAnswerChange(field.field_key, e.target.value)
                        }
                      >
                        <option value="">Select</option>

                        {field.options &&
                          typeof field.options === "object" &&
                          Object.entries(field.options).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                      </select>
                      {isMissing && (
                        <div className="invalid-feedback">
                          This field is required
                        </div>
                      )}
                    </>
                  )}

                  {/* RATING */}
                  {type === "RATING" && (
                    <>
                      <select
                        className={selectClass}
                        value={value}
                        onChange={(e) =>
                          handleAnswerChange(field.field_key, e.target.value)
                        }
                      >
                        <option value="">Rate</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      {isMissing && (
                        <div className="invalid-feedback">
                          This field is required
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {/* Actions */}
            <div className="col-12 d-flex gap-2 mt-4">
              <AppButton
                variant="secondary"
                loading={submitting}
                type="button"
                onClick={() => submit("DRAFT")}
              >
                Save Draft
              </AppButton>

              <AppButton
                loading={submitting}
                type="button"
                onClick={() => submit("SUBMITTED")}
              >
                Submit Nomination
              </AppButton>

              <AppButton
                variant="outline-secondary"
                type="button"
                onClick={() => navigate("/nominations")}
              >
                Cancel
              </AppButton>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default UpsertNomination;
