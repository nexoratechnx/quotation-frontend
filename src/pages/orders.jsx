import "../styles/orders.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrders } from "../api/api";

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const listRef = useRef([]);
  const searchInputRef = useRef(null);

  const searchLower = (searchQuery || "").trim().toLowerCase();
  const filteredOrders =
    searchLower === ""
      ? orders
      : orders.filter((o) => {
          const customer = String(o.customerName || "").toLowerCase();
          const orderNum = String(o.orderNumber || o.id || "").toLowerCase();
          return customer.includes(searchLower) || orderNum.includes(searchLower);
        });

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOrders();
        setOrders(data || []);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError(err.message || "Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  useEffect(() => {
    setSelectedIndex((i) => Math.min(i, Math.max(0, filteredOrders.length - 1)));
  }, [filteredOrders.length]);

  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key === "ArrowDown" && filteredOrders.length) {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredOrders.length);
      }

      if (e.key === "ArrowUp" && filteredOrders.length) {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredOrders.length) % filteredOrders.length);
      }

      if (e.key === "Enter" && filteredOrders[selectedIndex]) {
        e.preventDefault();
        navigate(`/orders/${filteredOrders[selectedIndex].id}`);
      }

      if (e.key === "Escape") {
        e.preventDefault();
        navigate("/billing");
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [filteredOrders, selectedIndex, navigate]);

  return (
    <div className="orders-page">
      <header className="orders-header">
        <div className="orders-header-left">
          <button
            type="button"
            className="orders-back"
            onClick={() => navigate("/billing")}
            aria-label="Back to billing"
          >
            ← Back
          </button>
          <h1 className="orders-title">Orders</h1>
        </div>
        <div className="orders-header-right">
          <span className="orders-hint" role="status" aria-label="Keyboard shortcuts">
            ↑ ↓ Move • Enter Select • Esc Back
          </span>
        </div>
      </header>

      <section className="orders-card">
        <div className="orders-search-row">
          <input
            ref={searchInputRef}
            type="text"
            className="orders-search-input"
            placeholder="Search by customer name or order number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search orders"
          />
          {searchQuery && (
            <button
              type="button"
              className="orders-search-clear"
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <div className="orders-table-wrap">
          {loading && (
            <div className="orders-loading">
              <div className="orders-spinner" />
              <p>Loading orders...</p>
            </div>
          )}

          {error && (
            <div className="orders-error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && filteredOrders.length === 0 && (
            <div className="orders-empty">
              {orders.length === 0
                ? "No orders found"
                : `No orders match "${searchQuery}"`}
            </div>
          )}

          {!loading && !error && filteredOrders.length > 0 && (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    ref={(el) => (listRef.current[index] = el)}
                    className={index === selectedIndex ? "active" : ""}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    tabIndex={-1}
                    aria-selected={index === selectedIndex}
                  >
                    <td>{order.orderNumber || order.id}</td>
                    <td>{order.customerName}</td>
                    <td>{new Date(order.billingDate).toLocaleDateString("en-IN")}</td>
                    <td>₹{Number(order.total).toFixed(2)}</td>
                    <td>
                      <span className={`orders-status-badge status-${(order.status || "").toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
