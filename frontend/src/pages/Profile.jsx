import React, { useEffect, useState } from "react";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [preview, setPreview] = useState(null);

  /* ================= FETCH PROFILE (NO NESTED HOOKS) ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.email) throw new Error("User not logged in");

        const res = await fetch(
          `http://15.207.235.93:8080/api/profile/${user.email}`
        );

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setProfile(data);
        setOriginalProfile(data);
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setProfile((prev) => ({ ...prev, imageFile: file }));
      setPreview(file ? URL.createObjectURL(file) : null);
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  /* ================= SAVE PROFILE ================= */
  const handleSave = async () => {
    if (!profile?.id) return alert("Profile ID missing!");

    try {
      const formData = new FormData();
      formData.append("id", profile.id);
      formData.append("fullName", profile.fullName || "");
      formData.append("phone", profile.phone || "");
      formData.append("city", profile.city || "");
      formData.append("gender", profile.gender || "");

      if (profile.imageFile) {
        formData.append("image", profile.imageFile);
      }

      const res = await fetch("http://15.207.235.93:8080/api/profile", {
        method: "PUT",
        body: formData
      });

      if (!res.ok) throw new Error("Update failed");

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setEditMode(false);
      setPreview(null);

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to update profile");
    }
  };

  /* ================= CANCEL EDIT ================= */
  const handleCancel = () => {
    setProfile(originalProfile);
    setEditMode(false);
    setPreview(null);
  };

  if (loading) return <p className="loading-text">Loading profile...</p>;
  if (!profile) return <p>No profile found</p>;

  const avatarSrc =
    preview ||
    (profile.image ? `data:image/jpeg;base64,${profile.image}` : null);

  return (
    <div className="profile-wrapper">
      <div className="profile-outer">
        {/* LEFT PANEL */}
        <div className="profile-card left-card">
          <div className="user-info">
            {avatarSrc && (
              <img src={avatarSrc} alt="User Avatar" className="avatar" />
            )}
            <div>
              <h4>{profile.fullName || "No Name"}</h4>
              <p>{profile.email || "No Email"}</p>
            </div>
          </div>

          <div className="menu">
            <div className="menu-item active">
              <span>👤</span>
              <p>My Profile</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="profile-card right-card">
          <div className="header">
            <div className="user-info">
              <div className="avatar-circle">
                {avatarSrc && (
                  <img src={avatarSrc} alt="Profile" className="avatar" />
                )}
              </div>
              <div>
                <h4>{profile.fullName || "No Name"}</h4>
                <p>{profile.email || "No Email"}</p>
              </div>
            </div>
          </div>

          <div className="details">
            <ProfileRow label="Name">
              {editMode ? (
                <input
                  name="fullName"
                  value={profile.fullName || ""}
                  onChange={handleChange}
                />
              ) : (
                <span className="value">{profile.fullName || "-"}</span>
              )}
            </ProfileRow>

            <ProfileRow label="Email">
              <span className="value">{profile.email}</span>
            </ProfileRow>

            <ProfileRow label="Mobile">
              {editMode ? (
                <input
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleChange}
                />
              ) : (
                <span className="value">{profile.phone || "-"}</span>
              )}
            </ProfileRow>

            <ProfileRow label="City">
              {editMode ? (
                <input
                  name="city"
                  value={profile.city || ""}
                  onChange={handleChange}
                />
              ) : (
                <span className="value">{profile.city || "-"}</span>
              )}
            </ProfileRow>

            <ProfileRow label="Gender">
              {editMode ? (
                <select
                  name="gender"
                  value={profile.gender || ""}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <span className="value">{profile.gender || "-"}</span>
              )}
            </ProfileRow>

            {editMode && (
              <ProfileRow label="Profile Image">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                />
              </ProfileRow>
            )}

            <div className="action-buttons">
              {editMode ? (
                <>
                  <button className="save-btn" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button className="cancel-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="edit-btn"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= ROW COMPONENT ================= */
const ProfileRow = ({ label, children }) => (
  <div className="row">
    <span>{label}</span>
    {children}
  </div>
);

export default Profile;
