import FormError from "./FormError";

const FormInput = ({
  label,
  name,
  register,
  error,
  type = "text",
  required = false,
  autoComplete = "off",
  disabled = false,
}) => {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input
        type={type}
        autoComplete={autoComplete}
        disabled={disabled}
        className="form-control"
        {...register(name, { required })}
      />
      <FormError error={error} />
    </div>
  );
};

export default FormInput;
