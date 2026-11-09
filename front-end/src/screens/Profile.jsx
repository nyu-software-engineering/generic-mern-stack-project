import { useEffect, useState } from "react";
import Button from "../components/ui/Button.jsx";
import ScreenTitle from "../components/ui/ScreenTitle.jsx";
import TextField from "../components/ui/TextField.jsx";
import { getMyProfile, saveMyProfile } from "../data/profile.js";

export default function Profile() {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMyProfile().then(setForm);
  }, []);

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveMyProfile(form);
    setSaved(true);
  };

  if (!form) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <div>
      <ScreenTitle
        title="Profile"
        subtitle="Keep your account details up to date."
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Name"
          id="name"
          name="name"
          value={form.name}
          onChange={updateField}
        />
        <TextField
          label="Email"
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={updateField}
        />
        <TextField
          label="City"
          id="city"
          name="city"
          value={form.city}
          onChange={updateField}
        />
        <div className="pt-2">
          <Button type="submit">{saved ? "Saved" : "Save changes"}</Button>
        </div>
        {saved && (
          <p
            className="border border-positive bg-surface px-3 py-2 text-sm text-positive"
            role="status"
          >
            Your profile has been updated.
          </p>
        )}
      </form>
    </div>
  );
}
