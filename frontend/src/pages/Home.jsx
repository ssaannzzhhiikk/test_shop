import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main>
      <section className="border-b border-zinc-200 bg-zinc-950 text-white">
        <div className="page-shell grid min-h-[76vh] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-zinc-400">Luxury catalog study</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
              A refined ecommerce demo for curated fashion browsing.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Explore an educational catalog experience with external product data, clean filters, and a
              persistent shopping cart.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link className="btn-inverted" to="/catalog">
                Shop catalog
              </Link>
              <Link className="btn-ghost-dark" to="/register">
                Create account
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="aspect-[3/4] bg-[url('https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center" />
            <div className="mt-10 aspect-[3/4] bg-[url('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center sm:mt-24" />
          </div>
        </div>
      </section>
      <section className="page-shell grid gap-8 py-16 md:grid-cols-3">
        {["Curated feel", "Smart filters", "Persistent cart"].map((title) => (
          <div key={title} className="border-t border-zinc-300 pt-5">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Built as a neutral educational demo with clean commerce patterns and no copied brand identity.
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
