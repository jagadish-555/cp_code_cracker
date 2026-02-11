import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { FormCard } from '../components/FormCard';
import { FormInput } from '../components/FormInput';
import { FormError } from '../components/FormError';
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
    <AuthLayout>
      <FormCard label="Authentication" title="Sign In">
        <FormError message={serverError} />
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
          />

          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            className="neo-button-primary w-full mt-6"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </FormCard>

      <p className="text-center text-white/50 text-sm">
        Don't have an account?{' '}
        <Link to="/signup" className="text-[#4cc9f0] hover:underline font-medium transition-colors">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
};
