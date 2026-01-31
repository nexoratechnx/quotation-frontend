export default function PrintInvoice({
  customer,
  employee,
  items,
  subTotal,
  gstAmount,
  total,
  billingDate   
}) {
  return (
    <div className="invoice-print">

      {/* HEADER */}
      <div className="invoice-header">
        <h2>QUOTATION</h2>

        <div className="invoice-meta">
          <div><b>Customer:</b> {customer?.name}</div>
          <div><b>Phone:</b> {customer?.phone}</div>
          <div><b>Employee:</b> {employee?.name}</div>

          <div>
            <b>Date:</b>{" "}
            {billingDate
              ? new Date(billingDate).toLocaleDateString("en-IN")
              : ""}
          </div>
        </div>
      </div>

   
      <table className="invoice-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>₹{item.price.toFixed(2)}</td>
              <td>{item.qty}</td>
              <td>₹{(item.price * item.qty).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

    
      <div className="invoice-summary">
        <div>
          <span>Subtotal</span>
          <span>₹{subTotal.toFixed(2)}</span>
        </div>

        <div>
          <span>GST</span>
          <span>₹{gstAmount.toFixed(2)}</span>
        </div>

        <div className="invoice-total">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

  
      <div className="invoice-footer">
        <p>Thank you for your business</p>
      </div>

    </div>
  );
}
