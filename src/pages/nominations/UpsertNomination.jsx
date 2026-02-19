import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { BiPlus, BiEdit, BiCloudUpload, BiFile, BiCheckCircle } from "react-icons/bi";

import PageHeader from "../../components/common/PageHeader";
import { Card, CardBody } from "../../components/common/Card";
import AppButton from "../../components/common/AppButton";
import Loading from "../../components/common/Loading";
import api from "../../services/api";
import { BASE_URL } from "../../config/api";

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
        const active = cycles.find((c) => c.status === "ACTIVE" || c.status === "OPEN");
        if (!active) {
          toast.error("No active cycle available");
          navigate("/nominations");
          return;
        }

        setCycle(active);
        setValues((p) => ({ ...p, cycle_id: active.id }));
        setCycle(active);
      })
      .catch(() => {
        toast.error("Failed to load cycles");
        navigate("/nominations");
      });
  }, [navigate]);

  /* =====================
     LOAD EMPLOYEES (PAGINATED)
  ===================== */
  useEffect(() => {
    api
      .get("/users", {
        params: {
          skip: 0,
          limit: 100, // backend max = 100
        },
      })
      .then((res) => {
        // ✅ backend returns { items: [], total: 0, ... }
        const employees = res?.items || [];
        setEmployees(employees);
      })
      .catch(() => toast.error("Failed to load employees"));
  }, []);

  /* =====================
     LOAD ACTIVE CRITERIA
  ===================== */
  useEffect(() => {
    api
      .get("/forms/active")
      .then((res) => setCriteria(res))
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

  const handleFileUpload = async (field_key, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("Uploading attachment...");
    try {
      const res = await api.post("/nominations/upload-attachment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const fileUrl = res.data.url;
      
      setValues((prev) => {
        const exists = prev.answers.some((a) => a.field_key === field_key);
        return {
          ...prev,
          answers: exists
            ? prev.answers.map((a) =>
                a.field_key === field_key ? { ...a, attachment: fileUrl } : a
              )
            : [...prev.answers, { field_key, value: "", attachment: fileUrl }],
        };
      });
      
      toast.success("File uploaded", { id: toastId });
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed", { id: toastId });
    }
  };

  const getAttachment = (field_key) =>
    values.answers.find((a) => a.field_key === field_key)?.attachment ?? null;

  const hasMissingRequired = () => {
    if (!criteria?.fields) return false;

    return criteria.fields.some(
      (f) =>
        f.is_required &&
        !values.answers.some(
          (a) => a.field_key === f.field_key && a.value !== ""
        )
    );
  };

  /* =====================
     SUBMIT
  ===================== */
  const submit = async (status) => {
    if (!values.nominee_id) {
      toast.error("Please select nominee");
      return;
    }

    if (status === "SUBMITTED" && hasMissingRequired()) {
      toast.error("Please fill all required criteria fields");
      return;
    }

    setSubmitting(true);

    try {
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
                className="form-select"
                value={values.nominee_id}
                onChange={(e) =>
                  setValues({ ...values, nominee_id: e.target.value })
                }
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <hr />

            {/* Criteria Fields */}
            <div className="col-12">
              <h5>Evaluation Criteria</h5>
            </div>

            {criteria.fields.map((field) => {
              const type = field.field_type?.toUpperCase();
              const value = getAnswerValue(field.field_key);

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
                    <input
                      className="form-control"
                      value={value}
                      onChange={(e) =>
                        handleAnswerChange(field.field_key, e.target.value)
                      }
                    />
                  )}

                  {/* TEXTAREA */}
                  {type === "TEXTAREA" && (
                    <textarea
                      className="form-control"
                      rows={3}
                      value={value}
                      onChange={(e) =>
                        handleAnswerChange(field.field_key, e.target.value)
                      }
                    />
                  )}

                  {/* NUMBER */}
                  {type === "NUMBER" && (
                    <input
                      type="number"
                      className="form-control"
                      value={value}
                      onChange={(e) =>
                        handleAnswerChange(field.field_key, e.target.value)
                      }
                    />
                  )}

                  {/* ✅ SELECT (FIXED) */}
                  {type === "SELECT" && (
                    <select
                      className="form-select"
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
                  )}

                  {/* RATING */}
                  {type === "RATING" && (
                    <select
                      className="form-select"
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
                  )}

                  {/* FILE UPLOAD (OPTIONAL) */}
                  {field.allow_file_upload && (
                    <div className="mt-2 p-2 border rounded bg-light bg-opacity-50">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="small text-muted d-flex align-items-center">
                          <BiCloudUpload className="me-1 fs-5" />
                          Supporting Attachment (Optional)
                        </div>
                        {getAttachment(field.field_key) && (
                          <div className="small text-success d-flex align-items-center">
                            <BiCheckCircle className="me-1" />
                            File Uploaded
                          </div>
                        )}
                      </div>
                      <div className="mt-1 d-flex gap-2 align-items-center">
                        <input
                          type="file"
                          className="form-control form-control-sm"
                          onChange={(e) => handleFileUpload(field.field_key, e.target.files[0])}
                        />
                        {getAttachment(field.field_key) && (
                          <a 
                            href={`${BASE_URL}${getAttachment(field.field_key)}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-secondary"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
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
