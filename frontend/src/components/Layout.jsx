import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import AmbientBackground from './AmbientBackground'

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <AmbientBackground />
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
