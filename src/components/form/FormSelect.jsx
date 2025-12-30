import { Controller } from "react-hook-form";
import FormError from "./FormError";

const FormSelect = ({
  label,
  name,
  control,
  options,
  error,
  disabled = false,
}) => {
  return (
    <div>
      <label className="form-label">{label}</label>

      <Controller
        name={name}
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <select
            className="form-select"
            value={field.value || ""}
            disabled={disabled}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={(e) => field.onChange(e.target.value)}
          >
            <option value="">Select</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      />

      <FormError error={error} />
    </div>
  );
};

export default FormSelect;
