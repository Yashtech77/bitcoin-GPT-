import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthContext } from "../context/AuthProvider";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react"; // Importing eye icons

export default function Auth() {
  const [active, setActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    agreed: false,
  });

  const [otp, setOtp] = useState("");
  const [forgotStep, setForgotStep] = useState("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const otpInputRef = useRef(null);

  const {
    step,
    success,
    registeredEmail,
    setStep,
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
  } = useAuthContext();

  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const handleLogin = async () => {
    if (
      !loginForm.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)
    ) {
      return toast.error("Enter a valid email");
    }

    if (!loginForm.password || loginForm.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      const response = await login(loginForm);

      // ✅ Check for successful login
      if (response && response.token) {
        toast.success("Login successful");
        setStep("dashboard");
      } else {
        console.log("Login response:", response);
      }
    } catch (error) {
      // 🔴 Handle 401 Invalid credentials and other errors
      if (error.response && error.response.status === 401) {
        toast.error(error.response.data?.detail || "Invalid credentials");
      } else {
        toast.error("Error logging in. Please try again");
      }
    }
  };
  // const handleRegister = async () => {
  //   if (!registerForm.name || registerForm.name.trim().length < 3)
  //     return toast.error("Name must be at least 3 characters");
  //   if (
  //     !registerForm.email ||
  //     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)
  //   )
  //     return toast.error("Enter valid email");
  //   if (!registerForm.password || registerForm.password.length < 6)
  //     return toast.error("Password must be at least 6 characters");
  //   if (!registerForm.dob)
  //     return toast.error("Please select your Date of Birth");
  //   if (!registerForm.agreed)
  //     return toast.error("You must agree that you are above 18");

  //   try {
  //     const response = await register(registerForm);

  //     if (response?.success) {
  //       toast.success("Registration successful. Please login.");
  //       setStep("dashboard");
  //     } else if (response?.detail === "User already exists and is verified.") {
  //       toast.error("User already exists. Please login.");
  //     } else {
  //       toast.error(response?.detail || "Registration failed. Please try again.");
  //     }
  //   } catch (error) {
  //     // Only show toast here if response was NOT handled already above
  //     if (
  //       error?.response?.data?.detail !== "User already exists and is verified."
  //     ) {
  //       toast.error(
  //         error?.response?.data?.detail ||
  //           "An unexpected error occurred. Please try again."
  //       );
  //     }
  //   }
  // };

  const handleRegister = async () => {
    if (!registerForm.name || registerForm.name.trim().length < 3) {
      return toast.error("Name must be at least 3 characters");
    }

    if (
      !registerForm.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)
    ) {
      return toast.error("Enter a valid email");
    }

    if (!registerForm.password || registerForm.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (!registerForm.dob) {
      return toast.error("Please select your Date of Birth");
    }

    if (!registerForm.agreed) {
      return toast.error("You must agree that you are above 18");
    }

    try {
      const response = await register(registerForm);
      const data = response?.data;

      if (data?.success) {
        toast.success("Registration successful. OTP sent to your email.");
        setOtpEmail(registerForm.email);
        setStep("otp");
      }
    } catch (error) {
      const detail = error?.response?.data?.detail;

      if (
        detail ===
        "User already registered but not verified. Please verify your email via OTP or request a new one."
      ) {
        toast.info("User already registered. Resending OTP...");

        try {
          await resendOtp({ email: registerForm.email });
          toast.success("OTP resent successfully.");
          setOtpEmail(registerForm.email);
          setStep("otp");
        } catch (otpError) {
          toast.error("Failed to resend OTP. Try again.");
        }
      } else if (detail === "User already exists and is verified.") {
        toast.error("User already exists. Please login.");
      } else {
        toast.error(detail || "Registration failed. Please try again.");
      }
    }
  };

  const handleVerifyOtp = () => {
    if (!otp) return toast.error("Enter OTP");
    try {
      verifyOtp(otp);
    } catch (err) {
      toast.error("Error verifying OTP");
    }
  };

  const handleForgotPassword = () => {
    setStep("forgot");
  };

  const handleForgotSubmit = async () => {
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      return toast.error("Enter valid registered email");
    }
    try {
      const res = await forgotPassword(forgotEmail);
      if (res) {
        toast.success("OTP sent to your email");
        setForgotStep("reset");
      }
    } catch (err) {
      toast.error("Email not found or server error");
    }
  };

  const handleResetSubmit = async () => {
    if (!forgotOtp || forgotOtp.length !== 6)
      return toast.error("Enter valid 6-digit OTP");
    if (!newPassword || newPassword.length < 6)
      return toast.error("New password must be at least 6 characters");

    try {
      const res = await resetPassword({
        email: forgotEmail,
        otp: forgotOtp,
        newPassword,
      });
      if (res) {
        toast.success("Password reset successful. Please login.");
        setStep("auth");
      }
    } catch (err) {
      toast.error("Failed to reset password");
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp();
      toast.success("OTP resent successfully");
    } catch (err) {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <AnimatePresence mode="wait">
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col justify-center items-center min-h-screen w-full"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 flex flex-col items-center text-center">
              <svg
                className="w-20 h-20 text-green-500 mb-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h1 className="text-2xl font-bold mb-2 text-green-600">
                Success!
              </h1>
              <p className="text-gray-600 mb-4">Redirecting to dashboard...</p>
            </div>
          </motion.div>
        )}

        {step === "otp" && !success && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center min-h-screen w-full"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
              <h1 className="text-xl font-bold mb-4 text-orange-500">
                Verify OTP
              </h1>
              <p className="text-sm mb-4">
                An OTP has been sent to <strong>{registeredEmail}</strong>. It
                is valid for 5 minutes.
              </p>
              <input
                type="text"
                maxLength={6}
                ref={otpInputRef}
                placeholder="Enter 6-digit OTP"
                className="bg-gray-200 p-2 rounded w-full mt-4 text-sm text-center tracking-widest"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtp(val);
                }}
              />
              <button
                onClick={handleVerifyOtp}
                className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:opacity-90 text-white px-6 py-2 rounded mt-4 w-full"
              >
                Verify
              </button>
              <button
                onClick={handleResendOtp}
                className="text-sm text-blue-500 mt-3 hover:underline"
              >
                Resend OTP
              </button>
              <button
                onClick={() => setStep("auth")}
                className="text-sm text-gray-500 mt-3 hover:underline"
              >
                Back to Sign Up
              </button>
            </div>
          </motion.div>
        )}

        {step === "forgot" && !success && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center min-h-screen w-full"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
              <h1 className="text-xl font-bold mb-4 text-orange-500">
                {forgotStep === "email" ? "Forgot Password" : "Reset Password"}
              </h1>

              {forgotStep === "email" ? (
                <>
                  <input
                    type="email"
                    placeholder="Registered Email"
                    className="bg-gray-200 p-2 rounded w-full mt-4 text-sm"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                  <button
                    onClick={handleForgotSubmit}
                    className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:opacity-90 text-white px-6 py-2 rounded mt-4 w-full"
                  >
                    Send OTP
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="bg-gray-200 p-2 rounded w-full mt-4 text-sm"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                  />
                  <div className="relative w-full max-w-[300px] mt-4">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Password"
                      className="bg-gray-200 p-2 rounded w-full text-sm pr-10"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          password: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-600 hover:text-black cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  <button
                    onClick={handleResetSubmit}
                    className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:opacity-90 text-white px-6 py-2 rounded mt-4 w-full"
                  >
                    Reset Password
                  </button>
                </>
              )}
              <button
                onClick={() => setStep("auth")}
                className="text-sm text-gray-500 mt-4 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </motion.div>
        )}

        {step === "auth" && !success && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center"
          >
            <h1 className="text-3xl font-bold text-orange-400 mb-4 text-center">
              Hello Bitcoin Enthusiast!
            </h1>

            <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md md:max-w-2xl lg:max-w-3xl min-h-[480px] overflow-hidden">
              {/* Register */}
              <div
                className={`absolute inset-0 h-full w-full md:w-1/2 flex flex-col justify-center items-center p-6 transition-all duration-500 ${
                  active
                    ? "translate-x-0 md:translate-x-full opacity-100 z-10"
                    : "opacity-0 -z-10 md:z-0"
                }`}
              >
                <h1 className="text-2xl font-bold">Create Account</h1>
                {/* Registration Fields */}
                {/* <input
                  type="text"
                  placeholder="Name"
                  className="bg-gray-200 p-2 rounded w-full max-w-[300px] mt-4 text-sm"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                /> */}
                <input
                  type="email"
                  placeholder="Email"
                  className="bg-gray-200 p-2 rounded w-full max-w-[300px] mt-4 text-sm"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                />
                {/* <label className="text-xs text-gray-600 mt-4 w-full max-w-[300px] text-left">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="bg-gray-200 p-2 rounded w-full max-w-[300px] text-sm"
                  value={registerForm.dob}
                  onChange={(e) => setRegisterForm({ ...registerForm, dob: e.target.value })}
                /> */}
                {/* Password Visibility Field */}
                <div className="relative w-full max-w-[300px] mt-4">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Password"
                    className="bg-gray-200 p-2 rounded w-full text-sm pr-10"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        password: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-600"
                  >
                    {showRegPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {/* Sign Up Button */}
                {/* <button
                  onClick={handleRegister}
                  className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:opacity-90 text-white px-6 py-2 rounded text-xs uppercase mt-4"
                >
                  Sign Up
                </button> */}
                {/* Age Checkbox */}
                <div className="flex items-center mt-4 max-w-[300px] w-full">
                  <input
                    type="checkbox"
                    id="ageCheckbox"
                    className="mr-2"
                    checked={registerForm.agreed}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        agreed: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="ageCheckbox"
                    className="text-sm text-gray-700"
                  >
                    I am 18 years or older
                  </label>
                </div>

                {/* Sign Up Button */}
                <button
                  onClick={handleRegister}
                  className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:opacity-90 text-white px-6 py-2 rounded text-xs uppercase mt-4 hover:shadow-lg"
                >
                  Sign Up
                </button>

                {/* Toggle to Login */}
                <button
                  onClick={() => setActive(false)}
                  
                  className="text-xs text-blue-500 mt-2 hover:underline md:hidden"
                >
                  Already have an account? Sign In
                </button>
              </div>

              {/* Login */}
              <div
                className={`absolute inset-0 h-full w-full md:w-1/2 flex flex-col justify-center items-center p-6 transition-all duration-500 ${
                  active
                    ? "opacity-0 -z-10 md:z-0 -translate-x-full md:translate-x-0"
                    : "opacity-100 z-10"
                }`}
              >
                <h1 className="text-2xl font-bold">Sign In</h1>
                {/* Login Fields */}
                <input
                  type="email"
                  placeholder="Email"
                  className="bg-gray-200 p-2 rounded w-full max-w-[300px] mt-4 text-sm"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                />
                {/* Password Visibility Field */}
                <div className="relative w-full max-w-[300px] mt-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="bg-gray-200 p-2 rounded w-full text-sm pr-10"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-600"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {/* Sign In Button */}
                <button
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:opacity-99 text-white px-6 py-2 rounded text-xs uppercase mt-4 hover:shadow-lg"
                >
                  Sign In
                </button>
                {/* Forgot Password Link */}
                <button
                  onClick={handleForgotPassword}
                  className="text-xs text-orange-400 mt-2 hover:underline"
                >
                  Forgot Password?
                </button>
                {/* Toggle to Register */}
                <button
                  onClick={() => setActive(true)}
                  className="text-xs text-blue-500 mt-2 hover:underline md:hidden"
                >
                  Don’t have an account? Sign Up
                </button>
              </div>

              {/* Toggle panel (desktop only) */}
              <div
                className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-500 ${
                  active
                    ? "-translate-x-full rounded-l-none rounded-r-[150px]"
                    : "rounded-r-none rounded-l-[150px]"
                }`}
              >
                <div className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white absolute inset-0 flex flex-col justify-center items-center text-center p-4 transition-all duration-500">
                  {active ? (
                    <>
                      <h1 className="text-2xl font-bold">Welcome Back!</h1>
                      <p className="text-xs mt-2">
                        Already have an account? Sign in
                      </p>
                      <button
                        onClick={() => setActive(false)}
                        className="border border-white mt-4 px-4 py-1 rounded text-xs uppercase hover:shadow-lg"
                      >
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold">Hello!</h1>
                      <p className="text-xs mt-2">
                        Don&apos;t have an account? Register now.
                      </p>
                      <button
                        onClick={() => setActive(true)}
                        className="border border-white mt-4 px-4 py-1 rounded text-xs uppercase hover:shadow-lg"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
