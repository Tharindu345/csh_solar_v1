import React from 'react';
import { 
  Home, 
  Users, 
  FolderOpen, 
  FileText, 
  CreditCard, 
  Wrench, 
  Settings,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  isMobileMenuOpen: boolean;
  onMenuClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole, isMobileMenuOpen, onMenuClose }) => {
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      roles: ['SuperAdmin', 'Admin', 'Salesmen'],
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className="w-5 h-5" />,
      roles: ['SuperAdmin', 'Admin', 'Salesmen'],
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderOpen className="w-5 h-5" />,
      roles: ['SuperAdmin', 'Admin', 'Salesmen'],
    },
    {
      id: 'quotations',
      label: 'Quotations',
      icon: <FileText className="w-5 h-5" />,
      roles: ['SuperAdmin', 'Admin', 'Salesmen'],
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCard className="w-5 h-5" />,
      roles: ['SuperAdmin', 'Admin'],
    },
    {
      id: 'services',
      label: 'Services',
      icon: <Wrench className="w-5 h-5" />,
      roles: ['SuperAdmin', 'Admin'],
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: <Settings className="w-5 h-5" />,
      roles: ['SuperAdmin'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  const handleMenuItemClick = (itemId: string) => {
    setActiveTab(itemId);
    onMenuClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMenuClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg h-screen transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <nav className="mt-6">
        <div className="px-4 pb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Navigation
          </h2>
        </div>
        <div className="space-y-1">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
              {activeTab === item.id && (
                <ChevronRight className="w-4 h-4 text-green-600" />
              )}
            </button>
          ))}
        </div>
      </nav>
      </div>
    </>
  );
};

export default Sidebar;