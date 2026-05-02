import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import Cart from "./pages/Cart.jsx";
import Catalog from "./pages/Catalog.jsx";
import CheckoutCancel from "./pages/CheckoutCancel.jsx";
import CheckoutSuccess from "./pages/CheckoutSuccess.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Profile from "./pages/Profile.jsx";
import Register from "./pages/Register.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col bg-white text-zinc-950">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route element={<Home />} path="/" />
                <Route element={<Catalog />} path="/catalog" />
                <Route element={<ProductDetails />} path="/products/:id" />
                <Route element={<Cart />} path="/cart" />
                <Route element={<Login />} path="/login" />
                <Route element={<Register />} path="/register" />
                <Route element={<CheckoutSuccess />} path="/checkout/success" />
                <Route element={<CheckoutCancel />} path="/checkout/cancel" />
                <Route element={<ProtectedRoute />}>
                  <Route element={<Profile />} path="/profile" />
                </Route>
                <Route element={<Navigate replace to="/" />} path="*" />
              </Routes>
            </div>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
