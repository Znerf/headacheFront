'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { weatherService, LatestWeather } from '@/lib/weather';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [latestWeather, setLatestWeather] = useState<LatestWeather | null>(null);
  const [form, setForm] = useState({
    name: '',
    city: '',
    state: '',
    country: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/login');
          return;
        }
        const userData = await authService.getProfile();
        setUser(userData);
        setForm({
          name: userData?.name ?? '',
          city: userData?.location?.city ?? '',
          state: userData?.location?.state ?? '',
          country: userData?.location?.country ?? '',
          latitude: userData?.location?.latitude?.toString?.() ?? '',
          longitude: userData?.location?.longitude?.toString?.() ?? '',
        });
        try {
          const weather = await weatherService.getLatest();
          setLatestWeather(weather);
        } catch (err) {
          // Weather data may not exist yet; ignore
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const payload: any = {
        name: form.name,
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country || undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      };

      const updated = await authService.updateProfile(payload);
      setUser((prev: any) => ({ ...prev, ...updated }));
      setStatus('Profile updated');

      try {
        const weather = await weatherService.getLatest();
        setLatestWeather(weather);
      } catch (err) {
        // ignore
      }
    } catch (err: any) {
      setStatus(err?.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Headache Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile & Location</h2>
            <p className="text-gray-600 mb-4">Set your location so we can fetch nightly weather for your area.</p>
            <form className="space-y-4" onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State/Region</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    name="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    name="longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              {status && (
                <div className="text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-3 py-2">
                  {status}
                </div>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Latest Weather</h2>
            {!latestWeather ? (
              <p className="text-gray-600">No weather data yet.</p>
            ) : latestWeather.message ? (
              <p className="text-gray-600">{latestWeather.message}</p>
            ) : (
              <div className="space-y-2 text-gray-700">
                <div className="text-sm text-gray-500">
                  Recorded: {latestWeather.recordedAt ? new Date(latestWeather.recordedAt).toLocaleString() : '—'}
                </div>
                <div className="text-sm">Location: {latestWeather.location?.city || '—'} {latestWeather.location?.country || ''}</div>
                <div className="text-sm">Provider: {latestWeather.provider || '—'}</div>
                <div className="text-sm font-semibold">Current:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>Temp: {latestWeather.weather?.current?.temperature_2m ?? '—'}°C</span>
                  <span>Feels like: {latestWeather.weather?.current?.apparent_temperature ?? '—'}°C</span>
                  <span>Humidity: {latestWeather.weather?.current?.relative_humidity_2m ?? '—'}%</span>
                  <span>Precipitation: {latestWeather.weather?.current?.precipitation ?? '—'} mm</span>
                  <span>Cloud cover: {latestWeather.weather?.current?.cloud_cover ?? '—'}%</span>
                  <span>Wind: {latestWeather.weather?.current?.wind_speed_10m ?? '—'} km/h</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About Headache Tracking</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              Welcome to your personal headache tracking dashboard. This application helps you monitor and manage your headaches effectively.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Why Track Your Headaches?</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Identify patterns and triggers that cause your headaches</li>
              <li>Monitor the frequency and severity of your headaches over time</li>
              <li>Share accurate information with your healthcare provider</li>
              <li>Track the effectiveness of treatments and medications</li>
              <li>Make informed decisions about lifestyle changes</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">What to Track</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Date and Time:</strong> When did the headache start and end?</li>
              <li><strong>Severity:</strong> Rate your pain level (1-10 scale)</li>
              <li><strong>Location:</strong> Where is the pain located?</li>
              <li><strong>Type:</strong> Throbbing, sharp, dull, pressure?</li>
              <li><strong>Triggers:</strong> What might have caused it? (stress, food, weather, etc.)</li>
              <li><strong>Symptoms:</strong> Any associated symptoms? (nausea, sensitivity to light/sound)</li>
              <li><strong>Treatment:</strong> What medications or remedies did you use?</li>
              <li><strong>Relief:</strong> What helped reduce or stop the headache?</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Common Headache Types</h3>
            <div className="space-y-3 text-gray-600">
              <div>
                <strong className="text-gray-900">Tension Headaches:</strong> The most common type, often caused by stress, poor posture, or muscle tension.
              </div>
              <div>
                <strong className="text-gray-900">Migraines:</strong> Severe headaches often accompanied by nausea, sensitivity to light/sound, and visual disturbances.
              </div>
              <div>
                <strong className="text-gray-900">Cluster Headaches:</strong> Intense pain typically around one eye, occurring in patterns or clusters.
              </div>
              <div>
                <strong className="text-gray-900">Sinus Headaches:</strong> Caused by sinus inflammation, often with facial pressure and congestion.
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Tips for Better Tracking</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Log your headaches as soon as possible for accurate details</li>
              <li>Be consistent with your tracking habits</li>
              <li>Include information about sleep, diet, and stress levels</li>
              <li>Note weather changes or hormonal factors if relevant</li>
              <li>Review your logs regularly to identify patterns</li>
            </ul>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">Get Started</h3>
          <p className="text-indigo-700">
            Start tracking your headaches today to gain valuable insights into your health and well-being. Regular tracking can help you and your healthcare provider make better decisions about your treatment plan.
          </p>
        </div>
      </main>
    </div>
  );
}
