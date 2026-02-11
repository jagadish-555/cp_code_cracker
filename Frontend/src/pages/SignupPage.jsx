import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { FormCard } from '../components/FormCard';
import { FormInput } from '../components/FormInput';
import { FormError } from '../components/FormError';
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
    <AuthLayout>
      <FormCard label="Get Started" title="Create Account">
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
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            placeholder="your_username"
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

          <FormInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            className="neo-button-primary w-full mt-6"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      </FormCard>

      <p className="text-center text-white/50 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-[#4cc9f0] hover:underline font-medium transition-colors">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};
