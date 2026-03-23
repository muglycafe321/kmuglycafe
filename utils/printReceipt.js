export function printReceipt(order, orderItems) {
  const receiptWindow = window.open('', '_blank', 'width=400,height=600')
  
  if (!receiptWindow) {
    alert('Please allow popups to print receipts')
    return
  }

  const date = new Date(order.created_at).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="text-align: left; padding: 2px 0;">${item.item_name}</td>
      <td style="text-align: center; padding: 2px 0;">${item.quantity}</td>
      <td style="text-align: right; padding: 2px 0;">${item.subtotal}</td>
    </tr>
  `).join('')

  const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Receipt - ${order.order_code}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      line-height: 1.4;
      width: 80mm;
      padding: 8px;
      background: white;
      color: black;
    }
    .header {
      text-align: center;
      margin-bottom: 8px;
    }
    .header h1 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .header p {
      font-size: 10px;
      margin: 2px 0;
    }
    .divider {
      border-top: 1px dashed black;
      margin: 8px 0;
    }
    .order-info {
      margin: 8px 0;
    }
    .order-info p {
      margin: 2px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
    }
    th {
      text-align: left;
      border-bottom: 1px solid black;
      padding: 4px 0;
      font-weight: bold;
    }
    .total {
      font-size: 14px;
      font-weight: bold;
      text-align: right;
      margin: 8px 0;
      border-top: 1px solid black;
      padding-top: 8px;
    }
    .footer {
      text-align: center;
      margin-top: 12px;
      font-size: 10px;
    }
    .footer p {
      margin: 2px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>MUGLY CAFE</h1>
    <p>Municipality Office Building</p>
    <p>Kuthuparamba</p>
    <p>Tel: 7025212122</p>
  </div>
  
  <div class="divider"></div>
  
  <div class="order-info">
    <p><strong>Order:</strong> ${order.order_code}</p>
    <p><strong>Table:</strong> ${order.table_number}</p>
    <p><strong>Waiter:</strong> ${order.waiter_name}</p>
    <p><strong>Date:</strong> ${date}</p>
  </div>
  
  <div class="divider"></div>
  
  <table>
    <thead>
      <tr>
        <th style="width: 55%;">Item</th>
        <th style="width: 15%; text-align: center;">Qty</th>
        <th style="width: 30%; text-align: right;">Amt</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>
  
  <div class="divider"></div>
  
  <div class="total">
    TOTAL: ₹${order.total}
  </div>
  
  <div class="divider"></div>
  
  <div class="footer">
    <p>Home Delivery within 3km</p>
    <p>Thank You! Visit Again</p>
  </div>
</body>
</html>
  `

  receiptWindow.document.write(receiptHtml)
  receiptWindow.document.close()
  
  setTimeout(() => {
    receiptWindow.print()
  }, 400)
}
