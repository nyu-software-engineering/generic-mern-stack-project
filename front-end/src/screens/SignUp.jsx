import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Button from "../components/ui/Button.jsx";
import ScreenTitle from "../components/ui/ScreenTitle.jsx";
import TextField from "../components/ui/TextField.jsx";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const updateField = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/");
  };

  return (
    <div className="px-5 py-10">
      <p className="mb-8 text-lg font-bold tracking-tight">Leverage</p>
      <ScreenTitle
        title="Create your account"
        subtitle="Check rents, build your Reliability Report and negotiate with evidence."
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Name"
          id="name"
          name="name"
          value={form.name}
          onChange={updateField}
          autoComplete="name"
        />
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
          autoComplete="new-password"
        />
        <div className="pt-2">
          <Button type="submit">Create account</Button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
