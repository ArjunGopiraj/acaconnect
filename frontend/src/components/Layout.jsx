import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ 
  children, 
  showNavigation = true, 
  showLoginButton = false, 
  showOrganizers = false 
}) {
  return (
    <div className="niral-home">
      <Header showNavigation={showNavigation} showLoginButton={showLoginButton} />
      <main style={{ paddingTop: '100px' }}>
        {children}
      </main>
      <Footer showOrganizers={showOrganizers} />
    </div>
  );
}