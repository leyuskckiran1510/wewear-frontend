import React, { useEffect, useState } from "react";
import { getProfile, updateProfile, Profile } from "@/services/profileServices";
import { useLoader } from "@/context/LoaderContext";
import toast from "react-hot-toast";
import "@/styles/profile.css";

const Profile = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [saving, setSaving] = useState(false);
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        showLoader();
        getProfile()
            .then(setProfile)
            .catch(() => toast.error("Failed to load profile"))
            .finally(() => hideLoader());
    }, []);

    const handleChange = (field: keyof Profile, value: any) => {
        if (!profile) return;
        setProfile({ ...profile, [field]: value });
    };

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        toast("Saving...",{
            duration: 300
        });
        let save_success = false;
        try {
            const updated = await updateProfile(profile);
            setProfile(updated);
            save_success=true;
        } catch {
            toast.error("Failed to save profile");
        } finally {
            if(save_success) toast.success("Profile saved sucessfully");
            setSaving(false);
        }
    };

    if (!profile) return <div className="profile-empty">No profile data</div>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2 className="profile-title">Edit Profile</h2>
                <form className="profile-form" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                    <div className="profile-form-group">
                        <label className="profile-label">Username</label>
                        <input
                            className="profile-input"
                            value={profile.username || ""}
                            onChange={(e) => handleChange("username", e.target.value)}
                        />
                    </div>
                    <div className="profile-form-group">
                        <label className="profile-label">Full Name</label>
                        <input
                            className="profile-input"
                            value={profile.full_name || ""}
                            onChange={(e) => handleChange("full_name", e.target.value)}
                        />
                    </div>
                    <div className="profile-form-group">
                        <label className="profile-label">Bio</label>
                        <textarea
                            className="profile-textarea"
                            value={profile.bio || ""}
                            onChange={(e) => handleChange("bio", e.target.value)}
                        />
                    </div>
                    <div className="profile-form-group">
                        <label className="profile-label">Body Type</label>
                        <input
                            className="profile-input"
                            value={profile.body_type || ""}
                            onChange={(e) => handleChange("body_type", e.target.value)}
                        />
                    </div>
                    <div className="profile-form-row">
                        <div className="profile-form-group">
                            <label className="profile-label">Height (cm)</label>
                            <input
                                className="profile-input"
                                type="number"
                                value={profile.height ?? ""}
                                onChange={(e) => handleChange("height", Number(e.target.value))}
                            />
                        </div>
                        <div className="profile-form-group">
                            <label className="profile-label">Weight (kg)</label>
                            <input
                                className="profile-input"
                                type="number"
                                value={profile.weight ?? ""}
                                onChange={(e) => handleChange("weight", Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="profile-form-group">
                        <label className="profile-label">Themes (comma separated)</label>
                        <input
                            className="profile-input"
                            value={profile.themes.join(", ")}
                            onChange={(e) =>
                                handleChange(
                                    "themes",
                                    e.target.value.split(",").map((t) => t.trim())
                                )
                            }
                        />
                    </div>
                    <button className="profile-save-btn" type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;