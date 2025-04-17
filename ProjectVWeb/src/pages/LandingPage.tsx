import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-6 bg-gray-800 shadow-md">
      <h1 className="text-2xl font-bold text-blue-400">Vizhuchelvam</h1>
      <div className="space-x-4">
        <Link
          to="/login"
          className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
        >
          Login
        </Link>
        <Link
          to="/register-teacher"
          className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
        >
          Teacher Registration
        </Link>
        <Link
          to="/register-student"
          className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
        >
          Student Registration
        </Link>
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
  <div className="bg-gray-700 p-6 rounded-lg text-center shadow-lg transform transition-transform duration-300 hover:scale-105">
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
      <header className="text-center py-24 px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
        <h2 className="text-5xl md:text-6xl font-bold text-white">
          Empowering Education, Elevating Futures
        </h2>
        <p className="text-gray-200 mt-4 max-w-2xl mx-auto">
          A platform designed for seamless learning, teaching, and administration.
        </p>
        <div className="mt-8 space-x-4">
          <Link
            to="/login"
            className="inline-block px-6 py-3 font-medium text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </Link>
          <Link
            to="/register-student"
            className="inline-block px-6 py-3 font-medium text-white bg-indigo-600 rounded-md shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* About Section */}
      <section className="py-16 px-6 text-center bg-gray-800">
        <h3 className="text-3xl font-semibold text-blue-400">
          Why Vizhuchelvam?
        </h3>
        <p className="text-gray-300 mt-4 max-w-xl mx-auto">
          A comprehensive platform for students, teachers, and administrators to
          streamline learning and management.
        </p>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <FeatureCard
          title="Student Dashboard"
          desc="Personalized learning experience tailored for every student."
        />
        <FeatureCard
          title="Teacher Portal"
          desc="Efficient tools to manage classes, assignments, and materials."
        />
        <FeatureCard
          title="Admin Panel"
          desc="Complete control over platform activities and user management."
        />
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
        <h3 className="text-3xl font-semibold text-white">
          Join Vizhuchelvam Today!
        </h3>
        <p className="text-gray-200 mt-4">
          Start your journey with a seamless learning experience.
        </p>
        <div className="mt-8 space-x-4">
          <Link
            to="/register-student"
            className="bg-white text-indigo-600 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors duration-300"
          >
            Join as Student
          </Link>
          <Link
            to="/register-teacher"
            className="bg-white text-indigo-600 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors duration-300"
          >
            Join as Teacher
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;