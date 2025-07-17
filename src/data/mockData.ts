import { Customer, Project, Package, Component, Payment, Service, User, DashboardStats } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'john@cshsolar.com',
    role: 'SuperAdmin',
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'sarah@cshsolar.com',
    role: 'Admin',
  },
  {
    id: '3',
    name: 'Mike Sales',
    email: 'mike@cshsolar.com',
    role: 'Salesmen',
  },
];

export const mockComponents: Component[] = [
  {
    id: '1',
    type: 'Inverter',
    brand: 'SMA',
    model: 'Sunny Boy 5.0',
    quantity: 1,
    price: 1200,
    warranty: '10 years',
  },
  {
    id: '2',
    type: 'Panel',
    brand: 'Canadian Solar',
    model: 'CS3W-400P',
    quantity: 12,
    price: 250,
    warranty: '25 years',
  },
  {
    id: '3',
    type: 'Battery',
    brand: 'Tesla',
    model: 'Powerwall 2',
    quantity: 1,
    price: 7000,
    warranty: '10 years',
  },
];

export const mockPackages: Package[] = [
  {
    id: '1',
    name: 'Residential On-Grid 5kW',
    type: 'On-Grid',
    capacity: '5kW',
    components: mockComponents.slice(0, 2),
    totalPrice: 4200,
  },
  {
    id: '2',
    name: 'Residential Off-Grid 5kW',
    type: 'Off-Grid',
    capacity: '5kW',
    components: mockComponents,
    totalPrice: 11200,
  },
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Robert Johnson',
    email: 'robert@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, USA',
    status: 'Active',
    createdAt: '2024-01-15',
    projects: [],
  },
  {
    id: '2',
    name: 'Emily Davis',
    email: 'emily@email.com',
    phone: '+1 (555) 987-6543',
    address: '456 Oak Ave, Somewhere, USA',
    status: 'Active',
    createdAt: '2024-01-20',
    projects: [],
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael@email.com',
    phone: '+1 (555) 456-7890',
    address: '789 Pine Rd, Anywhere, USA',
    status: 'Inactive',
    createdAt: '2024-01-10',
    projects: [],
  },
];

export const mockProjects: Project[] = [
  {
    id: '1',
    customerId: '1',
    name: 'Johnson Residence Solar Installation',
    type: 'On-Grid',
    status: 'Started',
    location: {
      address: '123 Main St, Anytown, USA',
      coordinates: { lat: 40.7128, lng: -74.0060 },
    },
    package: mockPackages[0],
    quotation: {
      id: '1',
      projectId: '1',
      validUntil: '2024-02-15',
      totalAmount: 4200,
      status: 'Approved',
      createdAt: '2024-01-15',
    },
    payments: [],
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    customerId: '2',
    name: 'Davis Home Off-Grid System',
    type: 'Off-Grid',
    status: 'Pending',
    location: {
      address: '456 Oak Ave, Somewhere, USA',
      coordinates: { lat: 40.7589, lng: -73.9851 },
    },
    package: mockPackages[1],
    quotation: {
      id: '2',
      projectId: '2',
      validUntil: '2024-02-20',
      totalAmount: 11200,
      status: 'Sent',
      createdAt: '2024-01-20',
    },
    payments: [],
    createdAt: '2024-01-20',
  },
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    projectId: '1',
    stage: 'Booking',
    amount: 1050,
    status: 'Paid',
    dueDate: '2024-01-20',
    paidAt: '2024-01-18',
    receipt: 'REC-001',
  },
  {
    id: '2',
    projectId: '1',
    stage: 'Package Reservation',
    amount: 1260,
    status: 'Paid',
    dueDate: '2024-01-25',
    paidAt: '2024-01-24',
    receipt: 'REC-002',
  },
  {
    id: '3',
    projectId: '1',
    stage: 'Package Delivery',
    amount: 1260,
    status: 'Pending',
    dueDate: '2024-02-10',
  },
  {
    id: '4',
    projectId: '1',
    stage: 'Completion',
    amount: 630,
    status: 'Pending',
    dueDate: '2024-02-20',
  },
];

export const mockServices: Service[] = [
  {
    id: '1',
    projectId: '1',
    customerId: '1',
    type: 'Maintenance',
    status: 'Scheduled',
    scheduledDate: '2024-02-15',
    technician: 'Tech Team A',
    notes: 'Routine maintenance check',
  },
  {
    id: '2',
    projectId: '1',
    customerId: '1',
    type: 'Inspection',
    status: 'Completed',
    scheduledDate: '2024-01-30',
    completedAt: '2024-01-30',
    technician: 'Tech Team B',
    notes: 'Pre-installation inspection completed',
  },
];

export const mockStats: DashboardStats = {
  activeProjects: 12,
  pendingQuotations: 8,
  completedInstallations: 45,
  upcomingServices: 6,
  totalRevenue: 250000,
  monthlyGrowth: 15.2,
};