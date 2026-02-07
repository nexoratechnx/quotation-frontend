import "../styles/modal.css";
import { useEffect, useRef, useState } from "react";
import { addItem, fetchCategories } from "../api/api";

export default function AddItemModal({ onClose, onSaved }) {
  const nameRef = useRef(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(console.error);

    nameRef.current?.focus();
  }, []);


  const handleSave = async () => {
    if (!name || !price || !categoryId) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const newItem = await addItem({
        name,
        price: Number(price),
        categoryId
      });

      onSaved?.(newItem);
      onClose();
    } catch (err) {
      alert("Failed to add item");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onKeyDown={handleKeyDown}>
      <div className="modal-box">
        <div className="modal-title">Add Item</div>

        <div className="modal-body">
          <input
            ref={nameRef}
            className="input"
            placeholder="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input"
            placeholder="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <select
            className="input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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
