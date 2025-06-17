import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SupabaseProvider } from './context/SupabaseContext';
import { OrganizationProvider } from './context/OrganizationContext';
import DashboardPage from './pages/DashboardPage';
import ComponentsPage from './pages/ComponentsPage';
import MachinesPage from './pages/MachinesPage';
import MachineDetailsPage from './pages/MachineDetailsPage';
import ReportsPage from './pages/ReportsPage';
import ConfigurationPage from './pages/ConfigurationPage';
import DrivePage from './pages/ComponentTypes/DrivePage';
import ControllerPage from './pages/ComponentTypes/ControllerPage';
import PowerPage from './pages/ComponentTypes/PowerPage';
import CommunicationPage from './pages/ComponentTypes/CommunicationPage';
import SoftwarePage from './pages/ComponentTypes/SoftwarePage';
import ManipulationPage from './pages/ComponentTypes/ManipulationPage';
import SensorsPage from './pages/ComponentTypes/SensorsPage';
import ChassisPage from './pages/ComponentTypes/ChassisPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import SuppliersPage from './pages/Inventory/SuppliersPage';
import PurchaseOrdersPage from './pages/Inventory/PurchaseOrdersPage';
import PurchaseOrderDetailsPage from './pages/Inventory/PurchaseOrderDetailsPage';
import InventoryAnalyticsPage from './pages/Inventory/InventoryAnalyticsPage';
import OrganizationsPage from './pages/OrganizationsPage';
import OrganizationSettingsPage from './pages/OrganizationSettingsPage';
import AcceptInvitePage from './pages/AcceptInvitePage';
import SignInPage from './pages/Auth/SignInPage';
import SignUpPage from './pages/Auth/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <SupabaseProvider>
      <OrganizationProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              {/* Auth Routes */}
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/accept-invite" element={<AcceptInvitePage />} />

              {/* Protected Routes */}
              <Route path="/" element={<Navigate to="/dashboard\" replace />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/components" element={<ProtectedRoute><ComponentsPage /></ProtectedRoute>} />
              <Route path="/components/drive" element={<ProtectedRoute><DrivePage /></ProtectedRoute>} />
              <Route path="/components/controller" element={<ProtectedRoute><ControllerPage /></ProtectedRoute>} />
              <Route path="/components/power" element={<ProtectedRoute><PowerPage /></ProtectedRoute>} />
              <Route path="/components/communication" element={<ProtectedRoute><CommunicationPage /></ProtectedRoute>} />
              <Route path="/components/software" element={<ProtectedRoute><SoftwarePage /></ProtectedRoute>} />
              <Route path="/components/manipulation" element={<ProtectedRoute><ManipulationPage /></ProtectedRoute>} />
              <Route path="/components/sensors" element={<ProtectedRoute><SensorsPage /></ProtectedRoute>} />
              <Route path="/components/chassis" element={<ProtectedRoute><ChassisPage /></ProtectedRoute>} />
              <Route path="/machines" element={<ProtectedRoute><MachinesPage /></ProtectedRoute>} />
              <Route path="/machines/:id" element={<ProtectedRoute><MachineDetailsPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/configuration" element={<ProtectedRoute><ConfigurationPage /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
              <Route path="/inventory/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
              <Route path="/inventory/purchase-orders" element={<ProtectedRoute><PurchaseOrdersPage /></ProtectedRoute>} />
              <Route path="/inventory/purchase-orders/:id" element={<ProtectedRoute><PurchaseOrderDetailsPage /></ProtectedRoute>} />
              <Route path="/inventory/analytics" element={<ProtectedRoute><InventoryAnalyticsPage /></ProtectedRoute>} />
              <Route path="/organizations" element={<ProtectedRoute><OrganizationsPage /></ProtectedRoute>} />
              <Route path="/organizations/:id/settings" element={<ProtectedRoute><OrganizationSettingsPage /></ProtectedRoute>} />
            </Routes>
          </div>
        </BrowserRouter>
      </OrganizationProvider>
    </SupabaseProvider>
  );
}

export default App;