import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BiPlus, BiEdit } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import { Card, CardBody } from "../../components/common/Card";
import AppButton from "../../components/common/AppButton";
import Loading from "../../components/common/Loading";

import {
  fetchCriteriaById,
  createCriteriaAction,
  updateCriteriaAction,
  clearCurrentCriteria,
} from "../../store/slices/criteriaSlice";

/* =====================
   Helpers
===================== */
const generateFieldKey = (label) =>
  label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_");

/* =====================
   Defaults
===================== */
const EMPTY_CRITERIA = {
  name: "",
  description: "",
  category: "",
  fields: [],
};

const EMPTY_FIELD = {
  label: "",
  field_key: "",
  field_type: "TEXT",
  is_required: false,
  order_index: 0,
  options: [],
  ui_schema: null,
  validation: null,
  allow_file_upload: false,
  _keyEdited: false, // UI only
  _optionsRaw: "",   // UI only for better input handling
};

/* =====================
   Component
===================== */
const UpsertCriteria = () => {
  const { criteriaId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { current, loading } = useSelector((state) => state.criteria);

  const isEdit = Boolean(criteriaId);

  const [values, setValues] = useState(EMPTY_CRITERIA);
  const [saving, setSaving] = useState(false);

  /* =====================
     Load Criteria (EDIT)
  ===================== */
  useEffect(() => {
    if (!isEdit) return;

    dispatch(fetchCriteriaById(criteriaId));

    return () => {
      dispatch(clearCurrentCriteria());
    };
  }, [dispatch, criteriaId, isEdit]);

  /* =====================
     Populate Form
  ===================== */
  useEffect(() => {
    if (!current) return;

    setValues({
      name: current.name,
      description: current.description || "",
      category: current.category || "",
      fields: (current.fields || []).map((f) => ({
        ...f,
        options: f.options ? Object.values(f.options) : [],
        _optionsRaw: f.options ? Object.values(f.options).join(", ") : "",
        _keyEdited: true,
      })),
    });
  }, [current]);

  /* =====================
     Handlers
  ===================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (index, key, value) => {
    const updated = [...values.fields];
    const field = { ...updated[index] };

    if (key === "label") {
      field.label = value;
      if (!field._keyEdited) {
        field.field_key = generateFieldKey(value);
      }
    } else if (key === "field_key") {
      field.field_key = value;
      field._keyEdited = true;
    } else if (key === "field_type") {
      field.field_type = value;
      if (value !== "SELECT") {
        field.options = [];
      }
    } else {
      field[key] = value;
    }

    updated[index] = field;
    setValues((prev) => ({ ...prev, fields: updated }));
  };

  const handleOptionsChange = (index, value) => {
    const updated = [...values.fields];
    updated[index] = {
      ...updated[index],
      _optionsRaw: value,
      options: value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };
    setValues((prev) => ({ ...prev, fields: updated }));
  };

  const addField = () => {
    setValues((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        { ...EMPTY_FIELD, order_index: prev.fields.length },
      ],
    }));
  };

  const removeField = (index) => {
    setValues((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  /* =====================
     Submit (CREATE / UPDATE)
  ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!values.name.trim()) {
      toast.error("Criteria name is required");
      return;
    }

    if (values.fields.length === 0) {
      toast.error("Add at least one criteria field");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: values.name,
        description: values.description,
        category: values.category,
        fields: values.fields.map((f) => {
          const field = { ...f };
          delete field._keyEdited;
          delete field._optionsRaw;
          if (field.field_type === "SELECT") {
            const options = {};
            field.options.forEach((o) => (options[o] = o));
            return { ...field, options };
          }
          return { ...field, options: null };
        }),
      };

      if (isEdit) {
        // ✅ UPDATE EXISTING CRITERIA
        await dispatch(
          updateCriteriaAction({ id: criteriaId, payload })
        ).unwrap();

        toast.success("Criteria updated successfully");
      } else {
        // ✅ CREATE NEW CRITERIA
        await dispatch(createCriteriaAction(payload)).unwrap();
        toast.success("Criteria created successfully");
      }

      navigate("/criteria");
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEdit && !values.fields.length) {
    return <Loading />;
  }

  /* =====================
     UI
  ===================== */
  return (
    <>
      <PageHeader
        icon={isEdit ? BiEdit : BiPlus}
        title={isEdit ? "Edit Criteria" : "Create Criteria"}
        subtitle="Define reusable evaluation criteria"
      />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="row g-3">
            {/* Name */}
            <div className="col-md-6">
              <label className="form-label">Criteria Name</label>
              <input
                name="name"
                className="form-control"
                value={values.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category */}
            <div className="col-md-6">
              <label className="form-label">Category (Optional)</label>
              <input
                name="category"
                className="form-control"
                value={values.category}
                onChange={handleChange}
                placeholder="e.g., Star Performer, Innovation"
              />
            </div>

            {/* Description */}
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows={2}
                value={values.description}
                onChange={handleChange}
              />
            </div>

            <hr />

            <div className="col-12">
              <h5>Criteria Fields</h5>
            </div>

            {values.fields.map((field, idx) => (
              <div key={idx} className="border rounded p-3 mb-2">
                <div className="row g-2">
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      placeholder="Label"
                      value={field.label}
                      onChange={(e) =>
                        handleFieldChange(idx, "label", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <input
                      className="form-control"
                      placeholder="field_key"
                      value={field.field_key}
                      onChange={(e) =>
                        handleFieldChange(idx, "field_key", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={field.field_type}
                      onChange={(e) =>
                        handleFieldChange(idx, "field_type", e.target.value)
                      }
                    >
                      <option value="TEXT">Text</option>
                      <option value="NUMBER">Number</option>
                      <option value="TEXTAREA">Textarea</option>
                      <option value="SELECT">Select</option>
                      <option value="RATING">Rating</option>
                    </select>
                  </div>

                  <div className="col-md-2 d-flex align-items-center">
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      checked={field.is_required}
                      onChange={(e) =>
                        handleFieldChange(idx, "is_required", e.target.checked)
                      }
                    />
                    Required
                  </div>

                  <div className="col-md-2 d-flex align-items-center">
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      checked={field.allow_file_upload}
                      onChange={(e) =>
                        handleFieldChange(idx, "allow_file_upload", e.target.checked)
                      }
                    />
                    Allow File
                  </div>

                  {field.field_type === "SELECT" && (
                    <div className="col-12">
                      <input
                        className="form-control"
                        placeholder="Options (comma separated)"
                        value={field._optionsRaw}
                        onChange={(e) =>
                          handleOptionsChange(idx, e.target.value)
                        }
                        required
                      />
                    </div>
                  )}

                  <div className="col-12 text-end">
                    <AppButton
                      variant="outline-danger"
                      size="sm"
                      type="button"
                      onClick={() => removeField(idx)}
                    >
                      Remove
                    </AppButton>
                  </div>
                </div>
              </div>
            ))}

            <div className="col-12">
              <AppButton type="button" onClick={addField}>
                + Add Field
              </AppButton>
            </div>

            <div className="col-12 d-flex gap-2 mt-3">
              <AppButton type="submit" loading={saving}>
                {isEdit ? "Save Changes" : "Create Criteria"}
              </AppButton>

              <AppButton
                type="button"
                variant="secondary"
                onClick={() => navigate("/criteria")}
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

export default UpsertCriteria;
