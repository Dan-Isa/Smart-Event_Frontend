import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../App";
import LoadingSpinner from "../components/LoadingSpinner";
import { authAPI } from "../services/api";

const LoginPage: React.FC = () => {
  const { login, signup } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [institutions, setInstitutions] = useState<
    { id: string; name: string }[]
  >([]);
  const [error, setError] = useState("");

  // Load institutions on mount
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const response = await authAPI.getInstitutions();
        setInstitutions(response.institutions);
        if (response.institutions.length > 0) {
          setInstitution(response.institutions[0].name);
        }
      } catch (error) {
        console.error("Error loading institutions:", error);
      }
    };
    loadInstitutions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password, institution);
      } else {
        await signup(email, password, institution);
      }
    } catch (error: any) {
      setError(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-700">
            Smart Event System
          </h1>
          <p className="text-gray-500 mt-2">
            {isLogin
              ? "Welcome! Please sign in to your account."
              : "Create an admin account"}
          </p>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            className={`flex-1 py-2 text-center font-semibold ${
              isLogin
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-gray-500"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
            className={`flex-1 py-2 text-center font-semibold ${
              !isLogin
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-gray-500"
            }`}
          >
            Admin Sign Up
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label
              htmlFor="institution"
              className="text-sm font-medium text-gray-700"
            >
              Institution
            </label>
            {isLogin ? (
              <select
                id="institution"
                name="institution"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.name}>
                    {inst.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="institution"
                name="institution"
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Enter your institution name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
          >
            {isLoading ? <LoadingSpinner /> : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
