import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../../types';
import { mockProjects } from '../../data/mockData';
import { RootState } from '../index';

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
}

const initialState: ProjectsState = {
  projects: mockProjects,
  loading: false,
  error: null,
  searchTerm: '',
  statusFilter: 'All',
  typeFilter: 'All',
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    addProject: (state, action: PayloadAction<Omit<Project, 'id'>>) => {
      const newProject: Project = {
        id: Date.now().toString(),
        ...action.payload,
        createdAt: new Date().toISOString().split('T')[0],
      };
      state.projects.push(newProject);
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload);
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setTypeFilter: (state, action: PayloadAction<string>) => {
      state.typeFilter = action.payload;
    },
  },
});

// Selectors
export const selectProjectsState = (state: RootState) => state.projects;

export const selectFilteredProjects = createSelector(
  [selectProjectsState, (state: RootState) => state.customers.customers],
  (projectsState, customers) => {
    const { projects, searchTerm, statusFilter, typeFilter } = projectsState;
    
    return projects.filter(project => {
      const customer = customers.find(c => c.id === project.customerId);
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
      const matchesType = typeFilter === 'All' || project.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }
);

export const selectProjectById = createSelector(
  [selectProjectsState, (state: RootState, projectId: string) => projectId],
  (projectsState, projectId) => 
    projectsState.projects.find(project => project.id === projectId)
);

export const selectProjectsByCustomerId = createSelector(
  [selectProjectsState, (state: RootState, customerId: string) => customerId],
  (projectsState, customerId) => 
    projectsState.projects.filter(project => project.customerId === customerId)
);

export const {
  setLoading,
  setError,
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  setSearchTerm,
  setStatusFilter,
  setTypeFilter,
} = projectsSlice.actions;

export default projectsSlice.reducer;