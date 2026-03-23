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
  Filter
} from 'lucide-react'

export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  // Check session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch data when authenticated
  useEffect(() => {
    if (session) {
      fetchOrders()
      fetchMenuItems()
    }
  }, [session])

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

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome to Admin Dashboard')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
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

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-accent">Admin Login</h1>
            <p className="text-muted mt-2">Sign in to access admin dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@muglycafe.com"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/80 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-accent">MUGLY CAFE</h1>
              <span className="text-muted text-sm">Admin Dashboard</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-muted hover:text-foreground hover:bg-border/50 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted hover:text-foreground hover:bg-border/50'
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted hover:text-foreground hover:bg-border/50'
              }`}
            >
              <ShoppingBag size={16} />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'menu'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted hover:text-foreground hover:bg-border/50'
              }`}
            >
              <Utensils size={16} />
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
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <ShoppingBag className="text-accent" size={20} />
                  </div>
                  <span className="text-muted text-sm">Total Orders</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats.totalOrders}</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-ready/20 rounded-lg">
                    <TrendingUp className="text-ready" size={20} />
                  </div>
                  <span className="text-muted text-sm">Total Revenue</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-cancelled/20 rounded-lg">
                    <XCircle className="text-cancelled" size={20} />
                  </div>
                  <span className="text-muted text-sm">Cancelled</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats.cancelledOrders}</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-served/20 rounded-lg">
                    <DollarSign className="text-served" size={20} />
                  </div>
                  <span className="text-muted text-sm">Today&apos;s Revenue</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.todayRevenue)}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card border border-border rounded-lg">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
              </div>
              <div className="p-4">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{order.order_code}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-muted">{order.table_number} • {order.waiter_name}</p>
                    </div>
                    <span className="font-bold text-accent">{formatCurrency(order.total)}</span>
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
            <div className="flex flex-wrap gap-3 bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-muted" />
                <span className="text-sm text-muted">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-background border border-border rounded px-3 py-1 text-sm text-foreground"
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
                <Calendar size={16} className="text-muted" />
                <span className="text-sm text-muted">Date:</span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-background border border-border rounded px-3 py-1 text-sm text-foreground"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b border-border">
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
                      <tr key={order.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-foreground font-medium">{order.order_code}</td>
                        <td className="px-4 py-3 text-muted">{order.table_number}</td>
                        <td className="px-4 py-3 text-muted">{order.waiter_name}</td>
                        <td className="px-4 py-3 text-muted">{orderItems[order.id]?.length || 0} items</td>
                        <td className="px-4 py-3 text-accent font-medium">{formatCurrency(order.total)}</td>
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
                              className="p-1.5 rounded border border-border text-muted hover:text-foreground hover:bg-border/50 transition-colors"
                              title="Print Bill"
                            >
                              <Printer size={16} />
                            </button>
                            {(order.status === 'pending' || order.status === 'preparing') && (
                              <button
                                onClick={() => {
                                  setOrderToCancel(order)
                                  setShowCancelModal(true)
                                }}
                                className="p-1.5 rounded border border-cancelled/30 text-cancelled hover:bg-cancelled/20 transition-colors"
                                title="Cancel Order"
                              >
                                <Trash2 size={16} />
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
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Plus size={18} />
                Add New Menu Item
              </h3>
              <form onSubmit={addMenuItem} className="grid md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Item name"
                  className="px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  placeholder="Category"
                  className="px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-accent"
                />
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="Price"
                  className="px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/80 transition-colors"
                >
                  Add Item
                </button>
              </form>
            </div>

            {/* Menu Items List */}
            <div className="bg-card border border-border rounded-lg">
              <div className="p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Menu Items</h3>
              </div>
              <div className="divide-y divide-border">
                {menuItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted">{item.category} • {formatCurrency(item.price)}</p>
                    </div>
                    <button
                      onClick={() => toggleMenuItem(item.id, item.available)}
                      className="flex items-center gap-2"
                    >
                      {item.available ? (
                        <>
                          <ToggleRight className="text-ready" size={28} />
                          <span className="text-sm text-ready">Available</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="text-muted" size={28} />
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
