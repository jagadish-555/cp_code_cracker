import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    try {
      loginSchema.parse(formData);
    } catch (err) {
      if (err.errors) {
        const newErrors = {};
        err.errors.forEach((error) => {
          newErrors[error.path[0]] = error.message;
        });
        setErrors(newErrors);
        return;
      }
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (result.needsPlatformSetup) {
        navigate('/link-platforms');
      } else {
        navigate('/dashboard');
      }
    } else {
      setServerError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-grotesk font-bold text-[#f0f0f0] mb-2">CodeCrakr</h1>
          <p className="text-[#a0a0a0]">Track. Compete. Improve.</p>
        </div>

        <div className="neo-card mb-6">
          <h2 className="text-2xl font-grotesk font-bold text-[#f0f0f0] mb-6">Welcome Back</h2>

          {serverError && (
            <div className="mb-4 p-3 bg-red-900/20 border-2 border-red-500 text-red-400 rounded">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#f0f0f0] mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`neo-input w-full ${errors.email ? 'border-red-500' : ''}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#f0f0f0] mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`neo-input w-full ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neo-button-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#a0a0a0]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#4cc9f0] hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};
