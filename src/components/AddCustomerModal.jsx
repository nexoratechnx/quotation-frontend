import "../styles/modal.css";
import { useEffect, useRef, useState } from "react";
import { createCustomer } from "../api/api";

export default function AddCustomerModal({ onClose, onSaved }) {
  const nameRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gst: "",
    address: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  
  const handleSave = async () => {
    if (!form.name || !form.phone) {
      alert("Name and Phone are required");
      return;
    }

    try {
      setLoading(true);
      const savedCustomer = await createCustomer(form);
      onSaved(savedCustomer);
      onClose();
    } catch (err) {
      alert("Failed to add customer");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter") handleSave();
  };

  return (
    <div className="modal-overlay" onKeyDown={handleKeyDown}>
      <div className="modal-box">
        <div className="modal-title">Add Customer</div>

        <div className="modal-body">
          <input
            ref={nameRef}
            className="input"
            placeholder="Customer Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="input"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            className="input"
            placeholder="GST (optional)"
            value={form.gst}
            onChange={(e) => setForm({ ...form, gst: e.target.value })}
          />

          <textarea
            className="input"
            placeholder="Address (optional)"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onClose}>
            Cancel (Esc)
          </button>

          <button
            className="modal-btn primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save (Enter)"}
          </button>
        </div>
      </div>
    </div>
  );
}
