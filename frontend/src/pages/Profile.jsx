import React from "react";

import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user } = useAuth();

  return (
    <main className="page-shell py-12">
      <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Profile</p>
      <h1 className="mt-3 text-4xl font-semibold">Account details</h1>
      <section className="mt-8 max-w-2xl border border-zinc-200 p-6">
        <dl className="grid gap-5 sm:grid-cols-2">
          <ProfileField label="Name" value={user?.full_name || "Not provided"} />
          <ProfileField label="Email" value={user?.email} />
          <ProfileField label="Role" value={user?.role} />
          <ProfileField label="User ID" value={user?.id} />
        </dl>
      </section>
    </main>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
