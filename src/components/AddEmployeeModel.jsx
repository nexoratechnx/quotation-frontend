import "../styles/modal.css";
import { useEffect, useRef, useState } from "react";
import { addEmployee } from "../api/api";

export default function AddEmployeeModal({ onClose, onSaved }) {
  const nameRef = useRef(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);


  const handleSave = async () => {
    if (!name.trim()) {
      alert("Employee name is required");
      return;
    }

    try {
      setLoading(true);

      const newEmployee = await addEmployee({
        name: name.trim()
      });

      onSaved?.(newEmployee);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add employee");
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
        <div className="modal-title">Add Employee</div>

        <div className="modal-body">
          <input
            ref={nameRef}
            className="input"
            placeholder="Employee Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
