import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-6 bg-gray-800 shadow-md">
      <h1 className="text-2xl font-bold text-blue-400">Vizhuchelvam</h1>
      <div className="space-x-4">
        <Link to="/login" className="hover:text-blue-400">Login</Link>
        <Link to="/register-teacher" className="hover:text-blue-400">Teacher Registration</Link>
        <Link to="/register-student" className="hover:text-blue-400">Student Registration</Link>
      </div>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="text-center py-6 bg-gray-800 text-gray-400">
      <p>&copy; {new Date().getFullYear()} Vizhuchelvam. All rights reserved.</p>
    </footer>
  );
};

const FeatureCard = ({ title, desc }) => (
  <div className="bg-gray-700 p-6 rounded-md text-center">
    <h4 className="text-xl font-semibold text-blue-400">{title}</h4>
    <p className="text-gray-300 mt-2">{desc}</p>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <header className="text-center py-24 px-6">
        <h2 className="text-5xl font-bold">Empowering Education, Elevating Futures</h2>
        <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
          A platform designed for seamless learning, teaching, and administration.
        </p>
        <div className="mt-6 space-x-4">
          <Link to="/login" className="bg-blue-500 px-6 py-3 rounded-md hover:bg-blue-600">Login</Link>
          <Link to="/register-student" className="border border-blue-500 px-6 py-3 rounded-md hover:bg-blue-500 hover:text-white">Get Started</Link>
        </div>
      </header>

      {/* About Section */}
      <section className="py-16 px-6 text-center bg-gray-800">
        <h3 className="text-3xl font-semibold text-blue-400">Why Vizhuchelvam?</h3>
        <p className="text-gray-300 mt-4 max-w-xl mx-auto">
          A comprehensive platform for students, teachers, and administrators to streamline learning and management.
        </p>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 grid grid-cols-1 md-grid-cols-3 gap-6 max-w-5xl mx-auto">
        <FeatureCard title="Student Dashboard" desc="Personalized learning experience" />
        <FeatureCard title="Teacher Portal" desc="Manage classes & materials efficiently" />
        <FeatureCard title="Admin Panel" desc="Seamless control over platform activities" />
      </section>
      
      {/* CTA Section */}
      <section className="text-center py-16 px-6 bg-blue-600">
        <h3 className="text-3xl font-semibold">Join Vizhuchelvam Today!</h3>
        <p className="text-gray-200 mt-4">Start your journey with a seamless learning experience.</p>
        <div className="mt-6 space-x-4">
          <Link to="/register-student" className="bg-white text-blue-600 px-6 py-3 rounded-md hover:bg-gray-200">Join as Student</Link>
          <Link to="/register-teacher" className="bg-white text-blue-600 px-6 py-3 rounded-md hover:bg-gray-200">Join as Teacher</Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
