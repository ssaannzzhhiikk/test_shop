import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      navigate("/profile");
    } catch {
      setError("Could not create that account. Try another email or a longer password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell grid min-h-[72vh] place-items-center py-12">
      <section className="w-full max-w-md border border-zinc-200 p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Account</p>
        <h1 className="mt-3 text-3xl font-semibold">Create account</h1>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <Field label="Full name" name="full_name" onChange={setForm} type="text" value={form.full_name} />
          <Field label="Email" name="email" onChange={setForm} type="email" value={form.email} />
          <Field label="Password" name="password" onChange={setForm} type="password" value={form.password} />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
        <p className="mt-6 text-sm text-zinc-600">
          Already registered?{" "}
          <Link className="font-medium text-black underline" to="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
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
        minLength={name === "password" ? 8 : undefined}
        onChange={(event) => onChange((current) => ({ ...current, [name]: event.target.value }))}
        required={name !== "full_name"}
        type={type}
        value={value}
      />
    </div>
  );
}
