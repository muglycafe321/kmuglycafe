'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, Send, ShoppingCart, Trash2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/utils/formatCurrency'
import { generateOrderCode } from '@/utils/generateOrderCode'
import { StatusBadge } from '@/components/StatusBadge'

// Menu data from requirements
const menuData = [
  // ROLLS
  { name: 'Paneer Roll', price: 75, category: 'ROLLS' },
  { name: 'Fried Roll', price: 70, category: 'ROLLS' },
  { name: 'Falafell Roll', price: 60, category: 'ROLLS' },
  { name: 'Sp. Falafel Roll', price: 80, category: 'ROLLS' },
  { name: 'Zinger Wrap', price: 115, category: 'ROLLS' },
  { name: 'Porotta Roll', price: 70, category: 'ROLLS' },
  // LOADED FRIES
  { name: 'Loaded Fries', price: 190, category: 'LOADED FRIES' },
  { name: 'Peri Peri Loaded', price: 210, category: 'LOADED FRIES' },
  { name: 'Special Loaded', price: 230, category: 'LOADED FRIES' },
  // BURGER
  { name: 'Chicken Burger', price: 90, category: 'BURGER' },
  { name: 'Crispy Double Burger', price: 179, category: 'BURGER' },
  { name: 'Veg Burger', price: 80, category: 'BURGER' },
  { name: 'Zinger Burger', price: 110, category: 'BURGER' },
  { name: 'Kids Burger', price: 60, category: 'BURGER' },
  { name: 'Aloo Tikka Burger', price: 100, category: 'BURGER' },
  { name: 'Falafel Burger', price: 70, category: 'BURGER' },
  // MOMOS
  { name: 'CH Steam Momos', price: 160, category: 'MOMOS' },
  { name: 'Shezwan Momos', price: 180, category: 'MOMOS' },
  { name: 'Thandoori Momos', price: 190, category: 'MOMOS' },
  // PIZZA
  { name: 'Normal Pizza', price: 220, category: 'PIZZA' },
  { name: 'Periperi Pizza', price: 240, category: 'PIZZA' },
  { name: 'BBQ Pizza', price: 249, category: 'PIZZA' },
  { name: 'Paneer Pizza', price: 220, category: 'PIZZA' },
  { name: 'Mashroom Pizza', price: 230, category: 'PIZZA' },
  // SANDWICH
  { name: 'Normal Sand Wich', price: 99, category: 'SANDWICH' },
  { name: 'Club Special Sand Wich', price: 220, category: 'SANDWICH' },
  // PASTA
  { name: 'Pasta', price: 210, category: 'PASTA' },
  { name: 'Pasta Special', price: 260, category: 'PASTA' },
  // SHAKE
  { name: 'Chickoo', price: 60, category: 'SHAKE' },
  { name: 'Sharjah', price: 60, category: 'SHAKE' },
  { name: 'Apple', price: 80, category: 'SHAKE' },
  { name: 'Anar', price: 80, category: 'SHAKE' },
  { name: 'Coctail', price: 60, category: 'SHAKE' },
  { name: 'Butter', price: 80, category: 'SHAKE' },
  { name: 'Tender Coconut', price: 70, category: 'SHAKE' },
  { name: 'Ice Cream Shake', price: 80, category: 'SHAKE' },
  { name: 'Mango', price: 70, category: 'SHAKE' },
  { name: 'Dry Fruits', price: 90, category: 'SHAKE' },
  { name: 'Dates & Rosted Cashew', price: 120, category: 'SHAKE' },
  { name: 'Custerd Apple', price: 70, category: 'SHAKE' },
  { name: 'Blueberry', price: 100, category: 'SHAKE' },
  { name: 'Strawberry', price: 90, category: 'SHAKE' },
  { name: 'Berry Mix', price: 120, category: 'SHAKE' },
  { name: 'Galaxy Shake', price: 80, category: 'SHAKE' },
  { name: 'Orio', price: 70, category: 'SHAKE' },
  { name: 'Kitkat', price: 80, category: 'SHAKE' },
  { name: 'Gems', price: 80, category: 'SHAKE' },
  { name: 'Dragon Fruitf', price: 90, category: 'SHAKE' },
  // FRESH CREAM
  { name: 'Custerd Cream', price: 190, category: 'FRESH CREAM' },
  { name: 'Apple Craem', price: 190, category: 'FRESH CREAM' },
  { name: 'Dry Fruit Cream', price: 210, category: 'FRESH CREAM' },
  { name: 'Mango Cream', price: 190, category: 'FRESH CREAM' },
  { name: 'Berry Mix Cream', price: 240, category: 'FRESH CREAM' },
  { name: 'Mixed Fruit Cream', price: 220, category: 'FRESH CREAM' },
  { name: 'Fruit With Choco', price: 135, category: 'FRESH CREAM' },
  // FALOODA
  { name: 'Dry Fruit Falooda', price: 180, category: 'FALOODA' },
  { name: 'Normal Falooda', price: 120, category: 'FALOODA' },
  { name: 'Royal Falooda', price: 140, category: 'FALOODA' },
  { name: 'Special Falooda', price: 180, category: 'FALOODA' },
  { name: 'Chocolate Falooda', price: 180, category: 'FALOODA' },
  // ICE CREAM
  { name: 'Scoop', price: 40, category: 'ICE CREAM' },
  { name: 'Special Scoop', price: 90, category: 'ICE CREAM' },
  { name: 'Cake With Icecream', price: 160, category: 'ICE CREAM' },
  // MOJITTO
  { name: 'Blueberry', price: 80, category: 'MOJITTO' },
  { name: 'Strawberry', price: 80, category: 'MOJITTO' },
  { name: 'Green Apple', price: 80, category: 'MOJITTO' },
  { name: 'Passion Fruit', price: 80, category: 'MOJITTO' },
  { name: 'Blue Curago', price: 80, category: 'MOJITTO' },
  { name: 'Mint', price: 80, category: 'MOJITTO' },
  { name: 'Watermelon', price: 80, category: 'MOJITTO' },
  { name: 'Mango', price: 80, category: 'MOJITTO' },
  // LEMON
  { name: 'Fresh Lime', price: 20, category: 'LEMON' },
  { name: 'Mint Lemon', price: 25, category: 'LEMON' },
  { name: 'Passion Fruit Lime', price: 30, category: 'LEMON' },
  { name: 'Green Apple Lime', price: 30, category: 'LEMON' },
  { name: 'Flavors Lime', price: 30, category: 'LEMON' },
  // AVIL MILK
  { name: 'Avil Milk', price: 70, category: 'AVIL MILK' },
  { name: 'Avil Milk With Dry Fruits', price: 90, category: 'AVIL MILK' },
  { name: 'Avil Milk Special', price: 110, category: 'AVIL MILK' },
  // JUICE
  { name: 'Orange', price: 60, category: 'JUICE' },
  { name: 'Musambi', price: 60, category: 'JUICE' },
  { name: 'Pappaya', price: 60, category: 'JUICE' },
  { name: 'Grape', price: 60, category: 'JUICE' },
  { name: 'Anar', price: 60, category: 'JUICE' },
  { name: 'Watermilon', price: 60, category: 'JUICE' },
  { name: 'Pineapple', price: 60, category: 'JUICE' },
  { name: 'Mango', price: 60, category: 'JUICE' },
  // HOT
  { name: 'Coffee', price: 15, category: 'HOT' },
  { name: 'SP Coffee', price: 30, category: 'HOT' },
  { name: 'Tea', price: 15, category: 'HOT' },
  { name: 'Lemon Tea', price: 15, category: 'HOT' },
  { name: 'Boost', price: 20, category: 'HOT' },
  { name: 'Horlics', price: 20, category: 'HOT' },
  { name: 'Badam Milk', price: 25, category: 'HOT' },
  // SHAKE & TENDER COCONUT
  { name: 'Cashew With Tender', price: 90, category: 'SHAKE & TENDER COCONUT' },
  { name: 'Dry Fruits With Tender', price: 100, category: 'SHAKE & TENDER COCONUT' },
  { name: 'Boost With Tender', price: 80, category: 'SHAKE & TENDER COCONUT' },
  { name: 'Dates With Tender', price: 90, category: 'SHAKE & TENDER COCONUT' },
  { name: 'Badam With Tender', price: 90, category: 'SHAKE & TENDER COCONUT' },
  // CHICKEN ITEMS
  { name: 'Special Fried 1pcs', price: 140, category: 'CHICKEN ITEMS' },
  { name: 'Chicken Lolly Pop', price: 160, category: 'CHICKEN ITEMS' },
  { name: 'Periperi Dianamic', price: 180, category: 'CHICKEN ITEMS' },
  { name: 'Shezwan Wings', price: 160, category: 'CHICKEN ITEMS' },
  { name: 'CH Nugets', price: 140, category: 'CHICKEN ITEMS' },
  { name: 'Chicken Strip', price: 160, category: 'CHICKEN ITEMS' },
  { name: 'Pop Chick', price: 130, category: 'CHICKEN ITEMS' },
  { name: 'Chicken Wings Normal', price: 140, category: 'CHICKEN ITEMS' },
  // MAGGI
  { name: 'Maggi', price: 60, category: 'MAGGI' },
  { name: 'Maaggi Special', price: 90, category: 'MAGGI' },
  { name: 'Chees Maggi', price: 140, category: 'MAGGI' },
]

const categories = [...new Set(menuData.map(item => item.category))]

export default function WaiterPage() {
  const [tableNumber, setTableNumber] = useState('')
  const [waiterName, setWaiterName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [cart, setCart] = useState({})
  const [activeOrders, setActiveOrders] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load active orders for this waiter
  useEffect(() => {
    fetchActiveOrders()
    
    // Subscribe to order changes
    const channel = supabase
      .channel('waiter-orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchActiveOrders()
      )
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [waiterName])

  const fetchActiveOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .in('status', ['pending', 'preparing', 'ready'])
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setActiveOrders(data)
    }
  }

  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item.name]: {
        ...item,
        quantity: (prev[item.name]?.quantity || 0) + 1
      }
    }))
  }

  const removeFromCart = (itemName) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[itemName].quantity > 1) {
        newCart[itemName].quantity -= 1
      } else {
        delete newCart[itemName]
      }
      return newCart
    })
  }

  const clearCart = () => {
    setCart({})
  }

  const cartTotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleSubmit = async () => {
    if (!tableNumber.trim()) {
      toast.error('Please enter table number')
      return
    }
    if (!waiterName.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (Object.keys(cart).length === 0) {
      toast.error('Please add items to cart')
      return
    }

    setIsSubmitting(true)

    try {
      const orderCode = await generateOrderCode(supabase)
      
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_code: orderCode,
          table_number: tableNumber,
          waiter_name: waiterName,
          status: 'pending',
          total: cartTotal
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = Object.values(cart).map(item => ({
        order_id: orderData.id,
        item_name: item.name,
        item_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      toast.success(`Order ${orderCode} sent to kitchen!`)
      clearCart()
      fetchActiveOrders()
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('Failed to submit order. Please try again.')
    } finally {
      setIsSubmitting(false)
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
      fetchActiveOrders()
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Failed to cancel order')
    }
  }

  const filteredItems = menuData.filter(item => item.category === selectedCategory)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-accent">MUGLY CAFE</h1>
            <span className="text-muted text-sm">Waiter Station</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Table Number</label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g., T-01"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Waiter Name</label>
              <input
                type="text"
                value={waiterName}
                onChange={(e) => setWaiterName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 pb-24 lg:pb-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-thin sticky top-0 bg-background z-10 py-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-card border border-border text-foreground hover:border-accent'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {filteredItems.map(item => (
                <div
                  key={item.name}
                  className="bg-card border border-border rounded-lg p-2 sm:p-3 hover:border-accent transition-colors active:scale-95"
                >
                  <h3 className="text-xs sm:text-sm font-medium text-foreground mb-1 leading-tight">{item.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-accent font-bold text-sm">{formatCurrency(item.price)}</span>
                    <div className="flex items-center gap-1">
                      {cart[item.name] && (
                        <>
                          <button
                            onClick={() => removeFromCart(item.name)}
                            className="p-1.5 sm:p-1 rounded bg-border/50 text-foreground hover:bg-border active:bg-border/80"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-5 sm:w-6 text-center text-sm text-foreground font-medium">
                            {cart[item.name].quantity}
                          </span>
                        </>
                      )}
                      <button
                        onClick={() => addToCart(item)}
                        className="p-1.5 sm:p-1 rounded bg-accent text-accent-foreground hover:bg-accent/80 active:bg-accent/70"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar - Fixed on mobile, sticky on desktop */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg lg:sticky lg:top-4 fixed bottom-0 left-0 right-0 lg:relative z-20 lg:z-auto max-h-[50vh] lg:max-h-none overflow-y-auto">
              <div className="p-3 lg:p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-accent" size={18} />
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">Order Cart</h2>
                  {Object.keys(cart).length > 0 && (
                    <span className="ml-auto text-accent font-bold">{formatCurrency(cartTotal)}</span>
                  )}
                </div>
              </div>

              <div className="p-3 lg:p-4 max-h-32 lg:max-h-96 overflow-y-auto hidden lg:block">
                {Object.keys(cart).length === 0 ? (
                  <p className="text-muted text-center py-8">Your cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {Object.values(cart).map(item => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted">{formatCurrency(item.price)} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-accent font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.name)}
                            className="p-1 text-muted hover:text-cancelled"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile cart summary - always visible */}
              <div className="lg:hidden p-3 border-t border-border">
                {Object.keys(cart).length > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">{Object.keys(cart).length} items</span>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium flex items-center gap-2 hover:bg-accent/80 disabled:opacity-50 text-sm"
                    >
                      <Send size={16} />
                      {isSubmitting ? 'Sending...' : 'Send Order'}
                    </button>
                  </div>
                ) : (
                  <p className="text-muted text-center text-sm">Tap items to add to cart</p>
                )}
              </div>

              {Object.keys(cart).length > 0 && (
                <div className="hidden lg:block p-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-accent">{formatCurrency(cartTotal)}</span>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} />
                    {isSubmitting ? 'Sending...' : 'Send to Kitchen'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Active Orders</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOrders.map(order => (
                <div key={order.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-accent font-bold">{order.order_code}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="text-sm text-muted mb-2">
                    Table: {order.table_number} | {order.order_items?.length || 0} items
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-accent font-bold">{formatCurrency(order.total)}</span>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-muted" />
                      <span className="text-xs text-muted">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  {(order.status === 'pending' || order.status === 'preparing') && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="mt-3 w-full py-2 text-sm border border-cancelled/30 text-cancelled rounded hover:bg-cancelled/20 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
