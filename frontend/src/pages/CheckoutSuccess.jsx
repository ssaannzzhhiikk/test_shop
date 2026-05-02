import { useEffect } from "react";
import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext.jsx";

export default function CheckoutSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <main className="page-shell grid min-h-[62vh] place-items-center py-16 text-center">
      <section>
        <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Checkout</p>
        <h1 className="mt-3 text-4xl font-semibold">Checkout success</h1>
        <p className="mt-4 max-w-xl text-zinc-600">
          Your Stripe Checkout test payment was completed. The webhook will mark the order as paid when
          Stripe delivers the event.
        </p>
        <Link className="btn-primary mt-8 inline-flex" to="/catalog">
          Continue browsing
        </Link>
      </section>
    </main>
  );
}
