import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Package, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../services/api.js";
import useAuthStore from "../store/authStore.js";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const onSubmit = async (data) => {
    setServerError("");
    setIsLoading(true);
    try {
      // Trim whitespace before sending to server
      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      };
      const res = await api.post("/auth/signup", payload);
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 mb-4 shadow-lg shadow-primary-500/20">
            <Package size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">
            Join AssetFlow to manage your organization's assets
          </p>
        </div>

        {/* Notice */}
        <div className="flex items-start gap-2.5 bg-primary-500/10 border border-primary-500/20 rounded-lg px-4 py-3 mb-5">
          <CheckCircle2 size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
          <p className="text-primary-300 text-xs leading-relaxed">
            New accounts are created with <strong>Employee</strong> access. An
            administrator can promote your role in Organization Setup.
          </p>
        </div>

        {/* Card */}
        <div className="card">
          {serverError && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="signup-form">

            {/* ── Full Name ───────────────────────────────────────────── */}
            <div>
              <label htmlFor="signup-name" className="label">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                placeholder="Jane Smith"
                autoComplete="name"
                className={`input ${errors.name ? "input-error" : ""}`}
                {...register("name", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Name must be 50 characters or fewer",
                  },
                  pattern: {
                    // Letters (including accented), spaces, hyphens, apostrophes only
                    value: /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/,
                    message: "Name can only contain letters, spaces, hyphens, and apostrophes",
                  },
                  validate: (value) =>
                    value.trim().length >= 2 || "Name must be at least 2 characters",
                })}
              />
              {errors.name && (
                <p className="error-text">{errors.name.message}</p>
              )}
            </div>

            {/* ── Email ───────────────────────────────────────────────── */}
            <div>
              <label htmlFor="signup-email" className="label">
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className={`input ${errors.email ? "input-error" : ""}`}
                {...register("email", {
                  required: "Email is required",
                  maxLength: {
                    value: 100,
                    message: "Email must be 100 characters or fewer",
                  },
                  pattern: {
                    // Stricter RFC-compliant email pattern
                    value: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
                    message: "Enter a valid email address (e.g. name@company.com)",
                  },
                })}
              />
              {errors.email && (
                <p className="error-text">{errors.email.message}</p>
              )}
            </div>

            {/* ── Password ─────────────────────────────────────────────── */}
            <div>
              <label htmlFor="signup-password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className={`input pr-10 ${errors.password ? "input-error" : ""}`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    maxLength: {
                      value: 128,
                      message: "Password must be 128 characters or fewer",
                    },
                    validate: (value) => {
                      if (!/[A-Za-z]/.test(value))
                        return "Password must contain at least one letter";
                      if (!/[0-9]/.test(value))
                        return "Password must contain at least one number";
                      return true;
                    },
                  })}
                />
                <button
                  type="button"
                  id="signup-toggle-password"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password ? (
                <p className="error-text">{errors.password.message}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  At least 8 characters with a letter and a number
                </p>
              )}
            </div>

            {/* ── Submit ───────────────────────────────────────────────── */}
            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="spinner h-4 w-4" />
                  <span>Creating account…</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            id="signup-login-link"
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
