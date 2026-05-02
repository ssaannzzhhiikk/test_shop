import { useEffect, useState } from "react";

import { getHealth } from "./api/client.js";

export default function App() {
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    getHealth()
      .then((data) => setApiStatus(data.status))
      .catch(() => setApiStatus("offline"));
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          Educational ecommerce demo
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
          Flimod Catalog Demo
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-700">
          A full-stack catalog foundation using React, Vite, TailwindCSS,
          FastAPI, PostgreSQL, SQLAlchemy, and Pydantic.
        </p>
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-600">Backend health</p>
          <p className="mt-1 text-2xl font-semibold capitalize">{apiStatus}</p>
        </div>
      </section>
    </main>
  );
}
