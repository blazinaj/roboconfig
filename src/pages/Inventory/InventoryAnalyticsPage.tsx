import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useInventory } from '../../hooks/useInventory';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { BarChart3, PieChart, LineChart, ArrowLeft } from 'lucide-react';
import { Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  ChartData 
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const InventoryAnalyticsPage: React.FC = () => {
  const { inventoryStatus, loading: inventoryLoading } = useInventory();
  const { purchaseOrders, loading: ordersLoading } = usePurchaseOrders();
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'categories'>('overview');
  const [categoryData, setCategoryData] = useState<ChartData<'pie'>>({ labels: [], datasets: [] });
  const [stockLevelData, setStockLevelData] = useState<ChartData<'bar'>>({ labels: [], datasets: [] });
  const [orderTrendsData, setOrderTrendsData] = useState<ChartData<'line'>>({ labels: [], datasets: [] });

  // Prepare chart data when inventory and order data is loaded
  useEffect(() => {
    if (!inventoryLoading && !ordersLoading) {
      // Prepare category distribution data
      const categories = {} as Record<string, number>;
      inventoryStatus.forEach(item => {
        if (categories[item.category]) {
          categories[item.category]++;
        } else {
          categories[item.category] = 1;
        }
      });

      setCategoryData({
        labels: Object.keys(categories),
        datasets: [
          {
            label: 'Component Categories',
            data: Object.values(categories),
            backgroundColor: [
              '#3B82F6', // blue-500
              '#10B981', // green-500
              '#F59E0B', // amber-500
              '#8B5CF6', // purple-500
              '#EC4899', // pink-500
              '#6366F1', // indigo-500
              '#14B8A6', // teal-500
              '#EF4444', // red-500
            ],
            borderWidth: 1,
          },
        ],
      });

      // Prepare stock level data
      const lowStockItems = inventoryStatus.filter(item => item.quantity <= item.minimum_quantity && item.quantity > 0).length;
      const outOfStockItems = inventoryStatus.filter(item => item.quantity === 0).length;
      const healthyStockItems = inventoryStatus.filter(item => item.quantity > item.minimum_quantity).length;
      
      setStockLevelData({
        labels: ['Healthy Stock', 'Low Stock', 'Out of Stock'],
        datasets: [
          {
            label: 'Inventory Status',
            data: [healthyStockItems, lowStockItems, outOfStockItems],
            backgroundColor: [
              '#10B981', // green-500
              '#F59E0B', // amber-500
              '#EF4444', // red-500
            ],
            borderColor: [
              '#065F46', // green-800
              '#92400E', // amber-800
              '#991B1B', // red-800
            ],
            borderWidth: 1,
          },
        ],
      });

      // Prepare order trends data
      // Group orders by month
      const last6Months = [...Array(6).keys()].map(i => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d;
      }).reverse();
      
      const monthLabels = last6Months.map(date => 
        date.toLocaleString('default', { month: 'short', year: 'numeric' })
      );
      
      const ordersByMonth = last6Months.map(date => {
        const month = date.getMonth();
        const year = date.getFullYear();
        return purchaseOrders.filter(order => {
          const orderDate = new Date(order.order_date);
          return orderDate.getMonth() === month && orderDate.getFullYear() === year;
        }).length;
      });

      const orderItemsByMonth = last6Months.map(date => {
        const month = date.getMonth();
        const year = date.getFullYear();
        return purchaseOrders
          .filter(order => {
            const orderDate = new Date(order.order_date);
            return orderDate.getMonth() === month && orderDate.getFullYear() === year;
          })
          .reduce((sum, order) => sum + (order.items?.length || 0), 0);
      });

      setOrderTrendsData({
        labels: monthLabels,
        datasets: [
          {
            label: 'Orders',
            data: ordersByMonth,
            backgroundColor: 'rgba(59, 130, 246, 0.5)', // blue-500 with opacity
            borderColor: '#3B82F6', // blue-500
            borderWidth: 2,
          },
          {
            label: 'Items Ordered',
            data: orderItemsByMonth,
            backgroundColor: 'rgba(249, 115, 22, 0.5)', // orange-500 with opacity
            borderColor: '#F97316', // orange-500
            borderWidth: 2,
          }
        ],
      });
    }
  }, [inventoryStatus, purchaseOrders, inventoryLoading, ordersLoading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate inventory value
  const totalInventoryValue = inventoryStatus.reduce((total, item) => {
    return total + (item.quantity * (item.unit_cost || 0));
  }, 0);

  // Calculate inventory metrics
  const totalItems = inventoryStatus.length;
  const lowStockPercentage = totalItems ? 
    Math.round((inventoryStatus.filter(i => i.quantity <= i.minimum_quantity && i.quantity > 0).length / totalItems) * 100) : 
    0;
  const outOfStockPercentage = totalItems ? 
    Math.round((inventoryStatus.filter(i => i.quantity === 0).length / totalItems) * 100) : 
    0;

  // Calculate orders metrics
  const totalOrders = purchaseOrders.length;
  const pendingOrders = purchaseOrders.filter(o => o.status === 'pending' || o.status === 'ordered').length;
  const completedOrders = purchaseOrders.filter(o => o.status === 'received').length;

  return (
    <MainLayout>
      <div className="mb-6">
        <button
          onClick={() => window.location.href = '/inventory'}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span className="text-sm">Back to Inventory</span>
        </button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Analytics</h1>
            <p className="text-gray-600">Track inventory trends and performance metrics</p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Total Inventory Value</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalInventoryValue)}</p>
            <p className="text-sm text-gray-600 mt-1">Across {totalItems} components</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Low Stock Items</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{lowStockPercentage}%</p>
            <p className="text-sm text-gray-600 mt-1">Of total inventory</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Out of Stock Items</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{outOfStockPercentage}%</p>
            <p className="text-sm text-gray-600 mt-1">Of total inventory</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Purchase Orders</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{totalOrders}</p>
            <p className="text-sm text-gray-600 mt-1">
              {pendingOrders} pending, {completedOrders} completed
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <PieChart className="w-5 h-5 inline mr-2" />
                Categories
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'trends'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <LineChart className="w-5 h-5 inline mr-2" />
                Order Trends
              </button>
            </nav>
          </div>
        </div>

        {/* Chart Area */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Stock Level Distribution</h2>
              <div style={{ height: '300px' }}>
                <Bar 
                  data={stockLevelData} 
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Inventory Status Overview'
                      }
                    }
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-sm font-medium text-green-800">Healthy Stock</h3>
                  <p className="text-2xl font-bold text-green-900">{inventoryStatus.filter(item => item.quantity > item.minimum_quantity).length}</p>
                  <p className="text-xs text-green-600 mt-1">Components with sufficient inventory</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="text-sm font-medium text-yellow-800">Low Stock</h3>
                  <p className="text-2xl font-bold text-yellow-900">{inventoryStatus.filter(item => item.quantity <= item.minimum_quantity && item.quantity > 0).length}</p>
                  <p className="text-xs text-yellow-600 mt-1">Components below minimum levels</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="text-sm font-medium text-red-800">Out of Stock</h3>
                  <p className="text-2xl font-bold text-red-900">{inventoryStatus.filter(item => item.quantity === 0).length}</p>
                  <p className="text-xs text-red-600 mt-1">Components with zero inventory</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Component Categories</h2>
                <div style={{ height: '300px' }}>
                  <Pie 
                    data={categoryData}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                        title: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Category Analysis</h2>
                <div className="bg-gray-50 rounded-lg p-4 h-full">
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      This chart shows the distribution of components across different categories in your inventory. 
                    </p>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <h4 className="font-medium text-blue-800 mb-1">Insights</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Most common category: {categoryData.labels && categoryData.labels.length > 0 ? 
                          categoryData.labels[categoryData.datasets[0].data.indexOf(Math.max(...categoryData.datasets[0].data))] : 
                          'N/A'}
                        </li>
                        <li>• Total categories: {categoryData.labels?.length || 0}</li>
                        <li>• Consider diversifying categories with low representation</li>
                        <li>• Focus reordering efforts on categories with high usage</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'trends' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Purchase Order Trends</h2>
              <div style={{ height: '300px' }}>
                <Line 
                  data={orderTrendsData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h3>
                  <div className="space-y-3">
                    {purchaseOrders.slice(0, 3).map(order => (
                      <div key={order.id} className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">{order.order_number}</p>
                          <p className="text-sm text-gray-500">{order.order_date.toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(order.total_amount || 0)}</p>
                          <p className="text-xs">{order.items?.length || 0} items</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Order Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">Pending Orders</span>
                        <span className="text-xs font-medium text-gray-900">{pendingOrders} / {totalOrders}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${totalOrders ? (pendingOrders / totalOrders) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">Completed Orders</span>
                        <span className="text-xs font-medium text-gray-900">{completedOrders} / {totalOrders}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${totalOrders ? (completedOrders / totalOrders) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">Canceled Orders</span>
                        <span className="text-xs font-medium text-gray-900">
                          {purchaseOrders.filter(o => o.status === 'canceled').length} / {totalOrders}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${totalOrders ? (purchaseOrders.filter(o => o.status === 'canceled').length / totalOrders) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default InventoryAnalyticsPage;