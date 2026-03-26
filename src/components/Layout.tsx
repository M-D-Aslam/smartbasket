import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from './Navigation';
import { Toaster } from 'sonner';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-center" richColors duration={1000} />
    </div>
  );
};
