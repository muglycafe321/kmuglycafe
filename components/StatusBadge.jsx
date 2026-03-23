'use client'

const statusColors = {
  pending: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  preparing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ready: 'bg-green-500/20 text-green-400 border-green-500/30',
  served: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
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
