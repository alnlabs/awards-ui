import { Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import styled from "styled-components";
import AppButton from "../common/AppButton";

/* =====================
   Styled Components
===================== */

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
`;

const FieldGroup = styled(Form.Group)`
  .form-label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #495057;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.75rem;
`;

/* =====================
   Component
===================== */

const CycleForm = ({
  defaultValues,
  onSubmit,
  submitting = false,
  submitLabel = "Save Cycle",
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues,
    mode: "onBlur",
  });

  /* ✅ CRITICAL FIX */
  useEffect(() => {
    console.log("defaultValues", defaultValues);
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormGrid>
        <FieldGroup>
          <Form.Label>Cycle Name</Form.Label>
          <Form.Control
            {...register("name", { required: "Cycle name is required" })}
            isInvalid={!!errors.name}
          />
        </FieldGroup>

        <FieldGroup>
          <Form.Label>Quarter</Form.Label>
          <Form.Select
            {...register("quarter", { required: "Quarter is required" })}
            isInvalid={!!errors.quarter}
          >
            <option value="">Select quarter</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </Form.Select>
        </FieldGroup>

        <FieldGroup>
          <Form.Label>Year</Form.Label>
          <Form.Control
            type="number"
            {...register("year", { required: true })}
          />
        </FieldGroup>

        <FieldGroup>
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            {...register("start_date", { required: true })}
          />
        </FieldGroup>

        <FieldGroup>
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            {...register("end_date", { required: true })}
          />
        </FieldGroup>
      </FormGrid>

      <FieldGroup className="mt-3">
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" rows={3} {...register("description")} />
      </FieldGroup>

      <Actions>
        <AppButton variant="outline-secondary" type="button" onClick={onCancel}>
          Cancel
        </AppButton>

        <AppButton type="submit" loading={submitting}>
          {submitLabel}
        </AppButton>
      </Actions>
    </Form>
  );
};

export default CycleForm;
