import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { useObservable } from '../../hooks/useObservable';
import { projectService } from '../../services/ProjectService';
import { customerService } from '../../services/CustomerService';
import { Project } from '../../types';
import ProjectForm from './ProjectForm';

const Projects: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const projects = useObservable<Project[]>(projectService.items, []);
  const customers = useObservable(customerService.items, []);
  const loading = useObservable<boolean>(projectService.loading, false);
  const error = useObservable<string | null>(projectService.error, null);

  // Create filtered projects observable
  const filteredProjects = useObservable<Project[]>(
    combineLatest([
      projectService.items,
      customerService.items
    ]).pipe(
      map(([projects, customers]) => {
        return projects.filter(project => {
          const customer = customers.find(c => c.id === project.customerId);
          const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
          const matchesType = typeFilter === 'All' || project.type === typeFilter;
          return matchesSearch && matchesStatus && matchesType;
        });
      })
    ),
    []
  );

  const handleAddProject = (projectData: any) => {
    projectService.create(projectData).subscribe({
      next: () => {
        setShowForm(false);
      },
      error: (error) => {
        console.error('Error creating project:', error);
      }
    });
  };

  const handleEditProject = (projectId: string) => {
    setEditingProject(projectId);
    setShowForm(true);
  };

  const handleUpdateProject = (projectData: any) => {
    if (editingProject) {
      projectService.update(editingProject, projectData).subscribe({
        next: () => {
          setShowForm(false);
          setEditingProject(null);
        },
        error: (error) => {
          console.error('Error updating project:', error);
        }
      });
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      projectService.delete(projectId).subscribe({
        next: () => {
          console.log('Project deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting project:', error);
        }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Started':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Update filtered results when search or filter changes
  useEffect(() => {
    // This will trigger the filteredProjects observable to update
  }, [searchTerm, statusFilter, typeFilter]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading projects: {error}</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600">Manage solar installation projects</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
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
                <option value="Pending">Pending</option>
                <option value="Started">Started</option>
                <option value="Completed">Completed</option>
                <option value="Hold">Hold</option>
              </select>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="All">All Types</option>
              <option value="On-Grid">On-Grid</option>
              <option value="Off-Grid">Off-Grid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading projects...</p>
        </div>
      )}

      {/* Project Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProjects.map((project) => {
            const customer = customers.find(c => c.id === project.customerId);
            return (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 line-clamp-2">{project.name}</h3>
                      <p className="text-sm text-gray-500">{customer?.name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">{project.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Capacity:</span>
                      <span className="font-medium">{project.package.capacity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Value:</span>
                      <span className="font-medium">${project.package.totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">{project.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button 
                      onClick={() => handleEditProject(project.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteProject(project.id)}
                      className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Form Modal */}
      {showForm && (
        <ProjectForm
          project={editingProject ? projects.find(p => p.id === editingProject) : undefined}
          onSubmit={editingProject ? handleUpdateProject : handleAddProject}
          onClose={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
};

export default Projects;