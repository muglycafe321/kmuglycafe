export interface Table {
  id: string
  table_number: string
  status: 'free' | 'occupied'
}

export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  available: boolean
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'

export interface Order {
  id: string
  order_code: string
  table_number: string
  waiter_name: string
  status: OrderStatus
  total: number
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  item_name: string
  item_price: number
  quantity: number
  subtotal: number
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
}
