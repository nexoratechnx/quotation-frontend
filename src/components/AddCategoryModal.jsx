import "../styles/modal.css";
import { useEffect, useRef } from "react";

export default function AddCategoryModal({ onClose }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-title">Add Category</div>

        <div className="modal-body">
          <input ref={inputRef} className="input" placeholder="Category Name" />
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
