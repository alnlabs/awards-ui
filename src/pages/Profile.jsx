import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";
import { BiUser, BiEnvelope, BiLock, BiArrowBack, BiImage, BiTrash } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardBody } from "../components/common/Card";
import AppButton from "../components/common/AppButton";
import Loading from "../components/common/Loading";
import { getMe } from "../store/slices/authSlice";
import api from "../services/api";
import { API_BASE_URL } from "../config/api";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    employee_code: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        employee_code: user.employee_code || "",
      });
    } else {
      dispatch(getMe());
    }
  }, [user, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await api.patch("/users/me", {
        name: formData.name,
      });

      toast.success("Profile updated successfully");
      dispatch(getMe()); // Refresh user data
    } catch (err) {
      toast.error(err?.error || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setUpdating(true);

    try {
      await api.post("/auth/change-password", {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      toast.success("Password changed successfully");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setChangingPassword(false);
    } catch (err) {
      toast.error(err?.error || "Failed to change password");
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/users/me/profile-image", formData);

      toast.success("Profile image uploaded successfully");
      dispatch(getMe()); // Refresh user data
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      toast.error(err?.error || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm("Are you sure you want to delete your profile image?")) {
      return;
    }

    setUploadingImage(true);

    try {
      await api.delete("/users/me/profile-image");
      toast.success("Profile image deleted successfully");
      dispatch(getMe()); // Refresh user data
    } catch (err) {
      toast.error(err?.error || "Failed to delete image");
    } finally {
      setUploadingImage(false);
    }
  };

  const getImageUrl = () => {
    if (!user?.profile_image) return null;
    // Static files are served at root level, not under /api/v1
    // Extract base URL from API_BASE_URL (e.g., http://localhost:4100 from http://localhost:4100/api/v1)
    let baseUrl = "http://localhost:4100";
    try {
      const apiUrl = API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:4100/api/v1";
      const url = new URL(apiUrl);
      baseUrl = `${url.protocol}//${url.host}`;
    } catch (e) {
      console.warn("Failed to parse API URL, using default:", e);
    }
    // user.profile_image should already include /static/profile_images/...
    const imageUrl = `${baseUrl}${user.profile_image}`;
    return imageUrl;
  };

  if (loading && !user) return <Loading />;

  if (!user) {
    return (
      <Card>
        <CardBody>
          <p className="text-danger mb-0">Unable to load user profile</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="My Profile"
        subtitle="Manage your account information"
        actions={
          <AppButton variant="secondary" icon={BiArrowBack} onClick={() => navigate("/dashboard")}>
            Back
          </AppButton>
        }
      />

      <Row className="g-3">
        <Col md={4}>
          <Card className="mb-3">
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
            </CardHeader>
            <CardBody className="text-center">
              {getImageUrl() ? (
                <div className="mb-3">
                  <img
                    src={getImageUrl()}
                    alt="Profile"
                    className="rounded-circle"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      border: "3px solid #dee2e6",
                    }}
                    onError={(e) => {
                      console.error("Failed to load image:", getImageUrl());
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div
                  className="mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light"
                  style={{
                    width: "150px",
                    height: "150px",
                    margin: "0 auto",
                    border: "3px solid #dee2e6",
                  }}
                >
                  <BiUser size={60} className="text-muted" />
                </div>
              )}
              <div className="d-flex flex-column gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <AppButton
                  variant="outline-primary"
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploadingImage}
                  icon={BiImage}
                >
                  {user?.profile_image ? "Change Image" : "Upload Image"}
                </AppButton>
                {user?.profile_image && (
                  <AppButton
                    variant="outline-danger"
                    onClick={handleDeleteImage}
                    loading={uploadingImage}
                    icon={BiTrash}
                  >
                    Delete Image
                  </AppButton>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="mb-3">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleUpdateProfile}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <BiUser className="me-2" />
                    Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <BiEnvelope className="me-2" />
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed. Contact HR to update your email.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Employee Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.employee_code || ""}
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Employee code cannot be changed. Contact HR to update your employee code.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    type="text"
                    value={user.role || ""}
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Role cannot be changed. Contact HR to update your role.
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <AppButton type="submit" loading={updating}>
                    Update Profile
                  </AppButton>
                </div>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardBody>
              {!changingPassword ? (
                <AppButton
                  variant="outline-primary"
                  onClick={() => setChangingPassword(true)}
                >
                  <BiLock className="me-2" />
                  Change Password
                </AppButton>
              ) : (
                <form onSubmit={handleChangePassword}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      minLength={8}
                      required
                    />
                    <Form.Text className="text-muted">
                      Password must be at least 8 characters
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      minLength={8}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <AppButton
                      type="button"
                      variant="outline-secondary"
                      onClick={() => {
                        setChangingPassword(false);
                        setPasswordData({
                          current_password: "",
                          new_password: "",
                          confirm_password: "",
                        });
                      }}
                    >
                      Cancel
                    </AppButton>
                    <AppButton type="submit" loading={updating}>
                      Change Password
                    </AppButton>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Profile;

