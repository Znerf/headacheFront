import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Headache Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Track Your Headaches,
              <span className="text-indigo-600"> Take Control</span>
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Monitor patterns, identify triggers, and manage your headaches effectively with our comprehensive tracking solution.
            </p>
            <div className="mt-10">
              <Link
                href="/signup"
                className="inline-block px-8 py-3 text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-lg"
              >
                Start Tracking Free
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-indigo-600 text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Patterns</h3>
              <p className="text-gray-600">
                Log your headaches and identify patterns over time. Understand what triggers your headaches and when they occur.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-indigo-600 text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Identify Triggers</h3>
              <p className="text-gray-600">
                Discover what causes your headaches by tracking triggers like stress, food, weather, and lifestyle factors.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-indigo-600 text-3xl mb-4">💊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Treatment</h3>
              <p className="text-gray-600">
                Monitor the effectiveness of treatments and medications. Share detailed reports with your healthcare provider.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Track Your Headaches?</h3>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start">
                <span className="text-indigo-600 mr-3">✓</span>
                <p>Understand the frequency and severity of your headaches</p>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-600 mr-3">✓</span>
                <p>Identify lifestyle changes that can reduce headache occurrence</p>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-600 mr-3">✓</span>
                <p>Provide accurate information to your doctor for better diagnosis</p>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-600 mr-3">✓</span>
                <p>Monitor how well your treatments are working</p>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-600 mr-3">✓</span>
                <p>Take control of your health and wellbeing</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            © 2026 Headache Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
