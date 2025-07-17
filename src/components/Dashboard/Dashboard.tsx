import React, { useEffect, useState } from 'react';
import { 
  FolderOpen, 
  FileText, 
  CheckCircle, 
  Wrench, 
  DollarSign,
  TrendingUp,
  Activity,
  Calendar
} from 'lucide-react';
import { useObservable } from '../../hooks/useObservable';
import { dashboardService } from '../../services/DashboardService';
import { DashboardStats } from '../../types';

const Dashboard: React.FC = () => {
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: number;
    action: string;
    customer: string;
    time: string;
  }>>([]);

  const stats = useObservable<DashboardStats>(
    dashboardService.getDashboardStats(),
    {
      activeProjects: 0,
      pendingQuotations: 0,
      completedInstallations: 0,
      upcomingServices: 0,
      totalRevenue: 0,
      monthlyGrowth: 0,
    }
  );

  useEffect(() => {
    const subscription = dashboardService.getRecentActivities().subscribe({
      next: setRecentActivities,
      error: (error) => console.error('Error loading recent activities:', error)
    });

    return () => subscription.unsubscribe();
  }, []);

  const statCards = [
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: <FolderOpen className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50',
      change: '+12%',
    },
    {
      title: 'Pending Quotations',
      value: stats.pendingQuotations,
      icon: <FileText className="w-6 h-6 text-orange-600" />,
      color: 'bg-orange-50',
      change: '+8%',
    },
    {
      title: 'Completed Installations',
      value: stats.completedInstallations,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      color: 'bg-green-50',
      change: '+24%',
    },
    {
      title: 'Upcoming Services',
      value: stats.upcomingServices,
      icon: <Wrench className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50',
      change: '+5%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to CSH Solar CMS</h1>
            <p className="text-green-100 text-base md:text-lg">
              Managing your solar projects efficiently and professionally
            </p>
          </div>
          <div className="text-left md:text-right">
            <div className="flex items-center space-x-2 text-xl md:text-2xl font-bold">
              <DollarSign className="w-8 h-8" />
              <span>${stats.totalRevenue.toLocaleString()}</span>
            </div>
            <p className="text-green-100">Total Revenue</p>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+{stats.monthlyGrowth}% this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-green-600 text-white py-2 md:py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm md:text-base">
              Create New Project
            </button>
            <button className="w-full bg-blue-600 text-white py-2 md:py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm md:text-base">
              Generate Quotation
            </button>
            <button className="w-full bg-purple-600 text-white py-2 md:py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm md:text-base">
              Schedule Service
            </button>
            <button className="w-full bg-orange-600 text-white py-2 md:py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm md:text-base">
              Add Customer
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.customer}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Monthly Performance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-600">24</div>
            <p className="text-sm text-gray-600">Projects Started</p>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600">18</div>
            <p className="text-sm text-gray-600">Quotations Sent</p>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-600">12</div>
            <p className="text-sm text-gray-600">Services Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;