import "../styles/modal.css";
import { useEffect, useRef, useState } from "react";
import { addCategory } from "../api/api";

export default function AddCategoryModal({ onClose, onSaved }) {
  const inputRef = useRef(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);


  const handleSave = async () => {
    if (!name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      setLoading(true);

      const newCategory = await addCategory({
        name: name.trim()
      });

      onSaved?.(newCategory);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add category");
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
        <div className="modal-title">Add Category</div>

        <div className="modal-body">
          <input
            ref={inputRef}
            className="input"
            placeholder="Category Name"
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
