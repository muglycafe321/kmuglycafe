'use client'

import { useState } from 'react'
import { Clock, Printer, Trash2, ChefHat, CheckCircle, Utensils } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { CancelModal } from './CancelModal'
import { formatCurrency } from '@/utils/formatCurrency'
import { printReceipt } from '@/utils/printReceipt'

export function OrderCard({ order, orderItems, onStatusChange, onCancel }) {
  const [showCancelModal, setShowCancelModal] = useState(false)
  
  const elapsedTime = () => {
    const created = new Date(order.created_at)
    const now = new Date()
    const diff = Math.floor((now - created) / 1000 / 60) // minutes
    
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff} min ago`
    const hours = Math.floor(diff / 60)
    const mins = diff % 60
    return `${hours}h ${mins}m ago`
  }

  const canCancel = order.status === 'pending' || order.status === 'preparing'
  const isCancelled = order.status === 'cancelled'

  const statusActions = {
    pending: {
      label: 'Start Cooking',
      icon: ChefHat,
      nextStatus: 'preparing',
      color: 'bg-preparing hover:bg-preparing/80',
    },
    preparing: {
      label: 'Mark Ready',
      icon: CheckCircle,
      nextStatus: 'ready',
      color: 'bg-ready hover:bg-ready/80',
    },
    ready: {
      label: 'Mark Served',
      icon: Utensils,
      nextStatus: 'served',
      color: 'bg-served hover:bg-served/80',
    },
  }

  const currentAction = statusActions[order.status]

  return (
    <>
      <div className={`bg-card border border-border rounded-lg p-4 ${isCancelled ? 'opacity-50' : ''}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-accent font-bold">{order.order_code}</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted">
              <span>Table: <strong className="text-foreground">{order.table_number}</strong></span>
              <span>Waiter: <strong className="text-foreground">{order.waiter_name}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted text-sm">
            <Clock size={14} />
            <span>{elapsedTime()}</span>
          </div>
        </div>

        <div className="border-t border-border my-3 pt-3">
          <table className="w-full text-sm">
            <tbody>
              {orderItems.map((item) => (
                <tr key={item.id} className={isCancelled ? 'line-through text-muted' : ''}>
                  <td className="py-1 text-foreground">{item.item_name}</td>
                  <td className="py-1 text-center text-muted">x{item.quantity}</td>
                  <td className="py-1 text-right text-accent">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className={`font-bold text-lg ${isCancelled ? 'line-through text-muted' : 'text-accent'}`}>
            Total: {formatCurrency(order.total)}
          </span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => printReceipt(order, orderItems)}
              className="p-2 rounded-lg border border-border text-muted hover:text-foreground hover:bg-border/50 transition-colors"
              title="Print Bill"
            >
              <Printer size={18} />
            </button>
            
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="p-2 rounded-lg border border-cancelled/30 text-cancelled hover:bg-cancelled/20 transition-colors"
                title="Cancel Order"
              >
                <Trash2 size={18} />
              </button>
            )}
            
            {currentAction && (
              <button
                onClick={() => onStatusChange(order.id, currentAction.nextStatus)}
                className={`px-3 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-1 ${currentAction.color} transition-colors`}
              >
                <currentAction.icon size={16} />
                {currentAction.label}
              </button>
            )}
          </div>
        </div>
      </div>

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          onCancel(order.id)
          setShowCancelModal(false)
        }}
        orderCode={order.order_code}
        tableNumber={order.table_number}
      />
    </>
  )
}
