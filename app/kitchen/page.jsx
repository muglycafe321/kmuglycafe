'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { OrderCard } from '@/components/OrderCard'
import { Lock, LogOut, Volume2, VolumeX } from 'lucide-react'

const KITCHEN_PIN = '1234'

export default function KitchenPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [orders, setOrders] = useState([])
  const [orderItems, setOrderItems] = useState({})
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Check localStorage for auth on mount
  useEffect(() => {
    const auth = localStorage.getItem('kitchen_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  // Fetch orders and subscribe to realtime updates
  useEffect(() => {
    if (!isAuthenticated) return

    fetchOrders()

    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Play notification sound for new orders
            if (soundEnabled) {
              playNotificationSound()
            }
            toast.success(`New order: ${payload.new.order_code}`)
          }
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isAuthenticated, soundEnabled])

  const playNotificationSound = () => {
    // Create a simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (e) {
      console.error('Could not play sound:', e)
    }
  }

  const fetchOrders = async () => {
    // Fetch orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return
    }

    // Fetch order items
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')

    if (itemsError) {
      console.error('Error fetching order items:', itemsError)
      return
    }

    // Group items by order_id
    const itemsByOrder = {}
    itemsData.forEach(item => {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = []
      }
      itemsByOrder[item.order_id].push(item)
    })

    setOrders(ordersData)
    setOrderItems(itemsByOrder)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (pin === KITCHEN_PIN) {
      setIsAuthenticated(true)
      localStorage.setItem('kitchen_auth', 'true')
      toast.success('Welcome to Kitchen Dashboard')
    } else {
      toast.error('Invalid PIN')
      setPin('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('kitchen_auth')
    setPin('')
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      toast.success(`Order marked as ${newStatus}`)
      fetchOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    }
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

  // Sort orders: pending, preparing, ready, then served/cancelled
  const sortedOrders = [...orders].sort((a, b) => {
    const statusOrder = { pending: 0, preparing: 1, ready: 2, served: 3, cancelled: 4 }
    return statusOrder[a.status] - statusOrder[b.status]
  })

  // Calculate stats
  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    served: orders.filter(o => o.status === 'served').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-accent" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Kitchen Access</h1>
            <p className="text-muted mt-2">Enter PIN to access kitchen dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              maxLength={4}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground text-center text-2xl tracking-widest placeholder-muted focus:outline-none focus:border-accent mb-4"
            />
            <button
              type="submit"
              className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/80 transition-colors"
            >
              Access Kitchen
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-accent">MUGLY CAFE</h1>
              <span className="text-muted text-sm">Kitchen Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-lg border border-border text-muted hover:text-foreground hover:bg-border/50 transition-colors"
                title={soundEnabled ? 'Mute notifications' : 'Enable notifications'}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-muted hover:text-foreground hover:bg-border/50 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3">
            <div className="bg-background border border-border rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-pending">{stats.pending}</p>
              <p className="text-xs text-muted">Pending</p>
            </div>
            <div className="bg-background border border-border rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-preparing">{stats.preparing}</p>
              <p className="text-xs text-muted">Preparing</p>
            </div>
            <div className="bg-background border border-border rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-ready">{stats.ready}</p>
              <p className="text-xs text-muted">Ready</p>
            </div>
            <div className="bg-background border border-border rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-served">{stats.served}</p>
              <p className="text-xs text-muted">Served</p>
            </div>
            <div className="bg-background border border-border rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-cancelled">{stats.cancelled}</p>
              <p className="text-xs text-muted">Cancelled</p>
            </div>
          </div>
        </div>
      </header>

      {/* Orders Grid */}
      <main className="max-w-7xl mx-auto p-4">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted text-lg">No orders yet</p>
            <p className="text-muted-foreground text-sm mt-2">Orders will appear here when waiters submit them</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                orderItems={orderItems[order.id] || []}
                onStatusChange={updateOrderStatus}
                onCancel={cancelOrder}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
