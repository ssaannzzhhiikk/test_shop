import React from "react";
import { Link } from "react-router-dom";

import { formatMoney } from "../utils/format.js";

export default function ProductCard({ product }) {
  return (
    <article className="group">
      <Link to={`/products/${product.id}`} className="block overflow-hidden bg-zinc-100">
        <div className="aspect-[3/4] w-full">
          {product.image_url ? (
            <img
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              src={product.image_url}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.2em] text-zinc-400">
              No image
            </div>
          )}
        </div>
      </Link>
      <div className="mt-4 space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{product.brand || "Unknown"}</p>
        <Link to={`/products/${product.id}`} className="line-clamp-2 text-sm font-medium hover:underline">
          {product.name}
        </Link>
        <p className="text-sm font-semibold">{formatMoney(product.price, product.currency)}</p>
      </div>
    </article>
  );
}
