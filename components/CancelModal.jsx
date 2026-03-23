'use client'

import { X } from 'lucide-react'

export function CancelModal({ isOpen, onClose, onConfirm, orderCode, tableNumber }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Cancel Order</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-muted mb-6">
          Are you sure you want to cancel order <strong className="text-foreground">{orderCode}</strong> for table <strong className="text-foreground">{tableNumber}</strong>?
          <br /><br />
          This action cannot be undone.
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-border/50 transition-colors"
          >
            No, Keep Order
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-cancelled text-white hover:bg-cancelled/80 transition-colors"
          >
            Yes, Cancel Order
          </button>
        </div>
      </div>
    </div>
  )
}
