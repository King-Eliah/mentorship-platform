import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Header - Mobile optimized */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-40 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-900 dark:bg-white flex-shrink-0 flex items-center justify-center">
            <span className="text-white dark:text-gray-900 font-bold text-sm sm:text-base">M</span>
          </div>
          <span className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">MentorConnect</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Link to="/login"><Button variant="ghost" size="sm" className="text-xs sm:text-sm">Log in</Button></Link>
          <Link to="/signup"><Button size="sm" className="text-xs sm:text-sm">Get started</Button></Link>
        </div>
      </header>

      {/* Hero - Mobile optimized */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-center">
          <div className="order-2 lg:order-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              Grow faster with structured mentorship
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300">
              A complete platform for coordinating mentor-mentee relationships, tracking sessions, sharing resources, and hosting events—built for teams and communities.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col xs:flex-row gap-3 sm:gap-4 w-full xs:w-auto">
              <Link to="/signup" className="w-full xs:w-auto"><Button size="lg" className="w-full xs:w-auto">Create account</Button></Link>
              <Link to="/login" className="w-full xs:w-auto"><Button size="lg" variant="outline" className="w-full xs:w-auto">I already have an account</Button></Link>
            </div>
            <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              No credit card required. Free to start.
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="rounded-lg sm:rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg sm:shadow-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=1600&auto=format&fit=crop"
                alt="Mentorship"
                className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
              />
            </div>
            <div className="hidden sm:block absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-lg lg:rounded-xl p-3 lg:p-4 border border-gray-200 dark:border-gray-800 shadow-lg">
              <p className="text-xs lg:text-sm text-gray-800 dark:text-gray-200 font-medium">Plan sessions, match mentors, host events</p>
            </div>
          </div>
        </div>

        {/* Feature grid - Mobile optimized */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { title: 'User Management', desc: 'Manage users, roles, and permissions efficiently.' },
            { title: 'Groups & Messaging', desc: 'Keep everyone aligned with groups and chat.' },
            { title: 'Events & Resources', desc: 'Run workshops and share learning materials.' },
          ].map((f) => (
            <div key={f.title} className="rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Landing;
