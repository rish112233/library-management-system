import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile edit form state
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    phone: "",
  });
  const [profileMessage, setProfileMessage] = useState({ text: "", type: "" });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password change form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState({ text: "", type: "" });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/profile");
        setProfile(res.data);
        setFormData({
          name: res.data.name || "",
          department: res.data.department || "",
          phone: res.data.phone || "",
        });
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ text: "", type: "" });
    setUpdatingProfile(true);

    try {
      const res = await API.put("/auth/profile", formData);
      setProfile((prev) => ({ ...prev, ...res.data.user }));
      localStorage.setItem("name", res.data.user.name);
      setProfileMessage({ text: "Profile details updated successfully!", type: "success" });
    } catch (err) {
      setProfileMessage({
        text: err.response?.data?.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ text: "", type: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ text: "New passwords do not match", type: "error" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ text: "Password must be at least 6 characters", type: "error" });
      return;
    }

    setUpdatingPassword(true);
    try {
      await API.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordMessage({ text: "Password changed successfully!", type: "success" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordMessage({
        text: err.response?.data?.message || "Failed to change password",
        type: "error",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="profile-page-root">
        <Navbar />
        <div className="profile-container">
          <div className="loading-state-box">
            <div className="spinner-orbit" />
            <p>Loading your student profile and credentials...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const role = profile?.role || "student";
  const initials = (profile?.name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="profile-page-root">
      <Navbar />

      <main className="profile-container">
        {/* Header Breadcrumb & Actions */}
        <div className="profile-header-bar">
          <div>
            <span className="badge-tag">Account Settings</span>
            <h1>Member Profile & Security</h1>
            <p>Manage your library credentials, academic department, and password security.</p>
          </div>
          <Link
            to={role === "admin" ? "/admin" : "/student"}
            className="btn-back-portal"
          >
            ← Back to {role === "admin" ? "Admin Console" : "Student Dashboard"}
          </Link>
        </div>

        <div className="profile-grid">
          {/* Left Column: Profile Overview Card */}
          <div className="profile-overview-col">
            <div className="profile-identity-card">
              <div className="avatar-large">{initials}</div>
              <h2>{profile?.name}</h2>
              <p className="profile-email">{profile?.email}</p>
              <div className="role-chip">
                <span>{role === "admin" ? "🛡️ Administrator" : "🎓 Verified Student"}</span>
              </div>

              <div className="identity-stats-row">
                <div className="stat-box">
                  <span className="num">{profile?.activeIssues || 0}</span>
                  <span className="lbl">Active Loans</span>
                </div>
                <div className="stat-box">
                  <span className="num">{profile?.totalBorrowed || 0}</span>
                  <span className="lbl">Lifetime Loans</span>
                </div>
                <div className="stat-box">
                  <span className="num green">Good</span>
                  <span className="lbl">Standing</span>
                </div>
              </div>

              <div className="account-details-list">
                <div className="account-detail-item">
                  <span className="label">Department:</span>
                  <span className="val">{profile?.department || "General Studies"}</span>
                </div>
                <div className="account-detail-item">
                  <span className="label">Contact Phone:</span>
                  <span className="val">{profile?.phone || "Not provided"}</span>
                </div>
                <div className="account-detail-item">
                  <span className="label">Member Since:</span>
                  <span className="val">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "2026"}
                  </span>
                </div>
              </div>

              <button onClick={handleLogout} className="btn-logout-full">
                🚪 Sign Out of Account
              </button>
            </div>
          </div>

          {/* Right Column: Edit Profile & Change Password */}
          <div className="profile-forms-col">
            {/* Edit Profile Form */}
            <div className="form-card-box">
              <h3>Edit Personal Information</h3>
              <p className="form-subtitle">Update your display name and academic department.</p>

              {profileMessage.text && (
                <div className={`catalog-alert ${profileMessage.type}`}>
                  <span>{profileMessage.type === "success" ? "✓" : "⚠️"} {profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    title="Email cannot be changed"
                    className="disabled-input"
                  />
                  <small className="field-hint">Email is linked to your institutional student ID.</small>
                </div>

                <div className="form-group">
                  <label>Academic Department / Major</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science & Engineering"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <button type="submit" disabled={updatingProfile} className="btn-primary-save">
                  {updatingProfile ? "Saving Changes..." : "Save Profile Details"}
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="form-card-box" style={{ marginTop: 24 }}>
              <h3>Security & Password</h3>
              <p className="form-subtitle">Ensure your account is protected with a strong password.</p>

              {passwordMessage.text && (
                <div className={`catalog-alert ${passwordMessage.type}`}>
                  <span>{passwordMessage.type === "success" ? "✓" : "⚠️"} {passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="profile-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter existing password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>New Password (min 6 characters)</label>
                  <input
                    type="password"
                    placeholder="Enter new secure password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>

                <button type="submit" disabled={updatingPassword} className="btn-primary-save">
                  {updatingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
