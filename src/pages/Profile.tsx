import React, { useEffect, useState } from "react";
import { getProfile, updateProfile, Profile } from "@/services/profileServices";

const Profile = () => {
    const [profile, setProfile] = useState < Profile | null > (null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        getProfile()
            .then(setProfile)
            .catch(() => setError("Failed to load profile"))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (field: keyof Profile, value: any) => {
        if (!profile) return;
        setProfile({ ...profile, [field]: value });
    };

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        setError("");
        try {
            const updated = await updateProfile(profile);
            setProfile(updated);
        } catch {
            setError("Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading profile...</div>;
    if (!profile) return <div>No profile data</div>;

    return (
        <div style={{ maxWidth: 500, margin: "auto", paddingTop: 30 }}>
      <h2>Edit Profile</h2>
      <label>Username</label>
      <input
        value={profile.username || ""}
        onChange={(e) => handleChange("username", e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Full Name</label>
      <input
        value={profile.full_name || ""}
        onChange={(e) => handleChange("full_name", e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Bio</label>
      <textarea
        value={profile.bio || ""}
        onChange={(e) => handleChange("bio", e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Body Type</label>
      <input
        value={profile.body_type || ""}
        onChange={(e) => handleChange("body_type", e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Height (cm)</label>
      <input
        type="number"
        value={profile.height ?? ""}
        onChange={(e) => handleChange("height", Number(e.target.value))}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Weight (kg)</label>
      <input
        type="number"
        value={profile.weight ?? ""}
        onChange={(e) => handleChange("weight", Number(e.target.value))}
        style={{ width: "100%", marginBottom: 10 }}
      />

      {/* For themes, a simple comma separated input */}
      <label>Themes (comma separated)</label>
      <input
        value={profile.themes.join(", ")}
        onChange={(e) =>
          handleChange(
            "themes",
            e.target.value.split(",").map((t) => t.trim())
          )
        }
        style={{ width: "100%", marginBottom: 20 }}
      />

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Profile"}
      </button>

      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
    </div>
    );
};

export default Profile;