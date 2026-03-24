import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Table, Alert, Form } from "react-bootstrap";
import { BiUser, BiUpload, BiDownload, BiCheckCircle, BiErrorCircle } from "react-icons/bi";
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

import { apiFileUpload } from "../../services/api"; // ✅ for BULK upload
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
  is_active: true,
};

const UpsertUser = () => {
  const { userId } = useParams();
  const isEdit = Boolean(userId);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* 🔑 FILE INPUT REF */
  const fileInputRef = useRef(null);

  const { currentUser, loading } = useSelector((state) => state.users);
  const { user: authUser } = useSelector((state) => state.auth);

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
  const [selectedFile, setSelectedFile] = useState(null);
  
  /* ✅ NEW: Bulk result tracking */
  const [bulkResult, setBulkResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

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
      is_active: currentUser.is_active,
    });
  }, [isEdit, currentUser, reset]);

  /* =====================
     BULK UPLOAD
  ===================== */
  const handleBulkUpload = async () => {
    const file = selectedFile;
    if (!file) return toast.error("Please select a file");

    // Validate file type
    const validTypes = ['text/csv', 'application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    const validExtensions = ['.csv', '.json', '.xlsx', '.xls'];
    
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      return toast.error("Please upload a valid file (CSV, JSON, or Excel)");
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return toast.error("File size exceeds 10MB limit");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setBulkUploading(true);
      // Use dedicated file upload API instance
      const response = await apiFileUpload.post("/users/bulk-upload", formData);
      
      setBulkResult(response);
      setShowResultModal(true);
      
      if (response.created > 0 && (!response.failed || response.failed.length === 0)) {
        toast.success(`Successfully uploaded ${response.created} users`);
      } else if (response.created > 0) {
        toast.success(`Uploaded ${response.created} users with some errors`);
      } else {
        toast.error("No users were created. Check the errors.");
      }
      
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error(error?.error || error?.message || "Bulk upload failed");
    } finally {
      setBulkUploading(false);
      // Clear file selection after successful upload
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFile(null);
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
            is_active: data.is_active,
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
              is_active: data.is_active,
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
                accept=".csv,.xlsx,.json,.xls"
                className="form-control"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    // Show file info
                    const fileSize = (file.size / 1024 / 1024).toFixed(2);
                    toast(`Selected file: ${file.name} (${fileSize} MB)`, {
                      icon: '📄',
                      duration: 3000,
                    });
                  } else {
                    setSelectedFile(null);
                  }
                }}
              />
              <AppButton 
                loading={bulkUploading} 
                onClick={handleBulkUpload}
                disabled={!selectedFile || bulkUploading}
              >
                {bulkUploading ? "Uploading..." : "Upload"}
              </AppButton>
              <button 
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                    setSelectedFile(null);
                    toast.success("File selection cleared");
                  }
                }}
                disabled={!selectedFile || bulkUploading}
              >
                Clear
              </button>
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
              disabled={isEdit && currentUser?.id === authUser?.id}
              options={[
                { label: "Employee", value: USER_ROLES.EMPLOYEE },
                { label: "Manager", value: USER_ROLES.MANAGER },
                { label: "Panel", value: USER_ROLES.PANEL },
                // Only SUPER_ADMIN can assign HR or SUPER_ADMIN roles
                ...(authUser?.role === USER_ROLES.SUPER_ADMIN
                  ? [
                      { label: "HR (Admin)", value: USER_ROLES.HR },
                      { label: "Super Admin", value: USER_ROLES.SUPER_ADMIN },
                    ]
                  : []),
              ]}
            />

            {(!isEdit || currentUser?.id !== authUser?.id) && (
              <Form.Group className="mb-4">
                <Form.Check 
                  type="switch"
                  id="is-active-switch"
                  label={watch("is_active") ? "Account is Active" : "Account is Inactive"}
                  {...register("is_active")}
                />
                <Form.Text className="text-muted">
                  Inactive users cannot log in to the system.
                </Form.Text>
              </Form.Group>
            )}

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
      {/* Bulk Result Modal */}
      <Modal 
        show={showResultModal} 
        onHide={() => {
          setShowResultModal(false);
          if (bulkResult?.created > 0) navigate("/users");
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Bulk Upload Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex gap-4 mb-4">
            <div className="flex-grow-1 p-3 bg-light rounded text-center">
              <div className="display-6 fw-bold text-success">{bulkResult?.created || 0}</div>
              <div className="text-muted small text-uppercase fw-bold">Created</div>
            </div>
            <div className="flex-grow-1 p-3 bg-light rounded text-center">
              <div className="display-6 fw-bold text-danger">{bulkResult?.failed?.length || 0}</div>
              <div className="text-muted small text-uppercase fw-bold">Failed</div>
            </div>
          </div>

          {bulkResult?.failed && bulkResult.failed.length > 0 && (
            <>
              <h6 className="fw-bold mb-3">Error Details</h6>
              <div className="table-responsive" style={{ maxHeight: '300px' }}>
                <Table striped bordered hover size="sm">
                  <thead className="sticky-top bg-white">
                    <tr>
                      <th>Row</th>
                      <th>Email/Name</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResult.failed.map((f, i) => (
                      <tr key={i}>
                        <td>{f.row}</td>
                        <td className="small">{f.record?.email || f.record?.name || 'N/A'}</td>
                        <td className="text-danger small">{typeof f.error === 'string' ? f.error : JSON.stringify(f.error)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}

          {bulkResult?.created > 0 && bulkResult?.failed?.length === 0 && (
            <Alert variant="success" className="d-flex align-items-center gap-2 m-0">
              <BiCheckCircle className="fs-4" />
              All records were successfully processed!
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <AppButton 
            onClick={() => {
              setShowResultModal(false);
              if (bulkResult?.created > 0) navigate("/users");
            }}
          >
            {bulkResult?.created > 0 ? "Go to User List" : "Close"}
          </AppButton>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UpsertUser;
