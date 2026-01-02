'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/login');
          return;
        }
        const userData = await authService.getProfile();
        setUser(userData);
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
