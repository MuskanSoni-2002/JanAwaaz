import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  ClipboardPenLine,
  ImageIcon,
  Loader2,
  MapPinned,
  Navigation,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { getApiErrorMessage } from '../utils/api';

const RaiseComplaint = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const previewUrl = watch('imageUrl');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load complaint categories.'));
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const payload = {
        description: data.description,
        categoryId: data.categoryId,
        latitude: data.latitude,
        longitude: data.longitude,
        addressText: data.addressText?.trim() || null,
        imageUrl: data.imageUrl?.trim() || null,
      };

      await api.post('/grievances/file', payload);
      toast.success('Complaint raised successfully!');
      navigate('/complaints');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to raise complaint. Please check your inputs.'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location services are unavailable in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', Number(position.coords.latitude.toFixed(6)));
        setValue('longitude', Number(position.coords.longitude.toFixed(6)));
        toast.success(`Location identified: ${position.coords.latitude}, ${position.coords.longitude}`);
      },
      () => toast.error('Location disabled or unavailable'),
    );
  };

  return (
    <div className="space-y-6">
      <section className="surface-card-strong animate-fade-rise px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="page-kicker">New complaint</p>
            <h2 className="page-title mt-3">Submit a clear, high-context issue report.</h2>
            <p className="page-copy mt-4 max-w-2xl">
              Better descriptions and precise location details make it easier for the right department to act quickly.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="soft-pill">
              <Sparkles className="h-3.5 w-3.5" />
              Guided submission flow
            </div>
            <div className="soft-pill">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Backend-connected categories
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="surface-card animate-fade-rise animate-fade-rise-delay-1 p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="icon-badge">
                  <ClipboardPenLine className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="section-title">Issue details</h3>
                  <p className="section-copy mt-1">Capture what happened in a way that is easy to triage.</p>
                </div>
              </div>

              <div className="grid gap-5">
                <label className="block">
                  <span className="field-label">Category</span>
                  <select
                    {...register('categoryId', { required: 'Category is required', valueAsNumber: true })}
                    disabled={loadingCategories}
                    className="field-select"
                  >
                    <option value="">{loadingCategories ? 'Loading categories...' : 'Select a category'}</option>
                    {categories.map((category) => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && <span className="mt-2 block text-xs text-rose-500">{errors.categoryId.message}</span>}
                </label>

                <label className="block">
                  <span className="field-label">Detailed description</span>
                  <textarea
                    {...register('description', {
                      required: 'Description is required',
                      minLength: {
                        value: 10,
                        message: 'Description must be at least 10 characters',
                      },
                    })}
                    placeholder="Explain the issue, how long it has been happening, and any visible impact."
                    className="field-textarea"
                  />
                  {errors.description && <span className="mt-2 block text-xs text-rose-500">{errors.description.message}</span>}
                </label>

                <label className="block">
                  <span className="field-label">
                    <span className="inline-flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Image URL
                      <span className="text-slate-400 font-normal">(optional)</span>
                    </span>
                  </span>
                  <input
                    type="url"
                    {...register('imageUrl', {
                      maxLength: {
                        value: 2048,
                        message: 'Image URL must be at most 2048 characters',
                      },
                      pattern: {
                        value: /^https?:\/\/.+/i,
                        message: 'Please enter a valid URL starting with http:// or https://',
                      },
                    })}
                    placeholder="https://example.com/photo-of-issue.jpg"
                    className="field-input"
                  />
                  {errors.imageUrl && <span className="mt-2 block text-xs text-rose-500">{errors.imageUrl.message}</span>}
                  {previewUrl && !errors.imageUrl && (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                      <img
                        src={previewUrl}
                        alt="Issue preview"
                        className="h-48 w-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        onLoad={(e) => { e.currentTarget.style.display = 'block'; }}
                      />
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-5 border-t pt-8 subtle-divider">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="icon-badge">
                    <MapPinned className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="section-title">Location details</h3>
                    <p className="section-copy mt-1">Pinpoint the issue so the assigned team can find it quickly.</p>
                  </div>
                </div>

                <button type="button" onClick={handleGetLocation} className="secondary-btn px-4 py-2.5">
                  <Navigation className="h-4 w-4" />
                  Use GPS
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="field-label">Latitude</span>
                  <input
                    type="number"
                    step="any"
                    {...register('latitude', {
                      required: 'Latitude is required',
                      valueAsNumber: true,
                      min: { value: -90, message: 'Latitude must be at least -90' },
                      max: { value: 90, message: 'Latitude must be at most 90' },
                    })}
                    className="field-input"
                    placeholder="28.7041"
                  />
                  {errors.latitude && <span className="mt-2 block text-xs text-rose-500">{errors.latitude.message}</span>}
                </label>

                <label className="block">
                  <span className="field-label">Longitude</span>
                  <input
                    type="number"
                    step="any"
                    {...register('longitude', {
                      required: 'Longitude is required',
                      valueAsNumber: true,
                      min: { value: -180, message: 'Longitude must be at least -180' },
                      max: { value: 180, message: 'Longitude must be at most 180' },
                    })}
                    className="field-input"
                    placeholder="77.1025"
                  />
                  {errors.longitude && <span className="mt-2 block text-xs text-rose-500">{errors.longitude.message}</span>}
                </label>
              </div>

              <label className="block">
                <span className="field-label">Street address or landmark</span>
                <input
                  type="text"
                  {...register('addressText')}
                  placeholder="Near the community center, opposite gate 2..."
                  className="field-input"
                />
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t pt-8 sm:flex-row sm:justify-end subtle-divider">
              <button type="button" onClick={() => navigate('/dashboard')} className="secondary-btn">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="primary-btn">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="surface-card animate-fade-rise animate-fade-rise-delay-2 p-6">
            <p className="page-kicker">Submission notes</p>
            <h3 className="section-title mt-2">What helps complaints move faster</h3>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              <li className="surface-card-muted flex items-start gap-3 p-4">
                <span className="soft-pill shrink-0">1</span>
                Describe the issue itself, not just the inconvenience it causes.
              </li>
              <li className="surface-card-muted flex items-start gap-3 p-4">
                <span className="soft-pill shrink-0">2</span>
                Use nearby landmarks if the exact street address is hard to capture.
              </li>
              <li className="surface-card-muted flex items-start gap-3 p-4">
                <span className="soft-pill shrink-0">3</span>
                Choose the closest matching category so routing stays accurate.
              </li>
            </ul>
          </section>

          <section className="surface-card p-6">
            <p className="page-kicker">Live data</p>
            <h3 className="section-title mt-2">Category availability</h3>
            <div className="mt-5 rounded-[24px] bg-slate-950 px-5 py-5 text-white shadow-lg shadow-slate-950/20 dark:bg-white dark:text-slate-950">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60 dark:text-slate-500">Loaded categories</p>
              <p className="mt-3 text-4xl font-bold tracking-[-0.05em]">{categories.length}</p>
              <p className="mt-2 text-sm text-white/72 dark:text-slate-500">
                Connected directly to the backend category list.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default RaiseComplaint;
