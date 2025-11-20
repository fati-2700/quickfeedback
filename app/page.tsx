import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Nav */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              QuickFeedback
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Beautiful Feedback Widgets for Your Website
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Add a professional feedback system to your site in 60 seconds. No coding required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg"
                >
                  Start Free
                </Link>
                <a
                  href="#demo"
                  className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg border-2 border-gray-300 hover:border-gray-400 transition-all hover:scale-105"
                >
                  See Demo
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="relative transform hover:scale-105 transition-transform duration-300">
                {/* Browser Window Mockup */}
                <svg
                  viewBox="0 0 600 400"
                  className="w-full h-auto drop-shadow-2xl"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Browser Frame */}
                  <rect x="0" y="0" width="600" height="400" rx="12" fill="#1F2937" />
                  
                  {/* Browser Header */}
                  <rect x="0" y="0" width="600" height="40" rx="12" fill="#111827" />
                  
                  {/* Browser Controls */}
                  <circle cx="20" cy="20" r="6" fill="#EF4444" />
                  <circle cx="40" cy="20" r="6" fill="#F59E0B" />
                  <circle cx="60" cy="20" r="6" fill="#10B981" />
                  
                  {/* Address Bar */}
                  <rect x="100" y="12" width="400" height="16" rx="8" fill="#374151" />
                  <text x="110" y="23" fontSize="10" fill="#9CA3AF" fontFamily="system-ui">quickfeedback.co</text>
                  
                  {/* Browser Content Area */}
                  <rect x="0" y="40" width="600" height="360" rx="0" fill="#FFFFFF" />
                  
                  {/* Website Content - Header */}
                  <rect x="40" y="60" width="200" height="12" rx="6" fill="#E5E7EB" />
                  <rect x="40" y="80" width="300" height="16" rx="8" fill="#F3F4F6" />
                  <rect x="40" y="104" width="250" height="16" rx="8" fill="#F3F4F6" />
                  
                  {/* Website Content - Card */}
                  <rect x="40" y="140" width="520" height="180" rx="8" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
                  <rect x="60" y="160" width="120" height="8" rx="4" fill="#D1D5DB" />
                  <rect x="60" y="180" width="200" height="8" rx="4" fill="#E5E7EB" />
                  <rect x="60" y="200" width="180" height="8" rx="4" fill="#E5E7EB" />
                  <rect x="60" y="220" width="480" height="60" rx="6" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
                  <rect x="70" y="230" width="460" height="6" rx="3" fill="#F3F4F6" />
                  <rect x="70" y="245" width="400" height="6" rx="3" fill="#F3F4F6" />
                  <rect x="70" y="260" width="440" height="6" rx="3" fill="#F3F4F6" />
                  
                  {/* Feedback Widget Button - Bottom Right */}
                  <g transform="translate(520, 280)">
                    {/* Button Shadow */}
                    <circle cx="30" cy="30" r="30" fill="rgba(79, 70, 229, 0.2)" />
                    {/* Button Circle */}
                    <circle cx="30" cy="30" r="30" fill="url(#widgetGradient)" />
                    {/* Chat Icon */}
                    <text x="30" y="38" fontSize="20" textAnchor="middle" fill="white" fontFamily="system-ui">💬</text>
                  </g>
                  
                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="widgetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity="1" />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Floating Widget Indicator */}
                <div className="absolute bottom-8 right-8 bg-white rounded-lg px-3 py-2 shadow-lg border border-gray-200 animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-semibold text-gray-700">Widget Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need</h2>
            <p className="text-xl text-gray-600">Powerful features to collect and manage feedback</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Setup in Seconds</h3>
              <p className="text-gray-600">Just copy one line of code and paste it into your website. No complex configuration needed.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Beautiful Widget</h3>
              <p className="text-gray-600">Modern, customizable design that matches your brand and provides a great user experience.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Notifications</h3>
              <p className="text-gray-600">Get notified instantly when someone submits feedback. Never miss important messages.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Simple Dashboard</h3>
              <p className="text-gray-600">View all feedback in one place. Organize, search, and manage everything effortlessly.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customizable</h3>
              <p className="text-gray-600">Match your brand with custom colors, styles, and remove branding with Pro plan.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Affordable</h3>
              <p className="text-gray-600">Free forever for basic features, or upgrade to Pro for just €9/month for advanced features.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Copy Embed Code</h3>
              <p className="text-gray-600">Get your unique embed code from the dashboard</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Paste in Your Website</h3>
              <p className="text-gray-600">Add the script tag to your HTML, anywhere on your page</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Receiving Feedback</h3>
              <p className="text-gray-600">Your widget is live! Start collecting feedback immediately</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that works for you</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">€0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Feedback widget</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Email notifications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Dashboard access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">"Powered by QuickFeedback" branding</span>
                </li>
              </ul>
              <Link
                href="/dashboard"
                className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-xl transition-all relative">
              <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">€9</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Everything in Free</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Remove branding</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Analytics (coming soon)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Priority support</span>
                </li>
              </ul>
              <a
                href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Upgrade to Pro
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to get started?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of websites using QuickFeedback</p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">© 2025 QuickFeedback. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/dashboard" className="text-sm hover:text-white transition-colors">
                Dashboard
              </Link>
              <a href="#" className="text-sm hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
