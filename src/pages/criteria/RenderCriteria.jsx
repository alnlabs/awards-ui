import { useEffect, useState } from "react";
import Loading from "../../components/common/Loading";
import api from "../../services/api";

const RenderCriteria = ({ onChange }) => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState({});

  useEffect(() => {
    const loadCriteria = async () => {
      try {
        const res = await api.get("/forms/active/render");
        setSchema(res.data);
      } finally {
        setLoading(false);
      }
    };

    loadCriteria();
  }, []);

  const handleChange = (key, value) => {
    const updated = { ...values, [key]: value };
    setValues(updated);
    onChange?.(updated); // pass answers up to nomination form
  };

  if (loading) return <Loading />;
  if (!schema) return null;

  return (
    <>
      {schema.fields.map((f) => {
        const options = f.options?.choices || [];

        return (
          <div key={f.field_key} className="mb-3">
            <label className="form-label">
              {f.label}
              {f.is_required && <span className="text-danger ms-1">*</span>}
            </label>

            {/* TEXT */}
            {f.field_type === "TEXT" && (
              <input
                className="form-control"
                required={f.is_required}
                onChange={(e) => handleChange(f.field_key, e.target.value)}
              />
            )}

            {/* TEXTAREA */}
            {f.field_type === "TEXTAREA" && (
              <textarea
                className="form-control"
                rows={3}
                required={f.is_required}
                onChange={(e) => handleChange(f.field_key, e.target.value)}
              />
            )}

            {/* NUMBER */}
            {f.field_type === "NUMBER" && (
              <input
                type="number"
                className="form-control"
                required={f.is_required}
                onChange={(e) =>
                  handleChange(f.field_key, Number(e.target.value))
                }
              />
            )}

            {/* SELECT */}
            {f.field_type === "SELECT" && (
              <select
                className="form-select"
                required={f.is_required}
                onChange={(e) => handleChange(f.field_key, e.target.value)}
              >
                <option value="">Select</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}
    </>
  );
};

export default RenderCriteria;
