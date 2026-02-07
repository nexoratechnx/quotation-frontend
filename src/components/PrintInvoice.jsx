import { useEffect, useRef } from "react";

export default function PrintInvoice({
  customer,
  employee,
  items,
  subTotal,
  gstAmount,
  total,
  billingDate,
  isPreview,
  onAfterPrint
}) {
  const printContainerRef = useRef(null);

  useEffect(() => {
    console.log('🖨️ PrintInvoice mounted - isPreview:', isPreview);
    console.log('Customer:', customer?.name);
    console.log('Items count:', items?.length);
    console.log('Total:', total);
  }, [customer, items, total, isPreview]);

  useEffect(() => {
    if (!isPreview) {
      console.log('📋 Starting print process...');
      
      // Handle the print event
      const handlePrintEvent = () => {
        console.log('✅ Print dialog closed');
        setTimeout(() => {
          if (onAfterPrint) {
            console.log('🔄 Calling onAfterPrint callback');
            onAfterPrint();
          }
        }, 500);
      };
      
      // Wait for DOM to fully render before printing
      const timer = setTimeout(() => {
        console.log('🖨️ Calling window.print()');
        window.print();
      }, 1500);
      
      // Listen for print completion
      window.addEventListener('afterprint', handlePrintEvent);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('afterprint', handlePrintEvent);
      };
    }
  }, [isPreview, onAfterPrint]);

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
