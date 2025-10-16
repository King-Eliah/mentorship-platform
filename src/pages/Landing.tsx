import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
            <span className="text-white dark:text-gray-900 font-bold">M</span>
          </div>
          <span className="text-xl font-semibold text-gray-900 dark:text-white">MentorConnect</span>
        </div>
        <div className="space-x-3">
          <Link to="/login"><Button variant="ghost">Log in</Button></Link>
          <Link to="/signup"><Button>Get started</Button></Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Grow faster with structured mentorship
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              A complete platform for coordinating mentor-mentee relationships, tracking sessions, sharing resources, and hosting events—built for teams and communities.
            </p>
            <div className="mt-8 flex items-center space-x-3">
              <Link to="/signup"><Button size="lg">Create account</Button></Link>
              <Link to="/login"><Button size="lg" variant="outline">I already have an account</Button></Link>
            </div>
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              No credit card required. Free to start.
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=1600&auto=format&fit=crop"
                alt="Mentorship"
                className="w-full h-[360px] object-cover"
              />
            </div>
            <div className="hidden md:block absolute -bottom-6 -left-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-lg">
              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">Plan sessions, match mentors, host events</p>
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'User Management', desc: 'Manage users, roles, and permissions efficiently.' },
            { title: 'Groups & Messaging', desc: 'Keep everyone aligned with groups and chat.' },
            { title: 'Events & Resources', desc: 'Run workshops and share learning materials.' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Landing;
