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
  award_type_id: "",
};

const UpsertCycle = () => {
  const { cycleId } = useParams(); // ✅ FIXED
  const isEdit = Boolean(cycleId); // ✅ FIXED
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
        // api interceptor returns BUSINESS DATA directly
        const cycle = await api.get(`/cycles/${cycleId}`);
        if (mounted) {
          setValues(cycle); // ✅ business data
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
  }, [cycleId, isEdit, navigate]);

  /* =====================
     Submit
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

    // Convert empty string to null for award_type_id
    const submitData = {
      ...data,
      award_type_id: data.award_type_id || null,
    };

    setSubmitting(true);

    try {
      if (isEdit) {
        await api.patch(`/cycles/${cycleId}`, submitData); // ✅ FIXED
        toast.success("Cycle updated successfully");
      } else {
        await api.post("/cycles", submitData);
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
