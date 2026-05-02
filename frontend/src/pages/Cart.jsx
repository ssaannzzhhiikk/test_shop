import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext.jsx";
import { formatMoney } from "../utils/format.js";

export default function Cart() {
  const { clearCart, items, removeFromCart, subtotal, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <main className="page-shell py-16 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Cart</p>
        <h1 className="mt-3 text-4xl font-semibold">Your cart is empty</h1>
        <Link className="btn-primary mt-8 inline-flex" to="/catalog">
          Browse catalog
        </Link>
      </main>
    );
  }

  return (
    <main className="page-shell py-10">
      <h1 className="text-4xl font-semibold tracking-tight">Cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <section className="divide-y divide-zinc-200 border-y border-zinc-200">
          {items.map((item) => (
            <article className="grid gap-5 py-6 sm:grid-cols-[120px_1fr_auto]" key={item.id}>
              {item.image_url ? (
                <img alt={item.name} className="aspect-[3/4] w-full bg-zinc-100 object-cover" src={item.image_url} />
              ) : (
                <div className="flex aspect-[3/4] w-full items-center justify-center bg-zinc-100 text-xs uppercase tracking-[0.18em] text-zinc-400">
                  No image
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.brand || "Unknown"}</p>
                <h2 className="mt-2 font-medium">{item.name}</h2>
                <p className="mt-2 text-sm text-zinc-600">{formatMoney(item.price, item.currency)}</p>
                <button className="mt-4 text-sm underline" onClick={() => removeFromCart(item.id)} type="button">
                  Remove
                </button>
              </div>
              <input
                className="input h-11 w-24"
                min="1"
                onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                type="number"
                value={item.quantity}
              />
            </article>
          ))}
        </section>
        <aside className="h-fit border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <div className="mt-5 flex justify-between border-t border-zinc-200 pt-5">
            <span>Subtotal</span>
            <strong>{formatMoney(subtotal, items[0]?.currency)}</strong>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-500">
            Stripe Checkout is intentionally not implemented yet. These buttons are demo placeholders.
          </p>
          <div className="mt-6 grid gap-3">
            <Link className="btn-primary text-center" to="/checkout/success" onClick={clearCart}>
              Simulate success
            </Link>
            <Link className="btn-secondary text-center" to="/checkout/cancel">
              Simulate cancel
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
