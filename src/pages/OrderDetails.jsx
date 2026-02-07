import "../styles/orderDetails.css";
import "../styles/print.css";
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
        console.error("Failed to load order:", err);
        setError(err.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
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
        <div className="order-details-loading">
          <div className="order-details-spinner" />
          <p>Loading order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details-page">
        <div className="order-details-error-card">
          <p>{error}</p>
          <button className="order-details-btn primary" onClick={() => navigate("/orders")}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="order-details-loading">
          <p>Loading order...</p>
        </div>
      </div>
    );
  }

  const statusClass = `order-status-badge status-${(order.status || "").toLowerCase()}`;

  return (
    <div className="order-details-page">
      {/* Screen layout */}
      <header className="order-details-header">
        <div className="order-details-header-left">
          <button
            type="button"
            className="order-details-back"
            onClick={() => navigate("/orders")}
            aria-label="Back to orders"
          >
            ← Back
          </button>
          <h1 className="order-details-title">Order #{order.orderNumber || order.id}</h1>
        </div>
        <div className="order-details-header-right">
          <span className="order-details-hint" role="status" aria-label="Keyboard shortcuts">
            Ctrl+P Print • Esc Back
          </span>
          <span className={statusClass}>{order.status}</span>
          <button type="button" className="order-details-btn primary" onClick={() => window.print()}>
            Print Invoice
          </button>
        </div>
      </header>

      <div className="order-details-grid">
        <section className="order-details-card order-details-info-card">
          <h2 className="order-details-card-title">Customer &amp; billing</h2>
          <dl className="order-details-dl">
            <div>
              <dt>Customer</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{order.customerPhone || "—"}</dd>
            </div>
            <div>
              <dt>Employee</dt>
              <dd>{order.employeeName || "—"}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{new Date(order.billingDate).toLocaleDateString("en-IN")}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className={statusClass}>{order.status}</span>
              </dd>
            </div>
          </dl>
        </section>

        <section className="order-details-card order-details-items-card">
          <h2 className="order-details-card-title">Items</h2>
          <div className="order-details-table-wrap">
            <table className="order-details-table">
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
                {order.items.map((item, index) => (
                  <tr key={`${item.itemId}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{item.itemName}</td>
                    <td>₹{Number(item.price).toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>₹{Number(item.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="order-details-card order-details-summary-card">
          <h2 className="order-details-card-title">Summary</h2>
          <div className="order-details-summary">
            <div className="order-details-summary-row">
              <span>Subtotal</span>
              <span>₹{Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="order-details-summary-row">
              <span>GST</span>
              <span>₹{Number(order.gstAmount).toFixed(2)}</span>
            </div>
            <div className="order-details-summary-row order-details-summary-total">
              <span>Total</span>
              <span>₹{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Print-only block: same structure as PrintInvoice so print.css shows it */}
      <div className="invoice-print print-only" aria-hidden="true">
        <div className="invoice-header">
          <h2>QUOTATION</h2>
          <div className="invoice-meta">
            <div><b>Customer:</b> {order.customerName}</div>
            <div><b>Phone:</b> {order.customerPhone || "—"}</div>
            <div><b>Employee:</b> {order.employeeName || "—"}</div>
            <div>
              <b>Date:</b> {new Date(order.billingDate).toLocaleDateString("en-IN")}
            </div>
            <div><b>Order:</b> #{order.orderNumber || order.id}</div>
            <div><b>Status:</b> {order.status}</div>
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
            {order.items.map((item, index) => (
              <tr key={`${item.itemId}-${index}`}>
                <td>{index + 1}</td>
                <td>{item.itemName}</td>
                <td>₹{Number(item.price).toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>₹{Number(item.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-summary">
          <div>
            <span>Subtotal</span>
            <span>₹{Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div>
            <span>GST</span>
            <span>₹{Number(order.gstAmount).toFixed(2)}</span>
          </div>
          <div className="invoice-total">
            <span>Total</span>
            <span>₹{Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="invoice-footer">
          <p>Thank you for your business</p>
        </div>
      </div>
    </div>
  );
}
