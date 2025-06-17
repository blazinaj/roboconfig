import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, CheckCircle, Info, Notebook as Robot, Cog, Package, Gauge, ArrowRight, Plus, FileText, Warehouse, Truck as TruckLoading, ShoppingCart, AlertCircle } from 'lucide-react';
import { useOrganization } from '../context/OrganizationContext';
import { useMachines } from '../hooks/useMachines';
import { useComponents } from '../hooks/useComponents';
import { useInventory } from '../hooks/useInventory';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { machines, loading: machinesLoading, error: machinesError } = useMachines();
  const { components, loading: componentsLoading, error: componentsError } = useComponents();
  const { inventoryStatus, loading: inventoryLoading, error: inventoryError } = useInventory();

  // Calculate statistics for overview cards
  const stats = useMemo(() => {
    const machineStats = {
      total: machines.length,
      active: machines.filter(m => m.status === 'Active').length,
      maintenance: machines.filter(m => m.status === 'Maintenance').length,
      error: machines.filter(m => m.status === 'Error').length
    };
    
    // Calculate component risk levels
    const componentRiskCounts = components.reduce((acc, component) => {
      if (!component.riskFactors || component.riskFactors.length === 0) {
        acc.healthy++;
        return acc;
      }
      
      const maxSeverity = Math.max(...component.riskFactors.map(rf => rf.severity));
      const maxProbability = Math.max(...component.riskFactors.map(rf => rf.probability));
      const riskScore = maxSeverity * maxProbability;
      
      if (riskScore >= 15) acc.critical++;
      else if (riskScore >= 6) acc.warning++;
      else acc.healthy++;
      
      return acc;
    }, { total: components.length, critical: 0, warning: 0, healthy: 0 });
    
    // Calculate risk factors across all components
    const allRiskFactors = components.flatMap(c => c.riskFactors || []);
    const riskCounts = allRiskFactors.reduce((acc, risk) => {
      acc.total++;
      
      const riskScore = risk.severity * risk.probability;
      if (riskScore >= 15) acc.high++;
      else if (riskScore >= 6) acc.medium++;
      else acc.low++;
      
      return acc;
    }, { total: 0, high: 0, medium: 0, low: 0 });
    
    // Calculate inventory stats
    const inventoryStats = {
      total: inventoryStatus.length,
      healthy: inventoryStatus.filter(item => item.quantity > item.minimum_quantity).length,
      low: inventoryStatus.filter(item => item.quantity <= item.minimum_quantity && item.quantity > 0).length,
      out: inventoryStatus.filter(item => item.quantity === 0).length,
      value: inventoryStatus.reduce((total, item) => total + (item.quantity * (item.unit_cost || 0)), 0)
    };
    
    return {
      machines: machineStats,
      components: componentRiskCounts,
      risks: riskCounts,
      inventory: inventoryStats
    };
  }, [machines, components, inventoryStatus]);

  // Get recent machines
  const recentMachines = useMemo(() => {
    return [...machines]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3)
      .map(machine => ({
        id: machine.id,
        name: machine.name,
        status: machine.status,
        riskLevel: calculateMachineRiskLevel(machine),
        lastUpdated: getRelativeTimeString(new Date(machine.updatedAt))
      }));
  }, [machines]);

  // Get critical components
  const criticalComponents = useMemo(() => {
    const componentsWithRisk = components.map(component => {
      if (!component.riskFactors || component.riskFactors.length === 0) {
        return { component, riskScore: 0, severity: 'Low' as const };
      }
      
      const maxSeverity = Math.max(...component.riskFactors.map(rf => rf.severity));
      const maxProbability = Math.max(...component.riskFactors.map(rf => rf.probability));
      const riskScore = maxSeverity * maxProbability;
      
      let severity: 'High' | 'Medium' | 'Low' = 'Low';
      if (riskScore >= 15) severity = 'High';
      else if (riskScore >= 6) severity = 'Medium';
      
      return { 
        component, 
        riskScore,
        severity,
        issue: component.riskFactors[0]?.name || 'Unknown risk'
      };
    });
    
    return componentsWithRisk
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3)
      .map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category,
        issue: item.issue,
        severity: item.severity
      }));
  }, [components]);

  // Get low stock items
  const lowStockItems = useMemo(() => {
    return inventoryStatus
      .filter(item => item.quantity <= item.minimum_quantity)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 3)
      .map(item => ({
        id: item.inventory_id,
        componentId: item.component_id,
        name: item.component_name,
        quantity: item.quantity,
        minimum: item.minimum_quantity,
        category: item.category
      }));
  }, [inventoryStatus]);

  // Helper function to calculate machine risk level
  function calculateMachineRiskLevel(machine) {
    if (!machine.components || machine.components.length === 0) return 'Low';
    
    const maxRiskScore = Math.max(...machine.components.flatMap(component => {
      if (!component.riskFactors || component.riskFactors.length === 0) return [0];
      return component.riskFactors.map(rf => rf.severity * rf.probability);
    }));
    
    if (maxRiskScore >= 15) return 'High';
    if (maxRiskScore >= 6) return 'Medium';
    return 'Low';
  }

  // Helper function to format relative time
  function getRelativeTimeString(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  }

  const getRiskBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return <span className="flex items-center text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium">
          <AlertTriangle size={12} className="mr-1" /> High
        </span>;
      case 'medium':
        return <span className="flex items-center text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
          <Info size={12} className="mr-1" /> Medium
        </span>;
      default:
        return <span className="flex items-center text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
          <CheckCircle size={12} className="mr-1" /> Low
        </span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">Active</span>;
      case 'maintenance':
        return <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium">Maintenance</span>;
      case 'error':
        return <span className="text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium">Error</span>;
      default:
        return <span className="text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleComponentClick = (category: string, id: string) => {
    const categoryRoutes: Record<string, string> = {
      'Drive': '/components/drive',
      'Controller': '/components/controller',
      'Power': '/components/power',
      'Communication': '/components/communication',
      'Software': '/components/software',
      'Object Manipulation': '/components/manipulation',
      'Sensors': '/components/sensors',
      'Chassis': '/components/chassis'
    };
    navigate(categoryRoutes[category] || '/components');
  };

  if (!currentOrganization) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Robot className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to RoboConfig</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          To get started, please create or join an organization to manage your robotics systems.
        </p>
        <button
          onClick={() => navigate('/organizations')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Create Organization
        </button>
      </div>
    );
  }

  // Loading state
  if (machinesLoading || componentsLoading || inventoryLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
                  <div className="ml-3 h-5 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="p-4 sm:p-6">
                {[1, 2, 3].map(j => (
                  <div key={j} className="mb-3 p-2 bg-gray-100 rounded-lg flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-40"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (machinesError || componentsError || inventoryError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {machinesError || componentsError || inventoryError}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
        >
          <ArrowRight size={18} className="mr-2" />
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Machines Overview */}
        <div 
          onClick={() => navigate('/machines')}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Robot className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Machines</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.machines.total}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Active</span>
              <span className="font-medium text-green-600">{stats.machines.active}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Maintenance</span>
              <span className="font-medium text-blue-600">{stats.machines.maintenance}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Error</span>
              <span className="font-medium text-red-600">{stats.machines.error}</span>
            </div>
          </div>
        </div>

        {/* Components Overview */}
        <div 
          onClick={() => navigate('/components')}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Components</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.components.total}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Healthy</span>
              <span className="font-medium text-green-600">{stats.components.healthy}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Warning</span>
              <span className="font-medium text-yellow-600">{stats.components.warning}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Critical</span>
              <span className="font-medium text-red-600">{stats.components.critical}</span>
            </div>
          </div>
        </div>

        {/* Inventory Overview */}
        <div 
          onClick={() => navigate('/inventory')}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Warehouse className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Inventory</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.inventory.total}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Value</span>
              <span className="font-medium text-gray-900">{formatCurrency(stats.inventory.value)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Low Stock</span>
              <span className="font-medium text-yellow-600">{stats.inventory.low}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Out of Stock</span>
              <span className="font-medium text-red-600">{stats.inventory.out}</span>
            </div>
          </div>
        </div>

        {/* Reports Overview */}
        <div 
          onClick={() => navigate('/reports')}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Reports</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.risks.total}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">High Risk</span>
              <span className="font-medium text-red-600">{stats.risks.high}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Medium Risk</span>
              <span className="font-medium text-yellow-600">{stats.risks.medium}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Low Risk</span>
              <span className="font-medium text-green-600">{stats.risks.low}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Machines & Critical Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Machines */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Machines</h3>
            <button 
              onClick={() => navigate('/machines')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {recentMachines.length > 0 ? (
                recentMachines.map((machine) => (
                  <div 
                    key={machine.id}
                    onClick={() => navigate(`/machines/${machine.id}`)}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{machine.name}</h4>
                      <p className="text-xs text-gray-500">Updated {machine.lastUpdated}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(machine.status)}
                      {getRiskBadge(machine.riskLevel)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No machines found
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/machines')}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add New Machine
            </button>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Items</h3>
            <button 
              onClick={() => navigate('/inventory')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => navigate('/inventory')}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <div className="flex items-center mt-1">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700">{item.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{item.quantity} in stock</div>
                      <div className="text-xs text-yellow-600">
                        Min level: {item.minimum}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  All items are sufficiently stocked
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/inventory/purchase-orders')}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              <ShoppingCart size={16} className="mr-2" />
              Create Purchase Order
            </button>
          </div>
        </div>
      </div>

      {/* Critical Components & Recent Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Components */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Critical Components</h3>
            <button 
              onClick={() => navigate('/components')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {criticalComponents.length > 0 ? (
                criticalComponents.map((component) => (
                  <div 
                    key={component.id}
                    onClick={() => handleComponentClick(component.category, component.id)}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{component.name}</h4>
                      <p className="text-xs text-gray-500">{component.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">{component.issue}</span>
                      {getRiskBadge(component.severity)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No critical components found
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/components')}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Gauge size={16} className="mr-2" />
              View All Components
            </button>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Summary</h3>
            <button 
              onClick={() => navigate('/inventory/analytics')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View Analytics <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <div className="mb-4">
              <h4 className="text-base font-medium text-gray-800 mb-3">Total Inventory Value</h4>
              <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                <span className="text-gray-600">Current Value</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(stats.inventory.value)}</span>
              </div>
            </div>
            
            <h4 className="text-base font-medium text-gray-800 mb-3">Stock Status</h4>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg flex justify-between items-center">
                <span className="flex items-center text-green-800">
                  <CheckCircle size={16} className="mr-2" />
                  Healthy Stock
                </span>
                <span className="font-medium text-green-700">{stats.inventory.healthy} items</span>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg flex justify-between items-center">
                <span className="flex items-center text-yellow-800">
                  <AlertTriangle size={16} className="mr-2" />
                  Low Stock
                </span>
                <span className="font-medium text-yellow-700">{stats.inventory.low} items</span>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg flex justify-between items-center">
                <span className="flex items-center text-red-800">
                  <AlertCircle size={16} className="mr-2" />
                  Out of Stock
                </span>
                <span className="font-medium text-red-700">{stats.inventory.out} items</span>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/inventory')}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Warehouse size={16} className="mr-2" />
              Manage Inventory
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/machines')}
              className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors"
            >
              <Robot className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Add Machine</h4>
              <p className="text-sm text-gray-600 mt-1">Configure a new robotic system</p>
            </button>
            
            <button
              onClick={() => navigate('/components')}
              className="p-4 bg-purple-50 rounded-lg text-left hover:bg-purple-100 transition-colors"
            >
              <Cog className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Add Component</h4>
              <p className="text-sm text-gray-600 mt-1">Add new components to inventory</p>
            </button>
            
            <button
              onClick={() => navigate('/inventory/purchase-orders')}
              className="p-4 bg-amber-50 rounded-lg text-left hover:bg-amber-100 transition-colors"
            >
              <ShoppingCart className="h-6 w-6 text-amber-600 mb-2" />
              <h4 className="font-medium text-gray-900">Create Order</h4>
              <p className="text-sm text-gray-600 mt-1">Order new components from suppliers</p>
            </button>
            
            <button
              onClick={() => navigate('/inventory/suppliers')}
              className="p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors"
            >
              <TruckLoading className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Manage Suppliers</h4>
              <p className="text-sm text-gray-600 mt-1">Add and update component suppliers</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;