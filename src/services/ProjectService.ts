import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BaseService } from './BaseService';
import { Project } from '../types';
import { mockProjects } from '../data/mockData';

class ProjectService extends BaseService<Project> {
  constructor() {
    super();
    // Initialize with mock data
    this.loadAll().subscribe();
  }

  loadAll(): Observable<Project[]> {
    return this.simulateApiCall(mockProjects).pipe(
      map(response => response.data),
      switchMap(projects => {
        this.setItems(projects);
        return of(projects);
      })
    );
  }

  create(projectData: Omit<Project, 'id'>): Observable<Project> {
    const newProject: Project = {
      id: Date.now().toString(),
      ...projectData,
      createdAt: new Date().toISOString().split('T')[0],
    };

    return this.simulateApiCall(newProject).pipe(
      map(response => response.data),
      switchMap(project => {
        const currentItems = this.getCurrentItems();
        this.setItems([...currentItems, project]);
        return of(project);
      })
    );
  }

  update(id: string, projectData: Partial<Project>): Observable<Project> {
    const currentItems = this.getCurrentItems();
    const existingProject = currentItems.find(p => p.id === id);
    
    if (!existingProject) {
      throw new Error('Project not found');
    }

    const updatedProject: Project = {
      ...existingProject,
      ...projectData,
    };

    return this.simulateApiCall(updatedProject).pipe(
      map(response => response.data),
      switchMap(project => {
        const updatedItems = currentItems.map(p => p.id === id ? project : p);
        this.setItems(updatedItems);
        return of(project);
      })
    );
  }

  delete(id: string): Observable<boolean> {
    return this.simulateApiCall(true).pipe(
      map(response => response.data),
      switchMap(success => {
        if (success) {
          const currentItems = this.getCurrentItems();
          const filteredItems = currentItems.filter(p => p.id !== id);
          this.setItems(filteredItems);
        }
        return of(success);
      })
    );
  }

  getProjectsByCustomer(customerId: string): Observable<Project[]> {
    return this.items.pipe(
      map(projects => projects.filter(project => project.customerId === customerId))
    );
  }

  searchProjects(searchTerm: string): Observable<Project[]> {
    return this.items.pipe(
      map(projects => 
        projects.filter(project =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }

  filterByStatus(status: string): Observable<Project[]> {
    return this.items.pipe(
      map(projects => 
        status === 'All' 
          ? projects 
          : projects.filter(project => project.status === status)
      )
    );
  }

  filterByType(type: string): Observable<Project[]> {
    return this.items.pipe(
      map(projects => 
        type === 'All' 
          ? projects 
          : projects.filter(project => project.type === type)
      )
    );
  }
}

export const projectService = new ProjectService();