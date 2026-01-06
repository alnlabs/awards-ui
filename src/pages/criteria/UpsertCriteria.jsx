import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BiPlus, BiEdit, BiUpload, BiDownload } from "react-icons/bi";
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
  _keyEdited: false, // UI only
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

  const fileInputRef = useRef(null);
  const [values, setValues] = useState(EMPTY_CRITERIA);
  const [saving, setSaving] = useState(false);
  const [loadingJson, setLoadingJson] = useState(false);
  const [jsonText, setJsonText] = useState("");

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
      fields: (current.fields || []).map((f) => ({
        ...f,
        options: f.options ? Object.values(f.options) : [],
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
     JSON APPLY SHARED
  ===================== */
  const applyJsonToForm = (jsonData) => {
    // Validate JSON structure
    if (!jsonData.name) {
      toast.error("JSON must contain a 'name' field");
      return false;
    }

    if (!Array.isArray(jsonData.fields)) {
      toast.error("JSON must contain a 'fields' array");
      return false;
    }

    // Transform options from object/array into UI-friendly array
    const transformedFields = jsonData.fields.map((field, idx) => {
      let options = [];
      if (field.options) {
        if (typeof field.options === "object" && !Array.isArray(field.options)) {
          options = Object.values(field.options);
        } else if (Array.isArray(field.options)) {
          options = field.options;
        }
      }

      return {
        label: field.label || "",
        field_key: field.field_key || generateFieldKey(field.label || ""),
        field_type: field.field_type || "TEXT",
        is_required: field.is_required || false,
        order_index: field.order_index !== undefined ? field.order_index : idx,
        options: (field.field_type || "TEXT") === "SELECT" ? options : [],
        ui_schema: field.ui_schema || null,
        validation: field.validation || null,
        _keyEdited: Boolean(field.field_key),
      };
    });

    setValues({
      name: jsonData.name || "",
      description: jsonData.description || "",
      fields: transformedFields,
    });

    toast.success("JSON applied successfully. Review and submit.");
    return true;
  };

  /* =====================
     JSON IMPORT
  ===================== */
  const handleJsonImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a JSON file");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
      toast.error("Please select a valid JSON file");
      return;
    }

    setLoadingJson(true);

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      applyJsonToForm(jsonData);
      fileInputRef.current.value = "";
    } catch (error) {
      toast.error(`Invalid JSON file: ${error.message}`);
    } finally {
      setLoadingJson(false);
    }
  };

  /* =====================
     EXPORT TO JSON
  ===================== */
  const handleJsonExport = () => {
    if (!values.name.trim()) {
      toast.error("Please enter a criteria name first");
      return;
    }

    if (values.fields.length === 0) {
      toast.error("Please add at least one field first");
      return;
    }

    const exportData = {
      name: values.name,
      description: values.description,
      fields: values.fields.map((field) => {
        const fieldData = {
          label: field.label,
          field_key: field.field_key,
          field_type: field.field_type,
          is_required: field.is_required,
          order_index: field.order_index,
          ui_schema: field.ui_schema,
          validation: field.validation,
        };

        if (field.field_type === "SELECT" && field.options.length > 0) {
          const options = {};
          field.options.forEach((o) => (options[o] = o));
          fieldData.options = options;
        }

        return fieldData;
      }),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${values.name.replace(/\s+/g, "_")}_criteria.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("JSON exported successfully");
  };

  /* =====================
     APPLY TEXT JSON
  ===================== */
  const handleJsonTextApply = () => {
    if (!jsonText.trim()) {
      toast.error("Please paste JSON first");
      return;
    }

    try {
      const jsonData = JSON.parse(jsonText);
      const ok = applyJsonToForm(jsonData);
      if (ok) {
        // keep the text so user sees what was applied
      }
    } catch (error) {
      toast.error(`Invalid JSON: ${error.message}`);
    }
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
        fields: values.fields.map(({ _keyEdited, ...field }) => {
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

      {/* =====================
         JSON IMPORT/EXPORT
      ===================== */}
      {!isEdit && (
        <Card className="mb-4">
          <CardBody>
            <h5 className="mb-3 d-flex align-items-center gap-2">
              <BiUpload /> Import/Export JSON
            </h5>

            <div className="d-flex gap-2 mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="form-control"
              />
              <AppButton
                loading={loadingJson}
                onClick={handleJsonImport}
                variant="primary"
              >
                Import JSON
              </AppButton>
              <AppButton
                onClick={handleJsonExport}
                variant="outline-secondary"
              >
                <BiDownload /> Export JSON
              </AppButton>
            </div>

            <div className="d-flex gap-2">
              <a
                href="/templates/criteria_sample.json"
                download
                className="btn btn-outline-secondary btn-sm"
              >
                <BiDownload /> Download Sample JSON
              </a>
            </div>

            <hr />

            <div className="mb-2">
              <label className="form-label">
                Or paste JSON here
              </label>
              <textarea
                className="form-control"
                rows={6}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{\n  "name": "Employee Performance Evaluation",\n  "description": "Optional description",\n  "fields": [ ... ]\n}'
              />
            </div>
            <AppButton
              type="button"
              variant="outline-primary"
              onClick={handleJsonTextApply}
            >
              Apply JSON
            </AppButton>

            <small className="text-muted d-block mt-2">
              You can either upload a JSON file or paste JSON directly to populate
              the criteria. Download the sample template to see the expected format.
            </small>
          </CardBody>
        </Card>
      )}

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

                  {field.field_type === "SELECT" && (
                    <div className="col-12">
                      <input
                        className="form-control"
                        placeholder="Options (comma separated)"
                        value={field.options.join(", ")}
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
