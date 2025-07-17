import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Send, Eye, Edit } from 'lucide-react';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { useObservable } from '../../hooks/useObservable';
import { projectService } from '../../services/ProjectService';
import { customerService } from '../../services/CustomerService';

const Quotations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const projects = useObservable(projectService.items, []);
  const customers = useObservable(customerService.items, []);
  const loading = useObservable(projectService.loading, false);
  const error = useObservable(projectService.error, null);

  // Create quotations from projects
  const quotations = useObservable(
    combineLatest([
      projectService.items,
      customerService.items
    ]).pipe(
      map(([projects, customers]) => {
        return projects.map(project => ({
          ...project.quotation,
          projectName: project.name,
          customerName: customers.find(c => c.id === project.customerId)?.name || 'Unknown',
          project,
        })).filter(quotation => {
          const matchesSearch = quotation.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = statusFilter === 'All' || quotation.status === statusFilter;
          return matchesSearch && matchesStatus;
        });
      })
    ),
    []
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Sent':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (validUntil: string) => {
    const today = new Date();
    const validDate = new Date(validUntil);
    const diffTime = validDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Update filtered results when search or filter changes
  useEffect(() => {
    // This will trigger the quotations observable to update
  }, [searchTerm, statusFilter]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading quotations: {error}</p>
        <button 
          onClick={() => projectService.loadAll().subscribe()}
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
          <h1 className="text-2xl font-bold text-gray-900">Quotation Management</h1>
          <p className="text-gray-600">Manage project quotations and pricing</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search quotations..."
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
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading quotations...</p>
        </div>
      )}

      {/* Quotation List */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quotation Details
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Customer
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Validity
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotations.map((quotation) => {
                  const daysRemaining = getDaysRemaining(quotation.validUntil);
                  return (
                    <tr key={quotation.id} className="hover:bg-gray-50">
                      <td className="px-4 md:px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{quotation.projectName}</div>
                          <div className="text-sm text-gray-500">#{quotation.id}</div>
                          <div className="text-sm text-gray-500 sm:hidden">{quotation.customerName}</div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm text-gray-900">{quotation.customerName}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${quotation.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">{quotation.project.package.capacity}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quotation.status)}`}>
                          {quotation.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-900">{quotation.validUntil}</div>
                        <div className={`text-sm ${daysRemaining < 0 ? 'text-red-600' : daysRemaining <= 1 ? 'text-orange-600' : 'text-gray-500'}`}>
                          {daysRemaining < 0 ? 'Expired' : daysRemaining === 0 ? 'Expires today' : `${daysRemaining} days left`}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 p-1">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-900 p-1 hidden sm:inline-block">
                            <Send className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 p-1 hidden sm:inline-block">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotations;