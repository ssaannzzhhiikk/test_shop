import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/profile");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to view your profile.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Email" name="email" onChange={setForm} type="email" value={form.email} />
        <Field label="Password" name="password" onChange={setForm} type="password" value={form.password} />
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className="mt-6 text-sm text-zinc-600">
        New here?{" "}
        <Link className="font-medium text-black underline" to="/register">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

function Field({ label, name, onChange, type, value }) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input
        className="input"
        id={name}
        onChange={(event) => onChange((current) => ({ ...current, [name]: event.target.value }))}
        required
        type={type}
        value={value}
      />
    </div>
  );
}

function AuthShell({ children, subtitle, title }) {
  return (
    <main className="page-shell grid min-h-[72vh] place-items-center py-12">
      <section className="w-full max-w-md border border-zinc-200 p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Account</p>
        <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-zinc-600">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
