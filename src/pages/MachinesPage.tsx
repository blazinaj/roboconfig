import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import MachineForm from '../components/MachineForm/MachineForm';
import MachineCard from '../components/MachineCard';
import { Machine, MachineType, MachineStatus } from '../types';
import { useMachines } from '../hooks/useMachines';
import { Plus, Search, Filter, AlertTriangle, Loader2, ChevronDown, ChevronUp, Grid, List } from 'lucide-react';
import MachineListItem from '../features/machines/components/MachineListItem';

const MachinesPage: React.FC = () => {
  const navigate = useNavigate();
  const { machines, loading, error, addMachine } = useMachines();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MachineStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<MachineType | 'All'>('All');
  const [maintenanceFilter, setMaintenanceFilter] = useState<'all' | 'due' | 'overdue'>('all');
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         machine.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || machine.status === statusFilter;
    const matchesType = typeFilter === 'All' || machine.type === typeFilter;
    
    let matchesMaintenance = true;
    if (maintenanceFilter !== 'all' && machine.maintenanceSchedule) {
      const now = new Date();
      const nextDue = new Date(machine.maintenanceSchedule.nextDue);
      const daysUntilDue = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (maintenanceFilter === 'due') {
        matchesMaintenance = daysUntilDue <= 7 && daysUntilDue >= 0;
      } else if (maintenanceFilter === 'overdue') {
        matchesMaintenance = daysUntilDue < 0;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesMaintenance;
  });

  const handleCreateMachine = async (machineData: Partial<Machine>) => {
    try {
      setCreateError(null);
      const newMachineId = await addMachine(machineData as Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>);
      setShowForm(false);
      
      // Navigate to the new machine details page
      if (newMachineId) {
        navigate(`/machines/${newMachineId}`);
      }
    } catch (err) {
      console.error('Failed to create machine:', err);
      setCreateError(err instanceof Error ? err.message : 'Failed to create machine');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-600 mb-2">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Machines</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Machines</h1>
            <p className="text-gray-600">Manage and monitor your robotic systems</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* View mode toggle */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                title="Grid View"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                title="List View"
              >
                <List size={20} />
              </button>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              New Machine
            </button>
          </div>
        </div>

        {createError && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-start">
            <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Failed to create machine:</p>
              <p className="text-sm">{createError}</p>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search machines..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-100 sm:hidden transition-colors"
          >
            <div className="flex items-center">
              <Filter size={18} className="mr-2" />
              Filters
            </div>
            {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${showFilters ? 'block' : 'hidden sm:grid'}`}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MachineStatus | 'All')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Error">Error</option>
              <option value="Offline">Offline</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as MachineType | 'All')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Industrial Robot">Industrial Robot</option>
              <option value="Collaborative Robot">Collaborative Robot</option>
              <option value="Mobile Robot">Mobile Robot</option>
              <option value="Autonomous Vehicle">Autonomous Vehicle</option>
              <option value="Drone">Drone</option>
              <option value="Custom">Custom</option>
            </select>

            <select
              value={maintenanceFilter}
              onChange={(e) => setMaintenanceFilter(e.target.value as 'all' | 'due' | 'overdue')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Maintenance</option>
              <option value="due">Due Soon</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMachines.map(machine => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMachines.map(machine => (
              <MachineListItem key={machine.id} machine={machine} />
            ))}
          </div>
        )}

        {filteredMachines.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg mt-6">
            <div className="text-gray-400 mb-3">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No machines found</h3>
            <p className="text-sm text-gray-500 mb-4">
              Try adjusting your search filters or add a new machine.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus size={18} className="inline mr-2" />
              Add New Machine
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <MachineForm
          onSubmit={handleCreateMachine}
          onCancel={() => setShowForm(false)}
        />
      )}
    </MainLayout>
  );
};

export default MachinesPage;