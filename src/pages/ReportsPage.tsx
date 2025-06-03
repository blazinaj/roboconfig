import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { Machine, MachineType } from '../types';
import { FileText, Filter, Search, Calendar, Download } from 'lucide-react';
import ReportModal from '../components/Reports/ReportModal';

const ReportsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MachineType | 'All'>('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  // Mock data - In a real app, this would come from an API
  const reports = [
    {
      id: '1',
      machine: {
        id: '1',
        name: 'Assembly Line Robot A1',
        type: 'Industrial Robot',
        status: 'Active',
        description: 'Primary assembly line robotic arm for component placement',
        components: [],
        createdAt: new Date('2025-02-15'),
        updatedAt: new Date('2025-02-20'),
      },
      generatedAt: new Date('2025-02-20'),
      type: 'Risk Assessment',
      status: 'Generated',
    },
    {
      id: '2',
      machine: {
        id: '2',
        name: 'Warehouse Bot W1',
        type: 'Mobile Robot',
        status: 'Maintenance',
        description: 'Autonomous warehouse navigation and inventory robot',
        components: [],
        createdAt: new Date('2025-02-01'),
        updatedAt: new Date('2025-02-18'),
      },
      generatedAt: new Date('2025-02-18'),
      type: 'Maintenance',
      status: 'Generated',
    },
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.machine.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || report.machine.type === typeFilter;
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = report.generatedAt.toDateString() === new Date().toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = report.generatedAt >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDate = report.generatedAt >= monthAgo;
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Generate and manage machine reports</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <FileText size={20} className="mr-2" />
            New Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as MachineType | 'All')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Machine Types</option>
              <option value="Industrial Robot">Industrial Robot</option>
              <option value="Collaborative Robot">Collaborative Robot</option>
              <option value="Mobile Robot">Mobile Robot</option>
              <option value="Autonomous Vehicle">Autonomous Vehicle</option>
              <option value="Drone">Drone</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div className="relative">
            <button className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center">
              <Filter size={18} className="mr-2" />
              More Filters
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Machine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {report.machine.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {report.machine.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{report.machine.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{report.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        {report.generatedAt.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedMachine(report.machine)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedMachine && (
        <ReportModal 
          machine={selectedMachine} 
          onClose={() => setSelectedMachine(null)} 
        />
      )}
    </MainLayout>
  );
};

export default ReportsPage;