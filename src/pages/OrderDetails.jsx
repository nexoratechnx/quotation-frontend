import "../styles/orderDetails.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOrderById } from "../api/api";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);


  useEffect(() => {
    fetchOrderById(id).then(setOrder);
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
        <div><b>Phone:</b> {order.customerPhone}</div>
        <div><b>Employee:</b> {order.employeeName}</div>
        <div><b>Date:</b> {order.date}</div>
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
          <div className="order-item-row" key={item.id}>
            <span>{item.name}</span>
            <span>₹{item.price}</span>
            <span>{item.qty}</span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}
      </section>

   
      <section className="order-summary">
        <div>
          <span>Subtotal</span>
          <span>₹{order.subTotal}</span>
        </div>
        <div>
          <span>GST</span>
          <span>₹{order.gstAmount}</span>
        </div>
        <div className="order-summary-total">
          <span>Total</span>
          <span>₹{order.total}</span>
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
