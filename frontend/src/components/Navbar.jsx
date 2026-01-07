import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import './navbar.css';
/* eslint-disable-next-line no-unused-vars */
import { motion } from 'framer-motion';

const Navbar = ({ setView }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo/Brand */}
        <a onClick={(e) => { e.preventDefault(); setView('home'); }} href="/" className="navbar-brand">
          <Sparkles className="brand-icon" />
          <span className="brand-text">CV Analisis</span>
        </a>

        {/* Actions */}
        <div className="navbar-actions">

          <button onClick={() => setView('get-started')} className="nav-btn nav-btn-primary">Get Started</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
