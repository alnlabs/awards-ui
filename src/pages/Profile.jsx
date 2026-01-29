import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Col, Form, Alert } from "react-bootstrap";
import { BiUser, BiEdit, BiSave, BiX } from "react-icons/bi";
import toast from "react-hot-toast";
import styled from "styled-components";

import api from "../services/api";
import { getMe } from "../store/slices/authSlice";
import PageHeader from "../components/common/PageHeader";
import AppButton from "../components/common/AppButton";
import { Card, CardBody } from "../components/common/Card";
import { USER_ROLES } from "../utils/constants";

/* =====================
   Styled Components
===================== */

const ProfileCard = styled(Card)`
  margin-bottom: 1.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-weight: 600;
  color: #495057;
`;

const Value = styled.span`
  color: #212529;
`;

/* =====================
   Component
===================== */

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    employee_code: user?.employee_code || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setFormData({
      name: user?.name || "",
      employee_code: user?.employee_code || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      employee_code: user?.employee_code || "",
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      // Use /users/me endpoint for self-update
      const response = await api.patch("/users/me", {
        name: formData.name,
        employee_code: formData.employee_code || null,
      });

      // Update auth state with new user data
      await dispatch(getMe()).unwrap();

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Alert variant="danger">Unable to load user profile</Alert>
      </Container>
    );
  }

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
        subtitle="View and manage your profile information"
        actions={
          !isEditing ? (
            <AppButton icon={BiEdit} onClick={handleEdit}>
              Edit Profile
            </AppButton>
          ) : (
            <div className="d-flex gap-2">
              <AppButton
                variant="secondary"
                icon={BiX}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </AppButton>
              <AppButton
                variant="success"
                icon={BiSave}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </AppButton>
            </div>
          )
        }
      />

      <Row className="justify-content-center">
        <Col lg={8}>
          <ProfileCard>
            <CardBody>
              <h5 className="mb-4">Personal Information</h5>

              {isEditing ? (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Employee Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="employee_code"
                      value={formData.employee_code}
                      onChange={handleChange}
                      placeholder="Enter employee code"
                    />
                  </Form.Group>
                </Form>
              ) : (
                <>
                  <InfoRow>
                    <Label>Name</Label>
                    <Value>{user.name}</Value>
                  </InfoRow>

                  <InfoRow>
                    <Label>Email</Label>
                    <Value>{user.email}</Value>
                  </InfoRow>

                  <InfoRow>
                    <Label>Employee Code</Label>
                    <Value>{user.employee_code || "-"}</Value>
                  </InfoRow>

                  <InfoRow>
                    <Label>Role</Label>
                    <Value>
                      <span
                        className={`badge bg-${getRoleBadgeColor(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </Value>
                  </InfoRow>

                  <InfoRow>
                    <Label>Status</Label>
                    <Value>
                      <span
                        className={`badge bg-${
                          user.is_active ? "success" : "secondary"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </Value>
                  </InfoRow>
                </>
              )}
            </CardBody>
          </ProfileCard>

          <Alert variant="info">
            <strong>Note:</strong> To change your email address or role, please
            contact your HR administrator.
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
