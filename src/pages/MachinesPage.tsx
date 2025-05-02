import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import MachineDetails from '../components/MachineDetails';
import MachineForm from '../components/MachineForm/MachineForm';
import { Machine, MachineType, MachineStatus } from '../types';
import { useMachines } from '../hooks/useMachines';
import { Plus, Search, Filter, Settings, AlertTriangle, CheckCircle, Clock, Power, Calendar, PenTool as Tool, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const MachinesPage: React.FC = () => {
  const { machines, loading, error, addMachine, updateMachine, deleteMachine } = useMachines();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MachineStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<MachineType | 'All'>('All');
  const [maintenanceFilter, setMaintenanceFilter] = useState<'all' | 'due' | 'overdue'>('all');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const getStatusIcon = (status: MachineStatus) => {
    switch (status) {
      case 'Active':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'Inactive':
        return <Power size={16} className="text-gray-500" />;
      case 'Maintenance':
        return <Settings size={16} className="text-blue-500" />;
      case 'Error':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'Offline':
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: MachineStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Maintenance':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMaintenanceStatus = (machine: Machine) => {
    if (!machine.maintenanceSchedule) return null;

    const now = new Date();
    const nextDue = new Date(machine.maintenanceSchedule.nextDue);
    const daysUntilDue = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      return {
        label: 'Overdue',
        color: 'bg-red-100 text-red-800',
        icon: <AlertTriangle size={16} className="text-red-500" />
      };
    } else if (daysUntilDue <= 7) {
      return {
        label: 'Due Soon',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Clock size={16} className="text-yellow-500" />
      };
    } else {
      return {
        label: `Due in ${daysUntilDue} days`,
        color: 'bg-green-100 text-green-800',
        icon: <Calendar size={16} className="text-green-500" />
      };
    }
  };

  const getPendingMaintenanceTasks = (machine: Machine) => {
    if (!machine.maintenanceSchedule) return 0;
    return machine.maintenanceSchedule.tasks.filter(task => !task.completed).length;
  };

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
      await addMachine(machineData as Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create machine:', err);
      // You might want to show an error notification here
    }
  };

  const handleUpdateMachine = async (machineData: Machine) => {
    try {
      await updateMachine(machineData.id, machineData);
      setSelectedMachine(null);
    } catch (err) {
      console.error('Failed to update machine:', err);
      // You might want to show an error notification here
    }
  };

  const calculateMachineMetrics = (machine: Machine) => {
    let totalWeight = 0;
    let totalPowerConsumption = 0;

    machine.components.forEach(component => {
      // Extract weight from specifications
      const weightStr = component.specifications.weight as string;
      if (weightStr) {
        const weight = parseFloat(weightStr);
        if (!isNaN(weight)) {
          // Assume weight is in grams if unit is not specified
          if (weightStr.toLowerCase().includes('kg')) {
            totalWeight += weight * 1000;
          } else {
            totalWeight += weight;
          }
        }
      }

      // Calculate power consumption from voltage and current if available
      const voltage = parseFloat(component.specifications.voltage as string);
      const current = parseFloat(component.specifications.current as string);
      if (!isNaN(voltage) && !isNaN(current)) {
        totalPowerConsumption += voltage * current;
      } else if (component.specifications.power) {
        // If power is directly specified
        const power = parseFloat(component.specifications.power as string);
        if (!isNaN(power)) {
          totalPowerConsumption += power;
        }
      }
    });

    return {
      weight: totalWeight > 1000 ? `${(totalWeight / 1000).toFixed(2)} kg` : `${totalWeight.toFixed(2)} g`,
      power: totalPowerConsumption > 1000 ? `${(totalPowerConsumption / 1000).toFixed(2)} kW` : `${totalPowerConsumption.toFixed(2)} W`
    };
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
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            New Machine
          </button>
        </div>

        <div className="space-y-4">
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
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-100 sm:hidden"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
          {filteredMachines.map(machine => {
            const metrics = calculateMachineMetrics(machine);
            
            return (
              <div key={machine.id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-2 sm:space-y-0">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{machine.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{machine.description}</p>
                    </div>
                    <span className={`self-start sm:self-center inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(machine.status)}`}>
                      {getStatusIcon(machine.status)}
                      <span className="ml-2">{machine.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Type</p>
                      <p className="text-sm font-medium text-gray-900">{machine.type}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Components</p>
                      <p className="text-sm font-medium text-gray-900">{machine.components.length}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Total Weight</p>
                      <p className="text-sm font-medium text-gray-900">{metrics.weight}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Power Usage</p>
                      <p className="text-sm font-medium text-gray-900">{metrics.power}</p>
                    </div>
                  </div>

                  {machine.maintenanceSchedule && (
                    <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Tool size={16} className="text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-700">Maintenance Status</span>
                        </div>
                        {getMaintenanceStatus(machine) && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMaintenanceStatus(machine)?.color}`}>
                            {getMaintenanceStatus(machine)?.icon}
                            <span className="ml-1">{getMaintenanceStatus(machine)?.label}</span>
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-500">Frequency:</span>
                          <span className="ml-1 font-medium">{machine.maintenanceSchedule.frequency}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Pending Tasks:</span>
                          <span className="ml-1 font-medium">{getPendingMaintenanceTasks(machine)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                    <button 
                      onClick={() => setSelectedMachine(machine)}
                      className="w-full sm:w-auto px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => setSelectedMachine(machine)}
                      className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMachines.length === 0 && (
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg mt-6">
            <div className="text-gray-400 mb-3">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No machines found</h3>
            <p className="text-sm text-gray-500">
              Try adjusting your search filters or add a new machine.
            </p>
          </div>
        )}
      </div>

      {selectedMachine && (
        <MachineDetails 
          machine={selectedMachine} 
          onClose={() => setSelectedMachine(null)} 
          onUpdate={handleUpdateMachine}
        />
      )}

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