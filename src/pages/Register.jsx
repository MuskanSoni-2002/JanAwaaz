import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Lock, Mail, MapPinned, Phone, UserCircle2 } from 'lucide-react';
import api from '../services/api';
import { getApiErrorMessage } from '../utils/api';
import AuthLayout from '../components/AuthLayout';

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);

    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      address: {
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || '',
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      },
    };

    try {
      await api.post('/register', payload);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to register. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your citizen account"
      subtitle="Set up a clean workspace for raising complaints, following updates, and managing your civic profile."
      spotlightTitle="A more thoughtful way to interact with public-service workflows."
      spotlightCopy="From first registration to final resolution, the experience is designed to stay clear, lightweight, and professional."
      highlights={[
        { label: 'Submit', value: 'New complaints' },
        { label: 'Track', value: 'Status changes' },
        { label: 'Maintain', value: 'Account details' },
      ]}
      formWidth="max-w-2xl"
      footer={(
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
            Sign in securely
          </Link>
        </p>
      )}
    >
      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="icon-badge">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="section-title">Personal information</h3>
                <p className="section-copy mt-1">Use the same contact details you’ll want tied to complaint updates.</p>
              </div>
            </div>

            <div className="grid gap-5">
              <label className="block">
                <span className="field-label">First name</span>
                <input type="text" {...register('firstName', { required: 'Required' })} className="field-input" />
                {errors.firstName && <span className="mt-2 block text-xs text-rose-500">{errors.firstName.message}</span>}
              </label>

              <label className="block">
                <span className="field-label">Last name</span>
                <input type="text" {...register('lastName', { required: 'Required' })} className="field-input" />
                {errors.lastName && <span className="mt-2 block text-xs text-rose-500">{errors.lastName.message}</span>}
              </label>

              <label className="block">
                <span className="field-label">Gender</span>
                <select {...register('gender', { required: 'Required' })} className="field-select">
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <span className="mt-2 block text-xs text-rose-500">{errors.gender.message}</span>}
              </label>

              <label className="block">
                <span className="field-label">Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input type="email" {...register('email', { required: 'Required' })} className="field-input pl-11" />
                </div>
                {errors.email && <span className="mt-2 block text-xs text-rose-500">{errors.email.message}</span>}
              </label>

              <label className="block">
                <span className="field-label">Phone</span>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    {...register('phoneNumber', {
                      required: 'Required',
                      pattern: {
                        value: /^\d{10}$/,
                        message: 'Phone number must be 10 digits',
                      },
                    })}
                    className="field-input pl-11"
                  />
                </div>
                {errors.phoneNumber && <span className="mt-2 block text-xs text-rose-500">{errors.phoneNumber.message}</span>}
              </label>

              <label className="block">
                <span className="field-label">Password</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    {...register('password', {
                      required: 'Required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className="field-input pl-11"
                  />
                </div>
                {errors.password && <span className="mt-2 block text-xs text-rose-500">{errors.password.message}</span>}
              </label>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="icon-badge">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <h3 className="section-title">Address details</h3>
                <p className="section-copy mt-1">These details help match your complaints with the correct local context.</p>
              </div>
            </div>

            <div className="grid gap-5">
              <label className="block">
                <span className="field-label">Address line 1</span>
                <input type="text" {...register('addressLine1', { required: 'Required' })} className="field-input" />
                {errors.addressLine1 && <span className="mt-2 block text-xs text-rose-500">{errors.addressLine1.message}</span>}
              </label>

              <label className="block">
                <span className="field-label">Address line 2</span>
                <input type="text" {...register('addressLine2')} className="field-input" />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="field-label">City</span>
                  <input type="text" {...register('city', { required: 'Required' })} className="field-input" />
                  {errors.city && <span className="mt-2 block text-xs text-rose-500">{errors.city.message}</span>}
                </label>

                <label className="block">
                  <span className="field-label">State</span>
                  <input type="text" {...register('state', { required: 'Required' })} className="field-input" />
                  {errors.state && <span className="mt-2 block text-xs text-rose-500">{errors.state.message}</span>}
                </label>
              </div>

              <label className="block">
                <span className="field-label">Pincode</span>
                <input
                  type="text"
                  {...register('pincode', {
                    required: 'Required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Pincode must be 6 digits',
                    },
                  })}
                  className="field-input"
                />
                {errors.pincode && <span className="mt-2 block text-xs text-rose-500">{errors.pincode.message}</span>}
              </label>
            </div>
          </section>
        </div>

        <button type="submit" disabled={isLoading} className="primary-btn w-full">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register Citizen Account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
