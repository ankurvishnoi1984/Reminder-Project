import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4
      bg-gradient-to-br from-slate-500 via-blue-300 to-indigo-800">

      {/* Card */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg
        border border-white/40 shadow-2xl rounded-2xl p-8">

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Admin Login
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Please login to your admin account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                focus:border-transparent transition"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                focus:border-transparent transition"
              placeholder="Enter your password"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2
              bg-indigo-600 hover:bg-indigo-700
              text-white font-semibold py-3 rounded-xl
              shadow-lg hover:shadow-xl
              active:scale-[0.98]
              transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-500 text-center">
          Default: admin@company.com / admin123
        </p>
      </div>
    </div>
  );
};

export default Login;