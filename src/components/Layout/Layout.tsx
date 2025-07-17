import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from '../Dashboard/Dashboard';
import Customers from '../Customers/Customers';
import Projects from '../Projects/Projects';
import Quotations from '../Quotations/Quotations';
import Payments from '../Payments/Payments';
import Services from '../Services/Services';
import Admin from '../Admin/Admin';
import { mockUsers } from '../../data/mockData';

const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentUser = mockUsers[0]; // Using first user as current user

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <Customers />;
      case 'projects':
        return <Projects />;
      case 'quotations':
        return <Quotations />;
      case 'payments':
        return <Payments />;
      case 'services':
        return <Services />;
      case 'admin':
        return <Admin />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={currentUser.role}
        isMobileMenuOpen={isMobileMenuOpen}
        onMenuClose={handleMenuClose}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentUser={currentUser} 
          onMenuToggle={handleMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Layout;