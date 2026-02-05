import "../styles/orderDetails.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOrderById } from "../api/api";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
        setError(err.message || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    
    loadOrder();
  }, [id]);


  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key === "Escape") {
        navigate("/orders");
      }

      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        window.print();
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [navigate]);

  if (loading) {
    return (
      <div className="order-details-page">
        <p className="loading-text">Loading order...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details-page">
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '4px',
          margin: '20px'
        }}>
          {error}
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => navigate('/orders')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <p className="loading-text">Loading order...</p>
      </div>
    );
  }

  return (
    <div className="order-details-page">

    
      <header className="order-details-header">
        <h2>Order #{order.id}</h2>
        <span className="hint">
          Ctrl + P Print • Esc Back
        </span>
      </header>

    
      <section className="order-info">
        <div><b>Customer:</b> {order.customerName}</div>
        <div><b>Phone:</b> {order.customerPhone || 'N/A'}</div>
        <div><b>Employee:</b> {order.employeeName || 'N/A'}</div>
        <div><b>Date:</b> {new Date(order.billingDate).toLocaleDateString('en-IN')}</div>
        <div><b>Status:</b> {order.status}</div>
      </section>

     
      <section className="order-items">
        <div className="order-items-head">
          <span>Item</span>
          <span>Price</span>
          <span>Qty</span>
          <span>Total</span>
        </div>

        {order.items.map((item) => (
          <div className="order-item-row" key={item.itemId}>
            <span>{item.itemName}</span>
            <span>₹{Number(item.price).toFixed(2)}</span>
            <span>{item.quantity}</span>
            <span>₹{Number(item.total).toFixed(2)}</span>
          </div>
        ))}
      </section>

   
      <section className="order-summary">
        <div>
          <span>Subtotal</span>
          <span>₹{Number(order.subtotal).toFixed(2)}</span>
        </div>
        <div>
          <span>GST</span>
          <span>₹{Number(order.gstAmount).toFixed(2)}</span>
        </div>
        <div className="order-summary-total">
          <span>Total</span>
          <span>₹{Number(order.total).toFixed(2)}</span>
        </div>
      </section>

     
      <div className="order-actions">
        <button className="print-btn" onClick={() => window.print()}>
          Print Invoice
        </button>
        <button
          className="secondary-btn"
          onClick={() => navigate("/orders")}
        >
          Back
        </button>
      </div>
    </div>
  );
}
