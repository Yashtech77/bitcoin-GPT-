import { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";

const AuthContext = createContext();
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [step, setStep] = useState("auth");
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Save session data
  const storeUserSession = (data) => {
    const token = data.access_token || data.token;
    if (token) {
      localStorage.setItem("token", token);
      sessionStorage.setItem("token", token);
    }

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.setItem("user_id", data.user.id);
      sessionStorage.setItem("user_name", data.user.name);
    }
  };

  // Login function
  const login = async (payload) => {
    try {
      const loginPayload = { ...payload, role: "user" };

      const res = await fetch(`${BASE_URL}/api/authentication/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginPayload),
      });

      const data = await res.json();
      console.log("Login API Response:", data);

      if (res.ok && data.message === "Login successful") {
        toast.success("Login successful");
        storeUserSession(data);
        setSuccess(true);
        setTimeout(() => (window.location.href = "/"), 2000);
      } else {
        const msg = (data.message || data.detail || "").toLowerCase();
        if (msg.includes("password")) {
          toast.error("Incorrect password");
        } else if (msg.includes("email")) {
          toast.error("Invalid email or email not found");
        } else {
          toast.error(data.message || "Login failed");
        }
      }
    } catch (err) {
      toast.error("Server error during login");
    }
  };

  // Register function
  const register = async (payload) => {
    try {
      const registerPayload = { ...payload, role: "user" };

      const res = await fetch(`${BASE_URL}/api/authentication/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerPayload),
      });

      const data = await res.json();
      console.log("Register API Response:", data);

      if (res.ok) {
        setRegisteredEmail(payload.email);
        setStep("otp"); // Go to OTP screen for 200 OK
        toast.success(data.message || "OTP sent to your email!");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Server error during registration");
    }
  };

  // Verify OTP
  const verifyOtp = async (otp) => {
    try {
      const res = await fetch(`${BASE_URL}/api/authentication/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail, otp }),
      });

      const data = await res.json();
      console.log("Verify OTP API Response:", data);

      if (res.ok && data.success) {
        toast.success(data.message || "Email verified successfully!");
        storeUserSession(data);
        setSuccess(true);
        setTimeout(() => (window.location.href = "/"), 2000);
      } else {
        toast.error(data.detail || data.message || "OTP verification failed");
      }
    } catch (err) {
      toast.error("Server error during OTP verification");
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/authentication/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });

      const data = await res.json();
      console.log("Resend OTP API Response:", data);

      if (res.ok && data.success) {
        toast.success("OTP resent successfully");
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error("Server error during resend OTP");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        step,
        setStep,
        success,
        registeredEmail,
        login,
        register,
        verifyOtp,
        resendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
