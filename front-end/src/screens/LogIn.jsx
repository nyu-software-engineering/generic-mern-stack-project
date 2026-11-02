import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Button from "../components/ui/Button.jsx";
import ScreenTitle from "../components/ui/ScreenTitle.jsx";
import TextField from "../components/ui/TextField.jsx";
import RoleChoice from "../components/RoleChoice.jsx";

export default function LogIn() {
  const navigate = useNavigate();
  const [role, setRole] = useState("renter");
  const [form, setForm] = useState({ email: "", password: "" });

  const updateField = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(role === "landlord" ? "/landlord" : "/");
  };

  return (
    <div className="px-5 py-10">
      <p className="mb-8 text-lg font-bold tracking-tight">Leverage</p>
      <ScreenTitle
        title="Welcome back"
        subtitle="Log in to see your checks, report and followed areas."
      />
      <RoleChoice role={role} onChange={setRole} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email"
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={updateField}
          autoComplete="email"
        />
        <TextField
          label="Password"
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={updateField}
          autoComplete="current-password"
        />
        <div className="pt-2">
          <Button type="submit">Log in</Button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New to Leverage?{" "}
        <Link
          to="/signup"
          className="font-semibold text-accent hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
