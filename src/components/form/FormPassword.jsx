import { useState } from "react";
import { BiShow, BiHide } from "react-icons/bi";
import FormError from "./FormError";

const FormPassword = ({ label, name, register, error }) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="input-group">
        <input
          type={show ? "text" : "password"}
          autoComplete="new-password"
          className="form-control"
          {...register(name, { required: true, minLength: 6 })}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => setShow((v) => !v)}
        >
          {show ? <BiHide /> : <BiShow />}
        </button>
      </div>
      <FormError error={error} />
    </div>
  );
};

export default FormPassword;
