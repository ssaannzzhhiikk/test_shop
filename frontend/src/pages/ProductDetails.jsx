import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProduct } from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";
import { formatMoney } from "../utils/format.js";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getProduct(id)
      .then(setProduct)
      .catch(() => setError("Product not found or backend unavailable."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="page-shell py-16 text-zinc-500">Loading product...</main>;
  }

  if (error || !product) {
    return <main className="page-shell py-16 text-red-700">{error}</main>;
  }

  return (
    <main className="page-shell py-10">
      <Link className="text-sm text-zinc-500 hover:text-black" to="/catalog">
        Back to catalog
      </Link>
      <section className="mt-8 grid gap-10 lg:grid-cols-[0.95fr_1fr]">
        <div className="bg-zinc-100">
          {product.image_url ? (
            <img alt={product.name} className="aspect-[3/4] w-full object-cover" src={product.image_url} />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center text-zinc-400">No image</div>
          )}
        </div>
        <div className="lg:pt-10">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">{product.brand || "Unknown"}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-5 text-2xl font-semibold">{formatMoney(product.price, product.currency)}</p>
          <div className="mt-8 border-y border-zinc-200 py-6 text-sm leading-7 text-zinc-600">
            <p>{product.description || "No product description was provided by the external catalog source."}</p>
            <p className="mt-3">Category: {product.category || "Uncategorized"}</p>
            <p>Available stock records: {product.stock_quantity}</p>
          </div>
          <button className="btn-primary mt-8 w-full sm:w-auto" onClick={() => addToCart(product)} type="button">
            Add to cart
          </button>
        </div>
      </section>
    </main>
  );
}
