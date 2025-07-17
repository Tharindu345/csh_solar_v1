import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { useObservable } from '../../hooks/useObservable';
import { customerService } from '../../services/CustomerService';
import { Customer } from '../../types';
import CustomerForm from './CustomerForm';

const Customers: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const customers = useObservable<Customer[]>(customerService.items, []);
  const loading = useObservable<boolean>(customerService.loading, false);
  const error = useObservable<string | null>(customerService.error, null);

  // Create filtered customers observable
  const filteredCustomers = useObservable<Customer[]>(
    combineLatest([
      customerService.items,
      // Create observables for search and filter
      new Promise(resolve => resolve(searchTerm)).then(() => searchTerm),
      new Promise(resolve => resolve(statusFilter)).then(() => statusFilter)
    ]).pipe(
      map(([customers, search, status]) => {
        return customers.filter(customer => {
          const matchesSearch = customer.name.toLowerCase().includes(search.toLowerCase()) ||
                               customer.email.toLowerCase().includes(search.toLowerCase());
          const matchesStatus = status === 'All' || customer.status === status;
          return matchesSearch && matchesStatus;
        });
      })
    ),
    []
  );

  const handleAddCustomer = (customerData: any) => {
    customerService.create(customerData).subscribe({
      next: () => {
        setShowForm(false);
      },
      error: (error) => {
        console.error('Error creating customer:', error);
      }
    });
  };

  const handleEditCustomer = (customerId: string) => {
    setEditingCustomer(customerId);
    setShowForm(true);
  };

  const handleUpdateCustomer = (customerData: any) => {
    if (editingCustomer) {
      customerService.update(editingCustomer, customerData).subscribe({
        next: () => {
          setShowForm(false);
          setEditingCustomer(null);
        },
        error: (error) => {
          console.error('Error updating customer:', error);
        }
      });
    }
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      customerService.delete(customerId).subscribe({
        next: () => {
          console.log('Customer deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting customer:', error);
        }
      });
    }
  };

  // Update filtered results when search or filter changes
  useEffect(() => {
    // This will trigger the filteredCustomers observable to update
  }, [searchTerm, statusFilter]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading customers: {error}</p>
        <button 
          onClick={() => customerService.loadAll().subscribe()}
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
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading customers...</p>
        </div>
      )}

      {/* Customer List */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Contact
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Created
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500 sm:hidden">{customer.email}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{customer.address}</div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {customer.createdAt}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditCustomer(customer.id)}
                          className="text-green-600 hover:text-green-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerForm
          customer={editingCustomer ? customers.find(c => c.id === editingCustomer) : undefined}
          onSubmit={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
        />
      )}
    </div>
  );
};

export default Customers;