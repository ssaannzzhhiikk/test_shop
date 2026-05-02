import { Link } from "react-router-dom";

export default function CheckoutSuccess() {
  return (
    <main className="page-shell grid min-h-[62vh] place-items-center py-16 text-center">
      <section>
        <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Checkout</p>
        <h1 className="mt-3 text-4xl font-semibold">Checkout success</h1>
        <p className="mt-4 max-w-xl text-zinc-600">
          This is a simulated success page. Stripe Checkout test mode can be connected later.
        </p>
        <Link className="btn-primary mt-8 inline-flex" to="/catalog">
          Continue browsing
        </Link>
      </section>
    </main>
  );
}
