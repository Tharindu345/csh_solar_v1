import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { useObservable } from '../../hooks/useObservable';
import { serviceService } from '../../services/ServiceService';
import { projectService } from '../../services/ProjectService';
import { customerService } from '../../services/CustomerService';

const Services: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const services = useObservable(serviceService.items, []);
  const projects = useObservable(projectService.items, []);
  const customers = useObservable(customerService.items, []);
  const loading = useObservable(serviceService.loading, false);
  const error = useObservable(serviceService.error, null);

  // Get service counts
  const serviceCounts = useObservable(
    serviceService.getServiceCounts(),
    { scheduled: 0, inProgress: 0, completed: 0 }
  );

  // Create filtered services with details
  const servicesWithDetails = useObservable(
    combineLatest([
      serviceService.items,
      projectService.items,
      customerService.items
    ]).pipe(
      map(([services, projects, customers]) => {
        return services.map(service => {
          const project = projects.find(p => p.id === service.projectId);
          const customer = customers.find(c => c.id === service.customerId);
          return {
            ...service,
            projectName: project?.name || 'Unknown Project',
            customerName: customer?.name || 'Unknown Customer',
          };
        }).filter(service => {
          const matchesSearch = service.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               service.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               service.technician.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = statusFilter === 'All' || service.status === statusFilter;
          const matchesType = typeFilter === 'All' || service.type === typeFilter;
          return matchesSearch && matchesStatus && matchesType;
        });
      })
    ),
    []
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Maintenance':
        return <CheckCircle className="w-4 h-4" />;
      case 'Repair':
        return <AlertCircle className="w-4 h-4" />;
      case 'Warranty':
        return <Calendar className="w-4 h-4" />;
      case 'Inspection':
        return <User className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  // Update filtered results when search or filter changes
  useEffect(() => {
    // This will trigger the servicesWithDetails observable to update
  }, [searchTerm, statusFilter, typeFilter]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading services: {error}</p>
        <button 
          onClick={() => serviceService.loadAll().subscribe()}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-600">Manage maintenance and service requests</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Schedule Service</span>
        </button>
      </div>

      {/* Service Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Services</p>
              <p className="text-xl md:text-2xl font-bold text-yellow-600">{serviceCounts.scheduled}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600">{serviceCounts.inProgress}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">{serviceCounts.completed}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              >
                <option value="All">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="All">All Types</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Repair">Repair</option>
              <option value="Warranty">Warranty</option>
              <option value="Inspection">Inspection</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading services...</p>
        </div>
      </div>

      {/* Service List */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Details
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Customer
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Technician
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Scheduled Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {servicesWithDetails.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{service.projectName}</div>
                        <div className="text-sm text-gray-500">#{service.id}</div>
                        <div className="text-sm text-gray-500 sm:hidden">{service.customerName}</div>
                        <div className="text-sm text-gray-500 md:hidden">{service.technician}</div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-900">{service.customerName}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(service.type)}
                        <span className="text-sm text-gray-900">{service.type}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">{service.technician}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm text-gray-900">{service.scheduledDate}</div>
                      {service.completedAt && (
                        <div className="text-sm text-green-600">Completed on {service.completedAt}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;