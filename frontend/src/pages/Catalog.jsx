import { useEffect, useMemo, useState } from "react";

import { getProducts } from "../api/client.js";
import FilterSidebar from "../components/FilterSidebar.jsx";
import ProductCard from "../components/ProductCard.jsx";

const initialFilters = {
  search: "",
  brand: "",
  category: "",
  priceMin: "",
  priceMax: "",
  sort: "date,desc",
  offset: 0,
  limit: 24,
};

export default function Catalog() {
  const [filters, setFilters] = useState(initialFilters);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "" && value !== null),
    );

    getProducts(params, { signal: controller.signal })
      .then(setProducts)
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("We could not load the catalog. Please make sure the backend is running.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [filters]);

  const brands = useMemo(
    () => [...new Set(products.map((product) => product.brand).filter(Boolean))].sort(),
    [products],
  );
  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    [products],
  );

  return (
    <main className="page-shell py-10">
      <div className="flex flex-col justify-between gap-5 border-b border-zinc-200 pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Catalog</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">External source edit</h1>
        </div>
        <select
          className="input max-w-xs"
          onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value, offset: 0 }))}
          value={filters.sort}
        >
          <option value="date,desc">Newest first</option>
          <option value="date,asc">Oldest first</option>
          <option value="price,asc">Price low to high</option>
          <option value="price,desc">Price high to low</option>
          <option value="name,asc">Name A to Z</option>
          <option value="name,desc">Name Z to A</option>
        </select>
      </div>

      <div className="grid gap-8 py-8 lg:grid-cols-[260px_1fr]">
        <FilterSidebar
          brands={brands}
          categories={categories}
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(initialFilters)}
        />
        <section>
          {loading ? <CatalogState text="Loading products..." /> : null}
          {error ? <CatalogState text={error} tone="error" /> : null}
          {!loading && !error ? (
            <>
              <div className="mb-5 flex items-center justify-between text-sm text-zinc-500">
                <span>{products.length} products shown</span>
                <span>Page {Math.floor(filters.offset / filters.limit) + 1}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-10 flex justify-center gap-3">
                <button
                  className="btn-secondary"
                  disabled={filters.offset === 0}
                  onClick={() => setFilters((current) => ({ ...current, offset: Math.max(0, current.offset - current.limit) }))}
                  type="button"
                >
                  Previous
                </button>
                <button
                  className="btn-primary"
                  disabled={products.length < filters.limit}
                  onClick={() => setFilters((current) => ({ ...current, offset: current.offset + current.limit }))}
                  type="button"
                >
                  Next
                </button>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function CatalogState({ text, tone = "neutral" }) {
  return (
    <div className={`border px-5 py-8 text-center ${tone === "error" ? "border-red-200 text-red-700" : "border-zinc-200 text-zinc-500"}`}>
      {text}
    </div>
  );
}
