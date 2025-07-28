import { useState } from "react";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useAuth() {
  const [step, setStep] = useState("auth");
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const login = async (payload) => {
    try {
      console.log("Calling:", `${BASE_URL}/api/authentication/login`);
      const res = await fetch(`${BASE_URL}/api/authentication/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setSuccess(true);
        setTimeout(() => (window.location.href = "/"), 2000);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      toast.error("Server error during login");
    }
  };

  const register = async (payload) => {
    try {
      console.log("Calling:", `${BASE_URL}/api/authentication/register`);
      const res = await fetch(`${BASE_URL}/api/authentication/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // Always go to OTP screen on HTTP 200 OK
        setRegisteredEmail(payload.email);
        setStep("otp");

        if (data.success) {
          toast.success("OTP sent to your email!");
        } else {
          toast.warn(data.message || "Please check your email for OTP");
        }
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Server error during registration");
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const res = await fetch(`${BASE_URL}/api/authentication/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail, otp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setSuccess(true);
        setTimeout(() => (window.location.href = "/"), 2000);
      } else {
        toast.error(data.message || "OTP verification failed");
      }
    } catch (err) {
      toast.error("Server error during OTP verification");
    }
  };

  const resendOtp = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/authentication/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("OTP resent successfully");
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error("Server error during resend OTP");
    }
  };

  return {
    step,
    setStep,
    success,
    registeredEmail,
    login,
    register,
    verifyOtp,
    resendOtp,
  };
}
