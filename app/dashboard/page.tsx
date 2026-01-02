'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { weatherService, LatestWeather } from '@/lib/weather';
import { headacheService, HeadacheRecord, HeadacheRecordsResponse } from '@/lib/headache';

type SparklineProps = {
  values: number[];
  times: string[];
  color: string;
  label: string;
  unit: string;
};

function Sparkline({ values, times, color, label, unit }: SparklineProps) {
  if (!values.length) return null;

  const height = 80;
  const step = 26; // horizontal spacing per point
  const gradientId = `spark-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / span) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const width = Math.max(values.length - 1, 1) * step;

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-baseline justify-between text-sm text-slate-700 mb-2">
        <div className="font-semibold text-slate-900">{label}</div>
        <div className="text-xs">Min {min.toFixed(1)}{unit} · Max {max.toFixed(1)}{unit}</div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label} chart`} className="w-full h-28">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill={`url(#${gradientId})`}
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
        <span>{new Date(times[0]).toLocaleTimeString([], { hour: '2-digit' })}</span>
        <span>{new Date(times[times.length - 1]).toLocaleTimeString([], { hour: '2-digit' })}</span>
      </div>
    </div>
  );
}

type BarStripProps = {
  values: number[];
  times: string[];
  color: string;
  label: string;
  unit: string;
};

function BarStrip({ values, times, color, label, unit }: BarStripProps) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-baseline justify-between text-sm text-slate-700 mb-2">
        <div className="font-semibold text-slate-900">{label}</div>
        <div className="text-xs">Peak {max.toFixed(1)}{unit}</div>
      </div>
      <div className="flex items-end gap-[3px] h-28">
        {values.map((v, idx) => {
          const h = (v / max) * 100;
          return (
            <div key={times[idx]} className="flex-1">
              <div
                className="rounded-t-sm"
                style={{ height: `${h}%`, background: color, opacity: 0.8 }}
                title={`${new Date(times[idx]).toLocaleTimeString([], { hour: '2-digit' })}: ${v}${unit}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
        <span>{new Date(times[0]).toLocaleTimeString([], { hour: '2-digit' })}</span>
        <span>{new Date(times[times.length - 1]).toLocaleTimeString([], { hour: '2-digit' })}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [latestWeather, setLatestWeather] = useState<LatestWeather | null>(null);
  const [hourlySlices, setHourlySlices] = useState<
    { time: string; temp: number; apparent: number; humidity: number; precip: number; wind: number; uv: number; dewPoint: number; cloud: number; pressure: number; visibility: number }[]
  >([]);
  const [headacheRecords, setHeadacheRecords] = useState<HeadacheRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [todayRecord, setTodayRecord] = useState<HeadacheRecord | null>(null);
  const [headacheForm, setHeadacheForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hadHeadache: false,
    headacheStartTime: '',
    headacheEndTime: '',
    wentOutsideYesterday: false,
    drankWaterYesterday: false,
    notes: '',
  });
  const [savingHeadache, setSavingHeadache] = useState(false);
  const [headacheStatus, setHeadacheStatus] = useState<string | null>(null);
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
          const h = weather.weather?.hourly;
          const times: string[] = h?.time ?? [];
          const slices = times.slice(0, 24).map((t: string, idx: number) => ({
            time: t,
            temp: h?.temperature_2m?.[idx] ?? 0,
            apparent: h?.apparent_temperature?.[idx] ?? 0,
            humidity: h?.relative_humidity_2m?.[idx] ?? 0,
            precip: h?.precipitation?.[idx] ?? 0,
            wind: h?.wind_speed_10m?.[idx] ?? 0,
            uv: h?.uv_index?.[idx] ?? 0,
            dewPoint: h?.dew_point_2m?.[idx] ?? 0,
            cloud: h?.cloud_cover?.[idx] ?? 0,
            pressure: h?.pressure_msl?.[idx] ?? 0,
            visibility: h?.visibility?.[idx] ?? 0,
          }));
          setHourlySlices(slices);
        } catch (err) {
          // Weather data may not exist yet; ignore
        }

        // Fetch headache records
        try {
          const response = await headacheService.getRecords(10, 1);
          setHeadacheRecords(response.data);
          setTotalPages(response.totalPages);
          setTotalRecords(response.total);
          
          const today = new Date().toISOString().split('T')[0];
          const todayRec = await headacheService.getRecordByDate(today);
          if (todayRec) {
            setTodayRecord(todayRec);
            setHeadacheForm({
              date: today,
              hadHeadache: todayRec.hadHeadache,
              headacheStartTime: todayRec.headacheStartTime || '',
              headacheEndTime: todayRec.headacheEndTime || '',
              wentOutsideYesterday: todayRec.wentOutsideYesterday,
              drankWaterYesterday: todayRec.drankWaterYesterday,
              notes: todayRec.notes || '',
            });
          }
        } catch (err) {
          // Headache records may not exist yet
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
        const h = weather.weather?.hourly;
        const times: string[] = h?.time ?? [];
        const slices = times.slice(0, 24).map((t: string, idx: number) => ({
          time: t,
          temp: h?.temperature_2m?.[idx] ?? 0,
          apparent: h?.apparent_temperature?.[idx] ?? 0,
          humidity: h?.relative_humidity_2m?.[idx] ?? 0,
          precip: h?.precipitation?.[idx] ?? 0,
          wind: h?.wind_speed_10m?.[idx] ?? 0,
          uv: h?.uv_index?.[idx] ?? 0,
          dewPoint: h?.dew_point_2m?.[idx] ?? 0,
          cloud: h?.cloud_cover?.[idx] ?? 0,
          pressure: h?.pressure_msl?.[idx] ?? 0,
          visibility: h?.visibility?.[idx] ?? 0,
        }));
        setHourlySlices(slices);
      } catch (err) {
        // ignore
      }
    } catch (err: any) {
      setStatus(err?.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setStatus('Requesting location permission...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setForm((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));

        // Reverse geocode to get city/state/country
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          setForm((prev) => ({
            ...prev,
            city: data.city || data.locality || prev.city,
            state: data.principalSubdivision || prev.state,
            country: data.countryName || prev.country,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));

          setStatus('Location detected! Click "Save profile" to save.');
        } catch (err) {
          setStatus('Location coordinates detected! Add city details and save.');
        }
        
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setStatus('Location permission denied. Please enable location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setStatus('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setStatus('Location request timed out.');
            break;
          default:
            setStatus('An error occurred while getting location.');
        }
      }
    );
  };

  const handleHeadacheFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setHeadacheForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setHeadacheForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleHeadacheSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHeadache(true);
    setHeadacheStatus(null);
    try {
      if (todayRecord) {
        await headacheService.updateRecord(
          todayRecord._id,
          headacheForm.hadHeadache,
          headacheForm.headacheStartTime || undefined,
          headacheForm.headacheEndTime || undefined,
          headacheForm.wentOutsideYesterday,
          headacheForm.drankWaterYesterday,
          headacheForm.notes || undefined,
        );
        setHeadacheStatus('Record updated successfully');
      } else {
        const newRecord = await headacheService.createRecord(
          headacheForm.date,
          headacheForm.hadHeadache,
          headacheForm.headacheStartTime || undefined,
          headacheForm.headacheEndTime || undefined,
          headacheForm.wentOutsideYesterday,
          headacheForm.drankWaterYesterday,
          headacheForm.notes || undefined,
        );
        setTodayRecord(newRecord);
        setHeadacheStatus('Record saved successfully');
      }

      // Refresh records list
      const response = await headacheService.getRecords(10, currentPage);
      setHeadacheRecords(response.data);
      setTotalPages(response.totalPages);
      setTotalRecords(response.total);
    } catch (err: any) {
      setHeadacheStatus(err?.response?.data?.message || 'Failed to save record');
    } finally {
      setSavingHeadache(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    try {
      const response = await headacheService.getRecords(10, newPage);
      setHeadacheRecords(response.data);
      setTotalPages(response.totalPages);
      setTotalRecords(response.total);
      setCurrentPage(newPage);
    } catch (err) {
      console.error('Failed to fetch page:', err);
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Log Today&apos;s Headache</h2>
            <p className="text-gray-600 mb-4 text-sm">Track your headache and outdoor activity for today.</p>
            
            <form className="space-y-4" onSubmit={handleHeadacheSave}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={headacheForm.date}
                  onChange={handleHeadacheFormChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hadHeadache"
                    checked={headacheForm.hadHeadache}
                    onChange={handleHeadacheFormChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">I had a headache today</span>
                </label>

                {headacheForm.hadHeadache && (
                  <div className="ml-6 space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start time</label>
                      <input
                        type="time"
                        name="headacheStartTime"
                        value={headacheForm.headacheStartTime}
                        onChange={handleHeadacheFormChange}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">End time</label>
                      <input
                        type="time"
                        name="headacheEndTime"
                        value={headacheForm.headacheEndTime}
                        onChange={handleHeadacheFormChange}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="wentOutsideYesterday"
                    checked={headacheForm.wentOutsideYesterday}
                    onChange={handleHeadacheFormChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">I went outside yesterday</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="drankWaterYesterday"
                    checked={headacheForm.drankWaterYesterday}
                    onChange={handleHeadacheFormChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">I drank water yesterday</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                <textarea
                  name="notes"
                  value={headacheForm.notes}
                  onChange={handleHeadacheFormChange}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Any additional notes about your day..."
                />
              </div>

              {headacheStatus && (
                <div className="text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-3 py-2">
                  {headacheStatus}
                </div>
              )}

              <button
                type="submit"
                disabled={savingHeadache}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {savingHeadache ? 'Saving...' : todayRecord ? 'Update Record' : 'Save Record'}
              </button>
            </form>

            {totalRecords > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Headache Records</h3>
                  <div className="text-sm text-gray-600">
                    {totalRecords} total record{totalRecords !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="space-y-2">
                  {headacheRecords.map((record) => (
                    <div key={record._id} className="text-sm p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-1">
                        <span className={record.hadHeadache ? 'text-red-600' : 'text-green-600'}>
                          {record.hadHeadache ? '🤕 Headache' : '✓ No headache'}
                          {record.hadHeadache && record.headacheStartTime && (
                            <span className="text-gray-500"> ({record.headacheStartTime}{record.headacheEndTime ? ` - ${record.headacheEndTime}` : ''})</span>
                          )}
                        </span>
                        <span className={record.wentOutsideYesterday ? 'text-blue-500' : 'text-gray-400'}>
                          {record.wentOutsideYesterday ? '🚶 Out yest.' : '🏠 In yest.'}
                        </span>
                        <span className={record.drankWaterYesterday ? 'text-cyan-600' : 'text-gray-400'}>
                          {record.drankWaterYesterday ? '💧 Water yest.' : '⊘ No water yest.'}
                        </span>
                      </div>
                      {record.notes && (
                        <div className="text-xs text-gray-500 mt-1 italic">{record.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile & Location</h2>
            <p className="text-gray-600 mb-4">Set your location so we can fetch nightly weather for your area.</p>
            
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className="w-full md:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>📍</span>
                {gettingLocation ? 'Getting location...' : 'Use My Current Location'}
              </button>
              <p className="text-xs text-gray-500 mt-2">Click to allow browser location access and auto-fill coordinates</p>
            </div>

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-3">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Latest Weather</h2>
            {!latestWeather ? (
              <p className="text-gray-600">No weather data yet.</p>
            ) : latestWeather.message ? (
              <p className="text-gray-600">{latestWeather.message}</p>
            ) : (
              <div className="space-y-4 text-gray-700">
                <div className="text-sm text-gray-500">
                  Recorded: {latestWeather.recordedAt ? new Date(latestWeather.recordedAt).toLocaleString() : '—'}
                </div>
                <div className="text-sm">Location: {latestWeather.location?.city || '—'} {latestWeather.location?.country || ''}</div>
                <div className="text-sm">Provider: {latestWeather.provider || '—'}</div>

                {hourlySlices.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-gray-900">Today (next 24h)</div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Sparkline
                        values={hourlySlices.map((h) => h.temp)}
                        times={hourlySlices.map((h) => h.time)}
                        color="#2563eb"
                        label="Temperature"
                        unit="°C"
                      />
                      <Sparkline
                        values={hourlySlices.map((h) => h.apparent)}
                        times={hourlySlices.map((h) => h.time)}
                        color="#dc2626"
                        label="Feels Like"
                        unit="°C"
                      />
                      <Sparkline
                        values={hourlySlices.map((h) => h.humidity)}
                        times={hourlySlices.map((h) => h.time)}
                        color="#16a34a"
                        label="Humidity"
                        unit="%"
                      />
                      <Sparkline
                        values={hourlySlices.map((h) => h.dewPoint)}
                        times={hourlySlices.map((h) => h.time)}
                        color="#06b6d4"
                        label="Dew Point"
                        unit="°C"
                      />
                      <Sparkline
                        values={hourlySlices.map((h) => h.wind)}
                        times={hourlySlices.map((h) => h.time)}
                        color="#0ea5e9"
                        label="Wind Speed"
                        unit=" km/h"
                      />
                      <Sparkline
                        values={hourlySlices.map((h) => h.pressure)}
                        times={hourlySlices.map((h) => h.time)}
                        color="#8b5cf6"
                        label="Pressure"
                        unit=" hPa"
                      />
                      <BarStrip
                        values={hourlySlices.map((h) => h.precip)}
                        times={hourlySlices.map((h) => h.time)}
                        color="#7c3aed"
                        label="Precipitation"
                        unit=" mm"
                      />
                      <BarStrip
                        values={hourlySlices.map((h) => h.cloud)}
                        times={hourlySlices.map((h) => h.time)}
                        color="#64748b"
                        label="Cloud Cover"
                        unit="%"
                      />
                      <Sparkline
                        values={hourlySlices.map((h) => h.visibility / 1000)}
                        times={hourlySlices.map((h) => h.time)}
                        color="#f59e0b"
                        label="Visibility"
                        unit=" km"
                      />
                      <BarStrip
                        values={hourlySlices.map((h) => h.uv)}
                        times={hourlySlices.map((h) => h.time)}
                        color="#f97316"
                        label="UV Index"
                        unit=""
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-semibold mb-2">Hourly Details (next 12h)</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-left">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="py-2 pr-4">Time</th>
                          <th className="py-2 pr-4">Temp</th>
                          <th className="py-2 pr-4">Feels</th>
                          <th className="py-2 pr-4">Dew Pt</th>
                          <th className="py-2 pr-4">Humidity</th>
                          <th className="py-2 pr-4">Precip</th>
                          <th className="py-2 pr-4">Wind</th>
                          <th className="py-2 pr-4">Cloud</th>
                          <th className="py-2 pr-4">Pressure</th>
                          <th className="py-2 pr-4">Visibility</th>
                          <th className="py-2 pr-4">UV</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(latestWeather.weather?.hourly?.time ?? []).slice(0, 12).map((time: string, idx: number) => {
                          const h = latestWeather.weather?.hourly;
                          return (
                            <tr key={time} className="align-top">
                              <td className="py-2 pr-4 whitespace-nowrap">{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                              <td className="py-2 pr-4">{h?.temperature_2m?.[idx] ?? '—'}°C</td>
                              <td className="py-2 pr-4">{h?.apparent_temperature?.[idx] ?? '—'}°C</td>
                              <td className="py-2 pr-4">{h?.dew_point_2m?.[idx] ?? '—'}°C</td>
                              <td className="py-2 pr-4">{h?.relative_humidity_2m?.[idx] ?? '—'}%</td>
                              <td className="py-2 pr-4">{h?.precipitation?.[idx] ?? '—'} mm</td>
                              <td className="py-2 pr-4">{h?.wind_speed_10m?.[idx] ?? '—'} km/h</td>
                              <td className="py-2 pr-4">{h?.cloud_cover?.[idx] ?? '—'}%</td>
                              <td className="py-2 pr-4">{h?.pressure_msl?.[idx] ?? '—'} hPa</td>
                              <td className="py-2 pr-4">{((h?.visibility?.[idx] ?? 0) / 1000).toFixed(1)} km</td>
                              <td className="py-2 pr-4">{h?.uv_index?.[idx] ?? '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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
