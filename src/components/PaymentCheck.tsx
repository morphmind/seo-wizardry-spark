import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PaymentOverlay } from "./PaymentOverlay";

export function PaymentCheck() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSettingsPage = location.pathname === "/settings";
  const paymentRequired = localStorage.getItem("payment_required") === "true";

  return paymentRequired && !isSettingsPage ? <PaymentOverlay /> : null;
}
