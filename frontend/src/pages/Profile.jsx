import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  BadgeCheck,
  Loader2,
  Mail,
  MapPinned,
  PencilLine,
  Phone,
  UserCircle2,
} from 'lucide-react';
import { setUser } from '../features/authSlice';
import api from '../services/api';
import { getApiErrorMessage } from '../utils/api';

const Profile = () => {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/citizens/me');
        dispatch(setUser(response.data));
        reset({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          phoneNumber: response.data.phoneNumber,
          addressLine1: response.data.address?.addressLine1,
          addressLine2: response.data.address?.addressLine2,
          city: response.data.address?.city,
          state: response.data.address?.state,
          pincode: response.data.address?.pincode,
        });
      } catch (error) {
        console.error(error);
        toast.error(getApiErrorMessage(error, 'Failed to load profile.'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [dispatch, reset]);

  const onSubmit = async (data) => {
    setSaving(true);

    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      address: {
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      },
    };

    try {
      const response = await api.patch('/citizens/me', payload);
      dispatch(setUser(response.data));
      reset({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        phoneNumber: response.data.phoneNumber,
        addressLine1: response.data.address?.addressLine1,
        addressLine2: response.data.address?.addressLine2,
        city: response.data.address?.city,
        state: response.data.address?.state,
        pincode: response.data.address?.pincode,
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      reset({
        firstName: user?.firstName,
        lastName: user?.lastName,
        phoneNumber: user?.phoneNumber,
        addressLine1: user?.address?.addressLine1,
        addressLine2: user?.address?.addressLine2,
        city: user?.address?.city,
        state: user?.address?.state,
        pincode: user?.address?.pincode,
      });
    }

    setIsEditing((currentValue) => !currentValue);
  };

  if (loading) {
    return <div className="flex justify-center items-center py-24 text-primary"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <section className="surface-card-strong animate-fade-rise overflow-hidden px-6 py-6 sm:px-8 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-slate-950 text-white shadow-2xl shadow-slate-950/20 dark:bg-white dark:text-slate-950">
              <UserCircle2 className="h-11 w-11" />
            </div>
            <div>
              <p className="page-kicker">Citizen account</p>
              <h2 className="display-heading mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-[-0.06em]">
                {user?.firstName} {user?.lastName}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="soft-pill">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {user?.active ? 'Active account' : 'Inactive account'}
                </span>
                <span className="soft-pill">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email}
                </span>
              </div>
            </div>
          </div>

          <button onClick={handleToggleEdit} className={isEditing ? 'secondary-btn' : 'primary-btn'}>
            <PencilLine className="h-4 w-4" />
            {isEditing ? 'Cancel edit' : 'Edit profile'}
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-2">
        <section className="surface-card animate-fade-rise animate-fade-rise-delay-1 p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="icon-badge">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="page-kicker">Personal details</p>
              <h3 className="section-title mt-2">Basic information</h3>
              <p className="section-copy mt-1">These details help keep your complaint history tied to the right account.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="field-label">First name</span>
              <input
                type="text"
                disabled={!isEditing}
                {...register('firstName')}
                className="field-input disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>

            <label className="block">
              <span className="field-label">Last name</span>
              <input
                type="text"
                disabled={!isEditing}
                {...register('lastName')}
                className="field-input disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="field-label">Phone number</span>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  disabled={!isEditing}
                  {...register('phoneNumber')}
                  className="field-input pl-11 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
            </label>
          </div>
        </section>

        <section className="surface-card animate-fade-rise animate-fade-rise-delay-2 p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="icon-badge">
              <MapPinned className="h-5 w-5" />
            </div>
            <div>
              <p className="page-kicker">Address</p>
              <h3 className="section-title mt-2">Location details</h3>
              <p className="section-copy mt-1">Accurate address information helps officers verify and route complaints faster.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="field-label">Address line 1</span>
              <input
                type="text"
                disabled={!isEditing}
                {...register('addressLine1')}
                className="field-input disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="field-label">Address line 2</span>
              <input
                type="text"
                disabled={!isEditing}
                {...register('addressLine2')}
                className="field-input disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>

            <label className="block">
              <span className="field-label">City</span>
              <input
                type="text"
                disabled={!isEditing}
                {...register('city')}
                className="field-input disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>

            <label className="block">
              <span className="field-label">State</span>
              <input
                type="text"
                disabled={!isEditing}
                {...register('state')}
                className="field-input disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>

            <label className="block">
              <span className="field-label">Pincode</span>
              <input
                type="text"
                disabled={!isEditing}
                {...register('pincode')}
                className="field-input disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>
          </div>
        </section>

        {isEditing && (
          <div className="xl:col-span-2 flex justify-end">
            <button type="submit" disabled={saving} className="primary-btn">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
