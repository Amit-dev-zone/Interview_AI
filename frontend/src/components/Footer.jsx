import React from 'react'
import { Sparkles, Heart } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-links">
        <a href="#features">Features</a>
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
        <a href="#docs">Documentation</a>
        <a href="#contact">Contact Support</a>
      </div>
      <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
        <span>&copy; {new Date().getFullYear()} GenAI Master. Built with</span>
        <Heart size={14} color="#f43f5e" fill="#f43f5e" />
        <span>for Next-Gen Engineers.</span>
      </p>
    </footer>
  );
};

export default Footer;
