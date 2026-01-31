import "../styles/orders.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrders } from "../api/api";

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const listRef = useRef([]);

  
  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(console.error);
  }, []);


  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key === "ArrowDown" && orders.length) {
        setSelectedIndex((i) => (i + 1) % orders.length);
      }

      if (e.key === "ArrowUp" && orders.length) {
        setSelectedIndex((i) => (i - 1 + orders.length) % orders.length);
      }

      if (e.key === "Enter" && orders[selectedIndex]) {
        navigate(`/orders/${orders[selectedIndex].id}`);
      }

      if (e.key === "Escape") {
        navigate("/billing");
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [orders, selectedIndex, navigate]);

  return (
    <div className="orders-page">

    
      <header className="orders-header">
        <h2>Orders</h2>
        <span className="orders-hint">
          ↑ ↓ Navigate • Enter View • Esc Back
        </span>
      </header>

    
      <div className="orders-table">
        <div className="orders-row orders-head">
          <div>Order ID</div>
          <div>Customer</div>
          <div>Date</div>
          <div>Total</div>
          <div>Status</div>
        </div>

        {orders.length === 0 && (
          <div className="orders-empty">
            No orders found
          </div>
        )}

        {orders.map((order, index) => (
          <div
            key={order.id}
            ref={(el) => (listRef.current[index] = el)}
            className={`orders-row ${
              index === selectedIndex ? "active" : ""
            }`}
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            <div>{order.id}</div>
            <div>{order.customerName}</div>

            <div>
              {new Date(order.billingDate).toLocaleDateString("en-IN")}
            </div>

            <div>₹{order.total.toFixed(2)}</div>
            <div>{order.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
