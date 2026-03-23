let orderCounter = 0

export async function generateOrderCode(supabase) {
  // Get the latest order to determine the next code
  const { data, error } = await supabase
    .from('orders')
    .select('order_code')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error fetching latest order:', error)
    return `ORD-${String(orderCounter + 1).padStart(3, '0')}`
  }

  if (data && data.length > 0 && data[0].order_code) {
    const lastCode = data[0].order_code
    const lastNumber = parseInt(lastCode.replace('ORD-', ''))
    const nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1
    return `ORD-${String(nextNumber).padStart(3, '0')}`
  }

  return 'ORD-001'
}
