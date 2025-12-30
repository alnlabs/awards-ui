import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BiPlus, BiEdit } from "react-icons/bi";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import { Card, CardBody } from "../../components/common/Card";
import CycleForm from "../../components/cycles/CycleForm";
import Loading from "../../components/common/Loading";
import api from "../../services/api";

const EMPTY_FORM = {
  name: "",
  quarter: "",
  year: new Date().getFullYear(),
  start_date: "",
  end_date: "",
  description: "",
};

const UpsertCycle = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [values, setValues] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  /* =====================
     Fetch cycle (EDIT)
  ===================== */
  useEffect(() => {
    if (!isEdit) return;

    let mounted = true;

    const fetchCycle = async () => {
      try {
        const res = await api.get(`/cycles/${id}`);
        if (mounted) {
          setValues(res.data);
          setLoading(false);
        }
      } catch {
        toast.error("Failed to load cycle");
        navigate("/cycles", { replace: true });
      }
    };

    fetchCycle();
    return () => {
      mounted = false;
    };
  }, [id, isEdit, navigate]);

  /* =====================
     Submit (react-hook-form)
  ===================== */

  const handleSubmit = async (data) => {
    if (!data.quarter) {
      toast.error("Quarter is required");
      return;
    }

    if (!data.start_date || !data.end_date) {
      toast.error("Start and End dates are required");
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit) {
        await api.patch(`/cycles/${id}`, data);
        toast.success("Cycle updated successfully");
      } else {
        await api.post("/cycles", data);
        toast.success("Cycle created successfully");
      }

      navigate("/cycles");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  /* =====================
     UI
  ===================== */

  return (
    <>
      <PageHeader
        icon={isEdit ? BiEdit : BiPlus}
        title={isEdit ? "Edit Award Cycle" : "Create Award Cycle"}
        subtitle={
          isEdit && values.name
            ? `Updating: ${values.name}`
            : "Define a new award cycle"
        }
      />

      <Card>
        <CardBody>
          <CycleForm
            defaultValues={values}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
              }))
            }
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel={isEdit ? "Update Cycle" : "Create Cycle"}
            onCancel={() => navigate("/cycles")}
          />
        </CardBody>
      </Card>
    </>
  );
};

export default UpsertCycle;
