import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { BiUser, BiUpload, BiDownload } from "react-icons/bi";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import { Card, CardBody } from "../../components/common/Card";
import AppButton from "../../components/common/AppButton";
import Loading from "../../components/common/Loading";

import {
  fetchUserById,
  createUser,
  updateUser,
  clearCurrentUser,
} from "../../store/slices/usersSlice";

import api from "../../services/api"; // ✅ only for BULK upload
import { USER_ROLES } from "../../utils/constants";

import FormInput from "../../components/form/FormInput";
import FormSelect from "../../components/form/FormSelect";
import FormPassword from "../../components/form/FormPassword";
import SecurityQuestions from "../../components/form/SecurityQuestions";

/* =====================
   SECURITY QUESTIONS
===================== */
const SECURITY_QUESTIONS = [
  "What was the nickname your friends gave you in school?",
  "Which place do you want to visit again the most?",
  "What was the first movie you watched in a theatre?",
  "What food can you eat every day without getting bored?",
  "What was your favorite cartoon or TV show as a child?",
  "What is the name of the street you grew up on?",
  "What was your first job role?",
  "Which subject did you hate the most in school?",
  "What song instantly reminds you of your childhood?",
  "Which teacher had the biggest impact on you?",
  "What was your childhood dream job?",
];

/* =====================
   DEFAULT VALUES
===================== */
const DEFAULT_VALUES = {
  name: "",
  email: "",
  employee_code: "",
  role: USER_ROLES.EMPLOYEE,
  password: "",
  confirmPassword: "",
  security_questions: [
    { question: "", answer: "" },
    { question: "", answer: "" },
    { question: "", answer: "" },
  ],
};

const UpsertUser = () => {
  const { userId } = useParams();
  const isEdit = Boolean(userId);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* 🔑 FILE INPUT REF */
  const fileInputRef = useRef(null);

  const { currentUser, loading } = useSelector((state) => state.users);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting, isValid, errors },
  } = useForm({
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
    shouldUnregister: false,
  });

  useFieldArray({
    control,
    name: "security_questions",
  });

  const [bulkUploading, setBulkUploading] = useState(false);

  /* =====================
     FETCH USER (EDIT MODE)
  ===================== */
  useEffect(() => {
    if (!isEdit) return;

    dispatch(fetchUserById(userId));

    return () => {
      dispatch(clearCurrentUser());
    };
  }, [dispatch, userId, isEdit]);

  /* =====================
     RESET FORM ON LOAD
  ===================== */
  useEffect(() => {
    if (!isEdit || !currentUser) return;

    reset({
      name: currentUser.name,
      email: currentUser.email,
      employee_code: currentUser.employee_code,
      role: currentUser.role,
      password: "",
      confirmPassword: "",
      security_questions: DEFAULT_VALUES.security_questions,
    });
  }, [isEdit, currentUser, reset]);

  /* =====================
     BULK UPLOAD
  ===================== */
  const handleBulkUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return toast.error("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setBulkUploading(true);
      await api.post("/users/bulk-upload", formData);
      toast.success("Bulk upload completed");
      navigate("/users");
    } catch {
      toast.error("Bulk upload failed");
    } finally {
      setBulkUploading(false);
      fileInputRef.current.value = "";
    }
  };

  /* =====================
     SUBMIT
  ===================== */
  const onSubmit = async (data) => {
    try {
      if (!isEdit) {
        const questions = data.security_questions.map((q) => q.question);
        if (new Set(questions).size !== 3)
          return toast.error("Security questions must be unique");

        if (data.password !== data.confirmPassword)
          return toast.error("Passwords do not match");

        await dispatch(
          createUser({
            name: data.name,
            email: data.email,
            employee_code: data.employee_code,
            role: data.role,
            password: data.password,
            security_questions: data.security_questions,
          })
        ).unwrap();

        toast.success("User created");
      } else {
        await dispatch(
          updateUser({
            id: userId,
            data: {
              name: data.name,
              employee_code: data.employee_code,
              role: data.role,
            },
          })
        ).unwrap();

        toast.success("User updated");
      }

      navigate("/users");
    } catch (err) {
      toast.error(err || "Operation failed");
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        icon={BiUser}
        title={isEdit ? "Edit User" : "Create User"}
        subtitle="User account setup"
      />

      {/* =====================
         BULK UPLOAD
      ===================== */}
      {!isEdit && (
        <Card className="mb-4">
          <CardBody>
            <h5 className="mb-3 d-flex align-items-center gap-2">
              <BiUpload /> Bulk Upload Users
            </h5>

            <div className="d-flex gap-2 mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.json"
                className="form-control"
              />
              <AppButton loading={bulkUploading} onClick={handleBulkUpload}>
                Upload
              </AppButton>
            </div>

            <div className="d-flex gap-2">
              <a
                href="/templates/users_bulk_sample.csv"
                download
                className="btn btn-outline-secondary btn-sm"
              >
                <BiDownload /> CSV
              </a>
              <a
                href="/templates/users_bulk_sample.xlsx"
                download
                className="btn btn-outline-secondary btn-sm"
              >
                <BiDownload /> Excel
              </a>
              <a
                href="/templates/users_bulk_sample.json"
                download
                className="btn btn-outline-secondary btn-sm"
              >
                <BiDownload /> JSON
              </a>
            </div>
          </CardBody>
        </Card>
      )}

      {/* =====================
         FORM
      ===================== */}
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <FormInput
              label="Name"
              name="name"
              register={register}
              error={errors.name}
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email}
              disabled={isEdit}
            />
            <FormInput
              label="Employee Code"
              name="employee_code"
              register={register}
            />

            <FormSelect
              label="Role"
              name="role"
              control={control}
              error={errors.role}
              options={[
                { label: "Employee", value: USER_ROLES.EMPLOYEE },
                { label: "Manager", value: USER_ROLES.MANAGER },
                { label: "Panel", value: USER_ROLES.PANEL },
                { label: "HR (Admin)", value: USER_ROLES.HR },
              ]}
            />

            {!isEdit && (
              <>
                <FormPassword
                  label="Password"
                  name="password"
                  register={register}
                  error={errors.password}
                />
                <FormPassword
                  label="Confirm Password"
                  name="confirmPassword"
                  register={register}
                  error={errors.confirmPassword}
                />
                <SecurityQuestions
                  control={control}
                  register={register}
                  watch={watch}
                  errors={errors}
                  questions={[1, 2, 3]}
                  questionOptions={SECURITY_QUESTIONS}
                />
              </>
            )}

            <div className="d-flex justify-content-end mt-4">
              <AppButton
                type="submit"
                loading={isSubmitting}
                disabled={!isValid}
              >
                {isEdit ? "Update User" : "Create User"}
              </AppButton>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default UpsertUser;
