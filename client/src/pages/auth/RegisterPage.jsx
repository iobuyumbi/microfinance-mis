
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import FormField from '../../components/ui/form-field';
import { useAuth } from '../../context/AuthContext';
import { registerSchema } from '../../lib/validations';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'member',
      address: ''
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await registerUser(data);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError('root', {
          type: 'manual',
          message: result.error || 'Registration failed'
        });
      }
    } catch (error) {
      console.error('Registration submission error:', error);
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'member', label: 'Member' },
    { value: 'leader', label: 'Group Leader' },
    { value: 'officer', label: 'Field Officer' },
    { value: 'admin', label: 'Administrator' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">MF</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join our Microfinance MIS platform
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="firstName"
                control={control}
                label="First Name"
                placeholder="Enter first name"
                error={errors.firstName}
                required
                disabled={isSubmitting}
              />

              <FormField
                name="lastName"
                control={control}
                label="Last Name"
                placeholder="Enter last name"
                error={errors.lastName}
                required
                disabled={isSubmitting}
              />
            </div>

            <FormField
              name="email"
              control={control}
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              error={errors.email}
              required
              disabled={isSubmitting}
            />

            <FormField
              name="phone"
              control={control}
              label="Phone Number"
              type="tel"
              placeholder="e.g., +254712345678 or 0712345678"
              error={errors.phone}
              required
              disabled={isSubmitting}
            />

            <FormField
              name="role"
              control={control}
              label="Role"
              type="select"
              placeholder="Select your role"
              options={roleOptions}
              error={errors.role}
              required
              disabled={isSubmitting}
            />

            <FormField
              name="address"
              control={control}
              label="Address"
              type="textarea"
              placeholder="Enter your address (optional)"
              error={errors.address}
              disabled={isSubmitting}
            />

            <div className="space-y-2">
              <FormField
                name="password"
                control={control}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                error={errors.password}
                required
                disabled={isSubmitting}
              />
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Show
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <FormField
                name="confirmPassword"
                control={control}
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                error={errors.confirmPassword}
                required
                disabled={isSubmitting}
              />
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting}
              >
                {showConfirmPassword ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Show
                  </>
                )}
              </Button>
            </div>

            {errors.root && (
              <div className="text-sm text-destructive text-center">
                {errors.root.message}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
