'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/utils/formatCurrency'
import { printReceipt } from '@/utils/printReceipt'
import { StatusBadge } from '@/components/StatusBadge'
import { CancelModal } from '@/components/CancelModal'
import { 
  LayoutDashboard, 
  Utensils, 
  LogOut, 
  Printer, 
  Trash2, 
  TrendingUp, 
  ShoppingBag, 
  XCircle,
  DollarSign,
  Plus,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react'

// Admin credentials (hardcoded for simplicity)
// For production: move to environment variables
// Add rate limiting: block after 5 failed attempts
// Consider: IP whitelist for admin access
const ADMIN_USERNAME = 'muglycafe321'
const ADMIN_PASSWORD = 'M#aglyCafe@321'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [orders, setOrders] = useState([])
  const [orderItems, setOrderItems] = useState({})
  const [menuItems, setMenuItems] = useState([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    cancelledOrders: 0,
    todayRevenue: 0
  })
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState(null)
  
  // New menu item form
  const [newItem, setNewItem] = useState({ name: '', category: '', price: '' })

  // Check authentication on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('mugly_admin')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
      fetchMenuItems()
    }
  }, [isAuthenticated])

  const fetchOrders = async () => {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return
    }

    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')

    if (itemsError) {
      console.error('Error fetching order items:', itemsError)
      return
    }

    const itemsByOrder = {}
    itemsData.forEach(item => {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = []
      }
      itemsByOrder[item.order_id].push(item)
    })

    setOrders(ordersData)
    setOrderItems(itemsByOrder)

    // Calculate stats
    const today = new Date().toISOString().split('T')[0]
    const todayOrders = ordersData.filter(o => o.created_at.startsWith(today))
    
    setStats({
      totalOrders: ordersData.length,
      totalRevenue: ordersData
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0),
      cancelledOrders: ordersData.filter(o => o.status === 'cancelled').length,
      todayRevenue: todayOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0)
    })
  }

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      console.error('Error fetching menu items:', error)
      return
    }

    setMenuItems(data || [])
  }

  const handleLogin = (e) => {
    e.preventDefault()
    
    // Check if locked
    if (isLocked) {
      toast.error('Too many failed attempts. Please wait 5 minutes.')
      return
    }
    
    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Success - store in session storage
      sessionStorage.setItem('mugly_admin', 'true')
      setIsAuthenticated(true)
      setFailedAttempts(0)
      toast.success('Welcome to Admin Dashboard')
    } else {
      // Failed attempt
      const newAttempts = failedAttempts + 1
      setFailedAttempts(newAttempts)
      
      if (newAttempts >= 5) {
        // Lock out for 5 minutes
        setIsLocked(true)
        toast.error('Too many failed attempts. Locked for 5 minutes.')
        
        // Auto-unlock after 5 minutes
        setTimeout(() => {
          setFailedAttempts(0)
          setIsLocked(false)
        }, 5 * 60 * 1000)
      } else {
        toast.error('❌ Invalid username or password')
      }
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('mugly_admin')
    setIsAuthenticated(false)
    setUsername('')
    setPassword('')
    setFailedAttempts(0)
    setIsLocked(false)
    toast.success('Logged out successfully')
  }

  const cancelOrder = async (orderId) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)

      if (error) throw error

      toast.success('Order cancelled')
      fetchOrders()
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Failed to cancel order')
    }
  }

  const toggleMenuItem = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ available: !currentStatus })
        .eq('id', id)

      if (error) throw error

      fetchMenuItems()
      toast.success('Menu item updated')
    } catch (error) {
      console.error('Error updating menu item:', error)
      toast.error('Failed to update menu item')
    }
  }

  const addMenuItem = async (e) => {
    e.preventDefault()
    if (!newItem.name || !newItem.category || !newItem.price) {
      toast.error('Please fill all fields')
      return
    }

    try {
      const { error } = await supabase
        .from('menu_items')
        .insert({
          name: newItem.name,
          category: newItem.category,
          price: parseInt(newItem.price),
          available: true
        })

      if (error) throw error

      toast.success('Menu item added')
      setNewItem({ name: '', category: '', price: '' })
      fetchMenuItems()
    } catch (error) {
      console.error('Error adding menu item:', error)
      toast.error('Failed to add menu item')
    }
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      if (!order.created_at.startsWith(today)) return false
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      if (order.created_at < weekAgo) return false
    }
    
    return true
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        <div 
          className="w-full max-w-md bg-dark2 border border-gold/30 rounded-2xl shadow-2xl"
          style={{ padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/20 rounded-full mb-4">
              <span className="text-3xl font-bold text-gold" style={{ fontFamily: 'Playfair Display, serif' }}>M</span>
            </div>
            <h1 
              className="text-3xl font-bold text-gold mb-2"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              MUGLY CAFÉ
            </h1>
            <p className="text-muted text-xs uppercase tracking-wider">Admin Panel</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-gold-light text-[11px] uppercase tracking-wider mb-2 font-medium">
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                disabled={isLocked}
                className="w-full h-[52px] px-4 bg-dark border border-[#3A3020] rounded-lg text-white placeholder-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all disabled:opacity-50"
                style={{ fontSize: '16px', fontFamily: 'DM Sans, sans-serif' }}
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gold-light text-[11px] uppercase tracking-wider mb-2 font-medium">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isLocked}
                  className="w-full h-[52px] px-4 bg-dark border border-[#3A3020] rounded-lg text-white placeholder-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all disabled:opacity-50 pr-12"
                  style={{ fontSize: '16px', fontFamily: 'DM Sans, sans-serif' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-gold-light transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLocked}
              className="w-full h-[52px] bg-gradient-to-r from-gold to-gold-light text-dark font-bold rounded-lg hover:from-gold-light hover:to-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{ fontSize: '15px', fontFamily: 'DM Sans, sans-serif' }}
            >
              {isLocked ? '🔒 Locked' : '🔐 Login to Admin Panel'}
            </button>
          </form>

          {/* Lock Message */}
          {isLocked && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center animate-pulse">
              Too many failed attempts. Please wait 5 minutes.
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted leading-relaxed">
              🔒 Secure admin access<br/>
              Only authorized personnel allowed
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <header className="bg-dark2 border-b border-gold/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-2xl font-bold text-gold"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                MUGLY CAFÉ
              </h1>
              <span className="text-muted text-sm">Admin Dashboard</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-lg text-gold hover:bg-gold/20 transition-all font-medium"
            >
              <LogOut size={18} strokeWidth={2.5} />
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-gold text-dark shadow-lg shadow-gold/20'
                  : 'text-muted hover:text-gold-light hover:bg-gold/10'
              }`}
            >
              <LayoutDashboard size={16} strokeWidth={2.5} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-gold text-dark shadow-lg shadow-gold/20'
                  : 'text-muted hover:text-gold-light hover:bg-gold/10'
              }`}
            >
              <ShoppingBag size={16} strokeWidth={2.5} />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'menu'
                  ? 'bg-gold text-dark shadow-lg shadow-gold/20'
                  : 'text-muted hover:text-gold-light hover:bg-gold/10'
              }`}
            >
              <Utensils size={16} strokeWidth={2.5} />
              Menu
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-dark2 border border-gold/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gold/20 rounded-lg">
                    <ShoppingBag className="text-gold" size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-muted text-sm">Total Orders</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
              </div>

              <div className="bg-dark2 border border-gold/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="text-green-400" size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-muted text-sm">Total Revenue</span>
                </div>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
              </div>

              <div className="bg-dark2 border border-gold/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <XCircle className="text-red-400" size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-muted text-sm">Cancelled</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.cancelledOrders}</p>
              </div>

              <div className="bg-dark2 border border-gold/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <DollarSign className="text-blue-400" size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-muted text-sm">Today&apos;s Revenue</span>
                </div>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.todayRevenue)}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-dark2 border border-gold/20 rounded-lg">
              <div className="p-4 border-b border-gold/20">
                <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
              </div>
              <div className="p-4">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-gold/10 last:border-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{order.order_code}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-muted">{order.table_number} • {order.waiter_name}</p>
                    </div>
                    <span className="font-bold text-gold">{formatCurrency(order.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-dark2 border border-gold/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-muted" strokeWidth={2.5} />
                <span className="text-sm text-muted">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-dark border border-gold/20 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-gold"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="served">Served</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-muted" strokeWidth={2.5} />
                <span className="text-sm text-muted">Date:</span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-dark border border-gold/20 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-gold"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-dark2 border border-gold/20 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark border-b border-gold/20">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted">Order ID</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted">Table</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted">Waiter</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted">Items</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted">Total</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted">Time</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="border-b border-gold/10 last:border-0 hover:bg-gold/5 transition-colors">
                        <td className="px-4 py-3 text-white font-medium">{order.order_code}</td>
                        <td className="px-4 py-3 text-muted">{order.table_number}</td>
                        <td className="px-4 py-3 text-muted">{order.waiter_name}</td>
                        <td className="px-4 py-3 text-muted">{orderItems[order.id]?.length || 0} items</td>
                        <td className="px-4 py-3 text-gold font-medium">{formatCurrency(order.total)}</td>
                        <td className="px-4 py-3 text-muted text-sm">
                          {new Date(order.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => printReceipt(order, orderItems[order.id] || [])}
                              className="p-1.5 rounded border border-gold/30 text-muted hover:text-gold-light hover:bg-gold/10 transition-all"
                              title="Print Bill"
                            >
                              <Printer size={16} strokeWidth={2.5} />
                            </button>
                            {(order.status === 'pending' || order.status === 'preparing') && (
                              <button
                                onClick={() => {
                                  setOrderToCancel(order)
                                  setShowCancelModal(true)
                                }}
                                className="p-1.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                                title="Cancel Order"
                              >
                                <Trash2 size={16} strokeWidth={2.5} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted">No orders found</div>
              )}
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Add New Item Form */}
            <div className="bg-dark2 border border-gold/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Plus size={18} strokeWidth={2.5} />
                Add New Menu Item
              </h3>
              <form onSubmit={addMenuItem} className="grid md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Item name"
                  className="px-4 py-2.5 bg-dark border border-gold/20 rounded-lg text-white placeholder-muted focus:outline-none focus:border-gold transition-colors"
                />
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  placeholder="Category"
                  className="px-4 py-2.5 bg-dark border border-gold/20 rounded-lg text-white placeholder-muted focus:outline-none focus:border-gold transition-colors"
                />
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="Price"
                  className="px-4 py-2.5 bg-dark border border-gold/20 rounded-lg text-white placeholder-muted focus:outline-none focus:border-gold transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-gold to-gold-light text-dark font-medium rounded-lg hover:from-gold-light hover:to-gold transition-all shadow-lg"
                >
                  Add Item
                </button>
              </form>
            </div>

            {/* Menu Items List */}
            <div className="bg-dark2 border border-gold/20 rounded-lg">
              <div className="p-4 border-b border-gold/20">
                <h3 className="text-lg font-semibold text-white">Menu Items</h3>
              </div>
              <div className="divide-y divide-gold/10">
                {menuItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gold/5 transition-colors">
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-sm text-muted">{item.category} • {formatCurrency(item.price)}</p>
                    </div>
                    <button
                      onClick={() => toggleMenuItem(item.id, item.available)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                    >
                      {item.available ? (
                        <>
                          <ToggleRight className="text-green-400" size={28} strokeWidth={2.5} />
                          <span className="text-sm text-green-400 font-medium">Available</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="text-muted" size={28} strokeWidth={2.5} />
                          <span className="text-sm text-muted">Unavailable</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
              {menuItems.length === 0 && (
                <div className="text-center py-8 text-muted">No menu items found</div>
              )}
            </div>
          </div>
        )}
      </main>

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          if (orderToCancel) {
            cancelOrder(orderToCancel.id)
            setShowCancelModal(false)
            setOrderToCancel(null)
          }
        }}
        orderCode={orderToCancel?.order_code || ''}
        tableNumber={orderToCancel?.table_number || ''}
      />
    </div>
  )
}
