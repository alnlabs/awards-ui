import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Col, Form, Alert, Tabs, Tab } from "react-bootstrap";
import { BiUser, BiEdit, BiSave, BiX, BiLockAlt, BiShieldQuarter, BiCheckCircle } from "react-icons/bi";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import toast from "react-hot-toast";
import styled from "styled-components";

import api, { apiFileUpload } from "../services/api";
import { getMe } from "../store/slices/authSlice";
import PageHeader from "../components/common/PageHeader";
import AppButton from "../components/common/AppButton";
import { Card, CardBody } from "../components/common/Card";
import { USER_ROLES } from "../utils/constants";

/* =====================
   Styled Components
 ===================== */

const ProfileCard = styled(Card)`
  height: 100%;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
`;

const AvatarSection = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 3rem 2rem;
  border-radius: 16px 16px 0 0;
  text-align: center;
  position: relative;
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 130px;
  height: 130px;
  margin: 0 auto;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
  color: #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
`;

const AvatarActions = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.label`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #fff;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  border: 1px solid #eee;

  &:hover {
    background: #228be6;
    color: #fff;
    transform: translateY(-2px);
  }
`;

const DeleteButton = styled(ActionButton)`
  &:hover {
    background: #fa5252;
  }
`;

const ContentPanel = styled.div`
  padding: 2rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  padding: 0.85rem 0;
  border-bottom: 1px solid #f1f3f5;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.div`
  font-weight: 500;
  color: #868e96;
  width: 140px;
  font-size: 0.9rem;
`;

const Value = styled.div`
  color: #212529;
  font-weight: 600;
  flex: 1;
`;

const SecuritySection = styled(Card)`
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h6`
  font-weight: 700;
  color: #343a40;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #228be6;
  }
`;

const TabWrapper = styled.div`
  .nav-tabs {
    border-bottom: 2px solid #f1f3f5;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }

  .nav-link {
    border: none !important;
    color: #868e96;
    font-weight: 600;
    padding: 0.5rem 0;
    position: relative;
    font-size: 0.9rem;

    &.active {
      color: #228be6 !important;
      background: none !important;

      &::after {
        content: "";
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: #228be6;
      }
    }
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  .form-control {
    padding-right: 3rem;
  }

  .visibility-toggle {
    position: absolute;
    right: 0.75rem;
    cursor: pointer;
    color: #adb5bd;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
    padding: 0.25rem;
    transition: color 0.2s;

    &:hover {
      color: #228be6;
    }
  }
`;

/* =====================
   Component
 ===================== */

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    employee_code: user?.employee_code || "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Security Logic State
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [qaData, setQaData] = useState({
    question: "",
    answer: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [securityLoading, setSecurityLoading] = useState(false);
 
  // Password Visibility States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showQaNewPassword, setShowQaNewPassword] = useState(false);
  const [showQaConfirmPassword, setShowQaConfirmPassword] = useState(false);

  useEffect(() => {
    fetchSecurityQuestions();
  }, []);

  const fetchSecurityQuestions = async () => {
    try {
      const response = await api.get("/auth/my-security-questions");
      // The api services already returns payload.data, so response is the array
      const questions = response || [];
      setSecurityQuestions(questions);
      if (questions.length > 0) {
        setQaData(prev => ({ ...prev, question: questions[0].question }));
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleQaChange = (e) => {
    const { name, value } = e.target;
    setQaData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setFormData({
      name: user?.name || "",
      employee_code: user?.employee_code || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      await api.patch("/users/me", {
        name: formData.name,
        employee_code: formData.employee_code || null,
      });
      await dispatch(getMe()).unwrap();
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileData = new FormData();
    fileData.append("file", file);

    setUploading(true);
    try {
      await apiFileUpload.post("/users/me/profile-image", fileData);
      await dispatch(getMe()).unwrap();
      toast.success("Profile image updated");
    } catch (error) {
      toast.error(error || "Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleImageDelete = async () => {
    if (!window.confirm("Delete profile photo?")) return;
    setUploading(true);
    try {
      await api.delete("/users/me/profile-image");
      await dispatch(getMe()).unwrap();
      toast.success("Profile image deleted");
    } catch (error) {
      toast.error(error || "Failed to delete image");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (passwordData.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setSecurityLoading(true);
    try {
      await api.post("/auth/change-password", {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      toast.success("Password updated successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error || "Failed to update password");
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleUpdatePasswordQA = async (e) => {
    e.preventDefault();
    if (qaData.newPassword !== qaData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (!qaData.answer.trim()) {
      return toast.error("Answer is required");
    }

    setSecurityLoading(true);
    try {
      await api.post("/auth/change-password-qa", {
        question: qaData.question,
        answer: qaData.answer,
        new_password: qaData.newPassword
      });
      toast.success("Password updated via security question");
      setQaData(prev => ({ ...prev, answer: "", newPassword: "", confirmPassword: "" }));
    } catch (error) {
      toast.error(error || "Verification failed");
    } finally {
      setSecurityLoading(false);
    }
  };

  if (!user) return null;

  const getRoleBadgeColor = (role) => {
    const colors = {
      [USER_ROLES.HR]: "danger",
      [USER_ROLES.MANAGER]: "primary",
      [USER_ROLES.EMPLOYEE]: "success",
      [USER_ROLES.PANEL]: "warning",
    };
    return colors[role] || "secondary";
  };

  return (
    <Container fluid className="py-4">
      <PageHeader
        icon={BiUser}
        title="My Profile"
        subtitle="Manage your personal details and account security"
      />

      <Row className="g-4">
        {/* Profile Info Column */}
        <Col lg={7}>
          <ProfileCard>
            <AvatarSection>
              <AvatarContainer>
                {user.profile_image ? (
                  <Avatar src={user.profile_image} alt={user.name} />
                ) : (
                  <AvatarPlaceholder>
                    <BiUser />
                  </AvatarPlaceholder>
                )}
                <AvatarActions>
                  <ActionButton title="Upload Photo">
                    <BiEdit />
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </ActionButton>
                  {user.profile_image && (
                    <DeleteButton title="Delete Photo" as="button" onClick={handleImageDelete} disabled={uploading}>
                      <BiX />
                    </DeleteButton>
                  )}
                </AvatarActions>
                {uploading && (
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="spinner-border text-primary" role="status" />
                  </div>
                )}
              </AvatarContainer>
              <h4 className="mt-3 mb-1">{user.name}</h4>
              <p className="text-muted small mb-0">{user.email}</p>
            </AvatarSection>

            <ContentPanel>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <SectionTitle className="mb-0">
                  <BiUser size={20} /> Personal Information
                </SectionTitle>
                {!isEditing ? (
                  <AppButton size="sm" variant="outline-primary" icon={BiEdit} onClick={handleEdit}>
                    Edit Details
                  </AppButton>
                ) : (
                  <div className="d-flex gap-2">
                    <AppButton size="sm" variant="outline-secondary" icon={BiX} onClick={handleCancel}>
                      Cancel
                    </AppButton>
                    <AppButton size="sm" variant="primary" icon={BiSave} onClick={handleSave} disabled={loading}>
                      {loading ? "Saving..." : "Save"}
                    </AppButton>
                  </div>
                )}
              </div>

              {isEditing ? (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Full Name</Form.Label>
                    <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Employee Code</Form.Label>
                    <Form.Control type="text" name="employee_code" value={formData.employee_code} onChange={handleChange} />
                  </Form.Group>
                </Form>
              ) : (
                <div className="bg-light p-3 rounded-3">
                  <InfoRow>
                    <Label>Full Name</Label>
                    <Value>{user.name}</Value>
                  </InfoRow>
                  <InfoRow>
                    <Label>Employee Code</Label>
                    <Value>{user.employee_code || "Not Set"}</Value>
                  </InfoRow>
                  <InfoRow>
                    <Label>System Role</Label>
                    <Value>
                      <span className={`badge bg-${getRoleBadgeColor(user.role)} bg-opacity-10 text-${getRoleBadgeColor(user.role)} border border-${getRoleBadgeColor(user.role)} border-opacity-25`}>
                        {user.role}
                      </span>
                    </Value>
                  </InfoRow>
                  <InfoRow>
                    <Label>Account Status</Label>
                    <Value>
                      <div className="d-flex align-items-center gap-1 text-success">
                        <BiCheckCircle /> Active
                      </div>
                    </Value>
                  </InfoRow>
                </div>
              )}
            </ContentPanel>
          </ProfileCard>
        </Col>

        {/* Security Column */}
        <Col lg={5}>
          <SecuritySection>
            <CardBody className="p-4">
              <SectionTitle>
                <BiLockAlt size={20} /> Account Security
              </SectionTitle>

              <TabWrapper>
                <Tabs defaultActiveKey="currentPassword" id="security-tabs" className="mb-4">
                  <Tab eventKey="currentPassword" title="Current Password">
                    <Form onSubmit={handleUpdatePassword}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Current Password</Form.Label>
                        <PasswordInputWrapper>
                          <Form.Control
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            placeholder="••••••••"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                          <div 
                            className="visibility-toggle"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <BsEyeSlash /> : <BsEye />}
                          </div>
                        </PasswordInputWrapper>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">New Password</Form.Label>
                        <PasswordInputWrapper>
                          <Form.Control
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            placeholder="Min. 8 characters"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                          <div 
                            className="visibility-toggle"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <BsEyeSlash /> : <BsEye />}
                          </div>
                        </PasswordInputWrapper>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold">Confirm New Password</Form.Label>
                        <PasswordInputWrapper>
                          <Form.Control
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                          <div 
                            className="visibility-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <BsEyeSlash /> : <BsEye />}
                          </div>
                        </PasswordInputWrapper>
                      </Form.Group>
                      <AppButton type="submit" variant="primary" className="w-100" disabled={securityLoading}>
                        {securityLoading ? "Updating..." : "Update Password"}
                      </AppButton>
                    </Form>
                  </Tab>
                  
                  <Tab eventKey="securityQA" title="Security Question">
                    <Form onSubmit={handleUpdatePasswordQA}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Select Question</Form.Label>
                        <Form.Select 
                          name="question" 
                          value={qaData.question} 
                          onChange={handleQaChange}
                          disabled={securityQuestions.length === 0}
                        >
                          {securityQuestions.length === 0 ? (
                            <option>No questions configured</option>
                          ) : (
                            securityQuestions.map(q => (
                              <option key={q.id} value={q.question}>{q.question}</option>
                            ))
                          )}
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Your Secret Answer</Form.Label>
                        <Form.Control
                          type="text"
                          name="answer"
                          placeholder="Enter answer"
                          value={qaData.answer}
                          onChange={handleQaChange}
                          required
                        />
                      </Form.Group>
                      <hr className="my-3 opacity-25" />
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">New Password</Form.Label>
                        <PasswordInputWrapper>
                          <Form.Control
                            type={showQaNewPassword ? "text" : "password"}
                            name="newPassword"
                            placeholder="Min. 8 characters"
                            value={qaData.newPassword}
                            onChange={handleQaChange}
                            required
                          />
                          <div 
                            className="visibility-toggle"
                            onClick={() => setShowQaNewPassword(!showQaNewPassword)}
                          >
                            {showQaNewPassword ? <BsEyeSlash /> : <BsEye />}
                          </div>
                        </PasswordInputWrapper>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold">Confirm Password</Form.Label>
                        <PasswordInputWrapper>
                          <Form.Control
                            type={showQaConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={qaData.confirmPassword}
                            onChange={handleQaChange}
                            required
                          />
                          <div 
                            className="visibility-toggle"
                            onClick={() => setShowQaConfirmPassword(!showQaConfirmPassword)}
                          >
                            {showQaConfirmPassword ? <BsEyeSlash /> : <BsEye />}
                          </div>
                        </PasswordInputWrapper>
                      </Form.Group>
                      <AppButton type="submit" variant="primary" className="w-100" disabled={securityLoading || securityQuestions.length === 0}>
                        {securityLoading ? "Updating..." : "Verify & Reset Password"}
                      </AppButton>
                    </Form>
                  </Tab>
                </Tabs>
              </TabWrapper>

              <Alert variant="warning" className="mt-3 border-0 bg-warning bg-opacity-10 text-warning-700 small py-2">
                <BiShieldQuarter className="me-1" /> Choose a strong password to protect your account.
              </Alert>
            </CardBody>
          </SecuritySection>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
