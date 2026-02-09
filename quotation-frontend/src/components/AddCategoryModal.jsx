import "../styles/modal.css";
import { useEffect, useRef, useState } from "react";
import { addCategory, fetchCategories, deleteCategory } from "../api/api";

export default function AddCategoryModal({ onClose, onSaved }) {
  const inputRef = useRef(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setError("Failed to load categories");
      });
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const newCategory = await addCategory({
        name: name.trim(),
      });

      setCategories((prev) => [newCategory, ...prev]);
      setName("");
      onSaved?.(newCategory);
    } catch (err) {
      console.error(err);
      alert("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("Failed to delete category");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    }
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

          {error && (
            <div style={{ fontSize: "12px", color: "#b91c1c", marginTop: "4px" }}>
              {error}
            </div>
          )}

          {categories.length > 0 && (
            <div
              style={{
                maxHeight: "220px",
                overflowY: "auto",
                marginTop: "10px",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "8px",
              }}
            >
              {categories.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    padding: "4px 0",
                  }}
                >
                  <span>{c.name}</span>
                  <button
                    type="button"
                    className="modal-btn"
                    style={{
                      padding: "2px 8px",
                      fontSize: "12px",
                      background: "#fee2e2",
                      color: "#b91c1c",
                    }}
                    onClick={() => handleDelete(c.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onClose}>
            Close (Esc)
          </button>

          <button
            className="modal-btn primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
