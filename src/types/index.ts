export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  projects: Project[];
}

export interface Project {
  id: string;
  customerId: string;
  name: string;
  type: 'On-Grid' | 'Off-Grid';
  status: 'Pending' | 'Started' | 'Completed' | 'Hold';
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  package: Package;
  quotation: Quotation;
  payments: Payment[];
  createdAt: string;
  completedAt?: string;
}

export interface Package {
  id: string;
  name: string;
  type: 'On-Grid' | 'Off-Grid';
  capacity: string;
  components: Component[];
  totalPrice: number;
}

export interface Component {
  id: string;
  type: 'Inverter' | 'Panel' | 'Battery' | 'Mounting' | 'Other';
  brand: string;
  model: string;
  quantity: number;
  price: number;
  warranty: string;
}

export interface Quotation {
  id: string;
  projectId: string;
  validUntil: string;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired';
  createdAt: string;
}

export interface Payment {
  id: string;
  projectId: string;
  stage: 'Booking' | 'Package Reservation' | 'Package Delivery' | 'Completion';
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  dueDate: string;
  paidAt?: string;
  receipt?: string;
}

export interface Service {
  id: string;
  projectId: string;
  customerId: string;
  type: 'Maintenance' | 'Repair' | 'Warranty' | 'Inspection';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  scheduledDate: string;
  completedAt?: string;
  technician: string;
  notes: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SuperAdmin' | 'Admin' | 'Salesmen';
  avatar?: string;
}

export interface DashboardStats {
  activeProjects: number;
  pendingQuotations: number;
  completedInstallations: number;
  upcomingServices: number;
  totalRevenue: number;
  monthlyGrowth: number;
}