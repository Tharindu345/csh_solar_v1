import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Receipt, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { useObservable } from '../../hooks/useObservable';
import { paymentService } from '../../services/PaymentService';
import { projectService } from '../../services/ProjectService';
import { customerService } from '../../services/CustomerService';

const Payments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');

  const payments = useObservable(paymentService.items, []);
  const projects = useObservable(projectService.items, []);
  const customers = useObservable(customerService.items, []);
  const loading = useObservable(paymentService.loading, false);
  const error = useObservable(paymentService.error, null);

  // Get payment totals
  const paymentTotals = useObservable(
    paymentService.getTotalsByStatus(),
    { paid: 0, pending: 0, overdue: 0 }
  );

  // Create filtered payments with details
  const paymentsWithDetails = useObservable(
    combineLatest([
      paymentService.items,
      projectService.items,
      customerService.items
    ]).pipe(
      map(([payments, projects, customers]) => {
        return payments.map(payment => {
          const project = projects.find(p => p.id === payment.projectId);
          const customer = customers.find(c => c.id === project?.customerId);
          return {
            ...payment,
            projectName: project?.name || 'Unknown Project',
            customerName: customer?.name || 'Unknown Customer',
          };
        }).filter(payment => {
          const matchesSearch = payment.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               payment.customerName.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = statusFilter === 'All' || payment.status === statusFilter;
          const matchesStage = stageFilter === 'All' || payment.stage === stageFilter;
          return matchesSearch && matchesStatus && matchesStage;
        });
      })
    ),
    []
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Booking':
        return <CreditCard className="w-4 h-4" />;
      case 'Package Reservation':
        return <Receipt className="w-4 h-4" />;
      case 'Package Delivery':
        return <Clock className="w-4 h-4" />;
      case 'Completion':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  // Update filtered results when search or filter changes
  useEffect(() => {
    // This will trigger the paymentsWithDetails observable to update
  }, [searchTerm, statusFilter, stageFilter]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading payments: {error}</p>
        <button 
          onClick={() => paymentService.loadAll().subscribe()}
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
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Track and manage project payments</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">${paymentTotals.paid.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl md:text-2xl font-bold text-yellow-600">${paymentTotals.pending.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-xl md:text-2xl font-bold text-red-600">${paymentTotals.overdue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <Receipt className="w-6 h-6 text-red-600" />
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
              placeholder="Search payments..."
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
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="All">All Stages</option>
              <option value="Booking">Booking</option>
              <option value="Package Reservation">Package Reservation</option>
              <option value="Package Delivery">Package Delivery</option>
              <option value="Completion">Completion</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading payments...</p>
        </div>
      )}

      {/* Payment List */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Customer
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Stage
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentsWithDetails.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.projectName}</div>
                        <div className="text-sm text-gray-500">#{payment.id}</div>
                        <div className="text-sm text-gray-500 sm:hidden">{payment.customerName}</div>
                        <div className="text-sm text-gray-500 md:hidden">{payment.stage}</div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-900">{payment.customerName}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center space-x-2">
                        {getStageIcon(payment.stage)}
                        <span className="text-sm text-gray-900">{payment.stage}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${payment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm text-gray-900">{payment.dueDate}</div>
                      {payment.paidAt && (
                        <div className="text-sm text-green-600">Paid on {payment.paidAt}</div>
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

export default Payments;