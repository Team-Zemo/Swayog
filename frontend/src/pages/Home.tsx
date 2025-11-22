import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const Home: React.FC = () => {
  const titleRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(titleRef.current, 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
    gsap.fromTo(btnRef.current, 
      { opacity: 0, scale: 0.8 }, 
      { opacity: 1, scale: 1, duration: 0.8, delay: 0.5, ease: "back.out(1.7)" }
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <h1 ref={titleRef} className="text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        YogaFix
      </h1>
      <p className="text-xl mb-8 text-gray-300 max-w-md text-center">
        Perfect your yoga poses with real-time AI feedback.
      </p>
      <div ref={btnRef} className="flex gap-4">
        <Link to="/login" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition-all">
          Get Started
        </Link>
        <Link to="/register" className="px-6 py-3 bg-transparent border border-gray-600 hover:border-gray-400 rounded-full font-semibold transition-all">
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Home;
