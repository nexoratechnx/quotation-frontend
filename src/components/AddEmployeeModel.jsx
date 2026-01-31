import "../styles/modal.css";
import { useEffect, useRef } from "react";

export default function AddEmployeeModal({ onClose }) {
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-title">Add Employee</div>

        <div className="modal-body">
          <input ref={nameRef} className="input" placeholder="Employee Name" />
        </div>

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onClose}>
            Cancel (Esc)
          </button>
          <button className="modal-btn primary">
            Save (Enter)
          </button>
        </div>
      </div>
    </div>
  );
}
