import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
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
      signupSchema.parse(formData);
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
    const result = await signup(formData.email, formData.password, formData.username);

    if (result.success) {
      navigate('/link-platforms');
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
          <h2 className="text-2xl font-grotesk font-bold text-[#f0f0f0] mb-6">Create Account</h2>

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
              <label className="block text-sm font-medium text-[#f0f0f0] mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`neo-input w-full ${errors.username ? 'border-red-500' : ''}`}
                placeholder="your_username"
              />
              {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
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

            <div>
              <label className="block text-sm font-medium text-[#f0f0f0] mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`neo-input w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neo-button-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#a0a0a0]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#4cc9f0] hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
