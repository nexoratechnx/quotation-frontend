import "../styles/items-page.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchItems, fetchCategories, updateItem, deleteItem } from "../api/api";

export default function Items() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const initialPricesRef = useRef({});

  useEffect(() => {
    fetchCategories().then((data) => setCategories(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const itemsData = await fetchItems({ categoryId: categoryId || undefined });
        setItems(Array.isArray(itemsData) ? itemsData : []);
        const initial = {};
        itemsData?.forEach((it) => {
          initial[it.id] = Number(it.price);
        });
        initialPricesRef.current = initial;
      } catch (err) {
        console.error("Failed to load:", err);
        setError(err.message || "Failed to load items.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryId]);

  const updatePrice = (id, value) => {
    const num = value === "" ? 0 : Number(value) || 0;
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, price: num } : it))
    );
  };

  const getDirtyItems = () =>
    items.filter((it) => {
      const initial = initialPricesRef.current[it.id];
      return initial !== undefined && Number(it.price) !== initial;
    });

  const handleSave = async () => {
    const dirty = getDirtyItems();
    if (dirty.length === 0) {
      setSaveMessage("No changes to save.");
      setTimeout(() => setSaveMessage(null), 2000);
      return;
    }
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      for (const it of dirty) {
        await updateItem(it.id, {
          name: it.name,
          price: Number(it.price) || 0,
          categoryId: it.category?.id,
          unitType: it.unitType || "PCS",
          description: it.description || "",
        });
        initialPricesRef.current[it.id] = Number(it.price);
      }
      setSaveMessage(`Saved ${dirty.length} item(s).`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error("Save failed:", err);
      setError(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    setError(null);
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      delete initialPricesRef.current[id];
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err.message || "Failed to delete item.");
    }
  };

  return (
    <div className="items-page">
      <header className="items-header">
        <div className="items-header-left">
          <button
            type="button"
            className="items-back"
            onClick={() => navigate("/billing")}
            aria-label="Back to billing"
          >
            ← Back
          </button>
          <h1 className="items-title">Items</h1>
        </div>
        <div className="items-header-right">
          <button
            type="button"
            className="items-save-btn"
            onClick={handleSave}
            disabled={saving || getDirtyItems().length === 0}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {saveMessage && (
            <span className="items-save-msg" role="status">
              {saveMessage}
            </span>
          )}
        </div>
      </header>

      <section className="items-card">
        <div className="items-toolbar">
          <label className="items-filter-label">
            Category
            <select
              className="items-filter-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div className="items-error">
            <p>{error}</p>
          </div>
        )}

        <div className="items-table-wrap">
          {loading && (
            <div className="items-loading">
              <div className="items-spinner" />
              <p>Loading items...</p>
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="items-empty">
              {categoryId
                ? "No items in this category."
                : "No items yet. Add items from Billing."}
            </div>
          )}

          {!loading && items.length > 0 && (
            <table className="items-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Per</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td className="items-cell-name">{it.name}</td>
                    <td>{it.category?.name ?? "—"}</td>
                    <td className="items-cell-per">{it.unitType || "PCS"}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="items-price-input"
                        value={it.price == null ? "" : it.price}
                        onChange={(e) => updatePrice(it.id, e.target.value)}
                        aria-label={`Price for ${it.name}`}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="items-delete-btn"
                        onClick={() => handleDelete(it.id)}
                        aria-label={`Delete ${it.name}`}
                      >
                        Delete
                      </button>
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
