import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardStats } from '../types';
import { projectService } from './ProjectService';
import { paymentService } from './PaymentService';
import { serviceService } from './ServiceService';

class DashboardService {
  getDashboardStats(): Observable<DashboardStats> {
    return combineLatest([
      projectService.items,
      paymentService.items,
      serviceService.items
    ]).pipe(
      map(([projects, payments, services]) => {
        const activeProjects = projects.filter(p => p.status === 'Started').length;
        const pendingQuotations = projects.filter(p => p.quotation.status === 'Sent').length;
        const completedInstallations = projects.filter(p => p.status === 'Completed').length;
        const upcomingServices = services.filter(s => s.status === 'Scheduled').length;
        
        const totalRevenue = payments
          .filter(p => p.status === 'Paid')
          .reduce((sum, p) => sum + p.amount, 0);
        
        // Mock monthly growth calculation
        const monthlyGrowth = 15.2;

        return {
          activeProjects,
          pendingQuotations,
          completedInstallations,
          upcomingServices,
          totalRevenue,
          monthlyGrowth
        };
      })
    );
  }

  getRecentActivities(): Observable<Array<{
    id: number;
    action: string;
    customer: string;
    time: string;
  }>> {
    // Mock recent activities - in real app, this would come from an activity log
    return new Observable(observer => {
      const activities = [
        { id: 1, action: 'New quotation generated', customer: 'Robert Johnson', time: '2 hours ago' },
        { id: 2, action: 'Payment received', customer: 'Emily Davis', time: '4 hours ago' },
        { id: 3, action: 'Project completed', customer: 'Michael Brown', time: '1 day ago' },
        { id: 4, action: 'Service scheduled', customer: 'Sarah Wilson', time: '2 days ago' },
      ];
      observer.next(activities);
      observer.complete();
    });
  }
}

export const dashboardService = new DashboardService();