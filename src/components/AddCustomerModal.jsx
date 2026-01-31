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


  useEffect(() => {
    nameRef.current?.focus();

    const handleKeys = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") handleSave();
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.phone) return;

    const savedCustomer = await createCustomer(form); // API-ready
    onSaved(savedCustomer); // auto-select in billing
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Add Customer</h3>

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

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel (Esc)
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save (Enter)
          </button>
        </div>
      </div>
    </div>
  );
}
