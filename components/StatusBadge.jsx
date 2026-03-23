'use client'

const statusColors = {
  pending: 'bg-pending/20 text-pending border-pending/30',
  preparing: 'bg-preparing/20 text-preparing border-preparing/30',
  ready: 'bg-ready/20 text-ready border-ready/30',
  served: 'bg-served/20 text-served border-served/30',
  cancelled: 'bg-cancelled/20 text-cancelled border-cancelled/30',
}

const statusLabels = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  cancelled: 'Cancelled',
}

export function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  )
}
