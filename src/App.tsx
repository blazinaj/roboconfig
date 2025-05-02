import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SupabaseProvider } from './context/SupabaseContext';
import { SampleDataProvider } from './context/SampleDataContext';
import DashboardPage from './pages/DashboardPage';
import ComponentsPage from './pages/ComponentsPage';
import MachinesPage from './pages/MachinesPage';
import ReportsPage from './pages/ReportsPage';
import DrivePage from './pages/ComponentTypes/DrivePage';
import ControllerPage from './pages/ComponentTypes/ControllerPage';
import PowerPage from './pages/ComponentTypes/PowerPage';
import CommunicationPage from './pages/ComponentTypes/CommunicationPage';
import SoftwarePage from './pages/ComponentTypes/SoftwarePage';
import ManipulationPage from './pages/ComponentTypes/ManipulationPage';
import SensorsPage from './pages/ComponentTypes/SensorsPage';
import ChassisPage from './pages/ComponentTypes/ChassisPage';

function App() {
  return (
    <SupabaseProvider>
      <SampleDataProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/components" element={<ComponentsPage />} />
              <Route path="/components/drive" element={<DrivePage />} />
              <Route path="/components/controller" element={<ControllerPage />} />
              <Route path="/components/power" element={<PowerPage />} />
              <Route path="/components/communication" element={<CommunicationPage />} />
              <Route path="/components/software" element={<SoftwarePage />} />
              <Route path="/components/manipulation" element={<ManipulationPage />} />
              <Route path="/components/sensors" element={<SensorsPage />} />
              <Route path="/components/chassis" element={<ChassisPage />} />
              <Route path="/machines" element={<MachinesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </SampleDataProvider>
    </SupabaseProvider>
  );
}

export default App;