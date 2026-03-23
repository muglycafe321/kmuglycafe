'use client'

import { useState } from 'react'
import { Plus, Minus, Send, ShoppingCart, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/utils/formatCurrency'
import { generateOrderCode } from '@/utils/generateOrderCode'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCartDrawer, setShowCartDrawer] = useState(false)

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
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('Failed to submit order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredItems = menuData.filter(item => item.category === selectedCategory)

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <header className="bg-dark2 border-b border-gold/20 sticky top-0 z-[100]">
        <div className="max-w-[680px] mx-auto px-4 py-3">
          <h1 
            className="text-2xl font-bold text-gold text-center" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            MUGLY CAFÉ
          </h1>
          <p className="text-muted text-xs text-center uppercase tracking-wider mt-1">Waiter Station</p>
        </div>
      </header>

      {/* Table + Waiter Inputs */}
      <div className="max-w-[680px] mx-auto px-4 py-4 space-y-3">
        <div>
          <label className="block text-gold-light text-xs uppercase mb-1.5 tracking-wide">Table Number</label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="T-01"
            className="w-full h-[52px] px-4 bg-dark2 border border-[#3A3020] rounded-lg text-white placeholder-muted focus:outline-none focus:border-gold transition-colors"
            style={{ fontSize: '16px', fontFamily: 'DM Sans, sans-serif' }}
          />
        </div>
        <div>
          <label className="block text-gold-light text-xs uppercase mb-1.5 tracking-wide">Waiter Name</label>
          <input
            type="text"
            value={waiterName}
            onChange={(e) => setWaiterName(e.target.value)}
            placeholder="Your name"
            className="w-full h-[52px] px-4 bg-dark2 border border-[#3A3020] rounded-lg text-white placeholder-muted focus:outline-none focus:border-gold transition-colors"
            style={{ fontSize: '16px', fontFamily: 'DM Sans, sans-serif' }}
          />
        </div>
      </div>

      {/* Category Tabs - Sticky */}
      <div 
        className="sticky top-[90px] z-[90] bg-dark/97 backdrop-blur-sm border-b border-gold/20 overflow-x-auto scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex max-w-[680px] mx-auto px-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-3 text-xs uppercase font-medium whitespace-nowrap transition-all border-b-2 ${
                selectedCategory === category
                  ? 'text-gold-light border-gold'
                  : 'text-muted border-transparent hover:text-gold-light/70'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items List */}
      <div className="max-w-[680px] mx-auto px-0 pb-[100px] pt-4">
        {filteredItems.map(item => {
          const inCart = cart[item.name]
          return (
            <div
              key={item.name}
              className={`min-h-[64px] px-4 py-3 flex items-center justify-between transition-colors ${
                inCart ? 'bg-green-900/10' : 'bg-white/[0.02]'
              } border-b border-white/[0.05]`}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="text-white text-[15px] font-medium leading-tight truncate">{item.name}</div>
                <div className="text-gold text-[14px] font-semibold mt-0.5">{formatCurrency(item.price)}</div>
              </div>
              <div className="flex items-center gap-2">
                {!inCart ? (
                  <button
                    onClick={() => addToCart(item)}
                    className="w-11 h-11 rounded-full bg-gold text-dark flex items-center justify-center hover:bg-gold-light transition-colors active:scale-95"
                  >
                    <Plus size={22} strokeWidth={3} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFromCart(item.name)}
                      className="w-11 h-11 rounded-full bg-[#3A3020] text-white flex items-center justify-center hover:bg-[#4A4030] transition-colors active:scale-95"
                    >
                      <Minus size={20} strokeWidth={3} />
                    </button>
                    <span className="w-8 text-center text-white text-base font-bold">{inCart.quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-11 h-11 rounded-full bg-gold text-dark flex items-center justify-center hover:bg-gold-light transition-colors active:scale-95"
                    >
                      <Plus size={22} strokeWidth={3} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating Cart Bar */}
      {Object.keys(cart).length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[95]">
          <button
            onClick={() => setShowCartDrawer(true)}
            className="w-full h-16 bg-gold text-dark flex items-center justify-between px-5 font-semibold"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={22} strokeWidth={2.5} />
              <span className="text-base">
                {Object.keys(cart).length} {Object.keys(cart).length === 1 ? 'item' : 'items'} · ₹{cartTotal}
              </span>
            </div>
            <span className="text-sm font-medium">View Cart ›</span>
          </button>
        </div>
      )}

      {/* Cart Bottom Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-[110]">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCartDrawer(false)}
          />
          
          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 bg-dark2 rounded-t-[20px] max-h-[75vh] overflow-hidden flex flex-col">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-[#3A3020] rounded-full" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 border-b border-[#3A3020]">
              <div>
                <h2 className="text-white text-lg font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Your Order</h2>
                {tableNumber && (
                  <p className="text-muted text-xs mt-0.5">Table {tableNumber}</p>
                )}
              </div>
              <button 
                onClick={() => setShowCartDrawer(false)}
                className="w-9 h-9 flex items-center justify-center text-muted hover:text-white transition-colors"
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-4">
                {Object.values(cart).map(item => (
                  <div key={item.name} className="flex items-center justify-between py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{item.name}</p>
                      <p className="text-gold text-xs mt-0.5">{formatCurrency(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(item.name)}
                        className="w-9 h-9 rounded-full bg-[#3A3020] text-white flex items-center justify-center hover:bg-[#4A4030] transition-colors"
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>
                      <span className="w-7 text-center text-white text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-9 h-9 rounded-full bg-gold text-dark flex items-center justify-center hover:bg-gold-light transition-colors"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                      <span className="text-gold font-bold w-14 text-right text-sm">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#3A3020] bg-dark2">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-gold" style={{ fontFamily: 'Playfair Display, serif' }}>₹{cartTotal}</span>
              </div>
              <button
                onClick={() => {
                  handleSubmit()
                  setShowCartDrawer(false)
                }}
                disabled={isSubmitting}
                className="w-full h-14 bg-gold text-dark rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gold-light transition-colors disabled:opacity-50 text-base"
              >
                <Send size={20} strokeWidth={2.5} />
                {isSubmitting ? 'Sending...' : 'Send to Kitchen 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
