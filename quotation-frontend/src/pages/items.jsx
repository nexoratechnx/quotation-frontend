import "../styles/items-page.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchItems, fetchCategories, fetchPipeItems, fetchSteelItems, updateItem, deleteItem } from "../api/api";

export default function Items() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [pipeItems, setPipeItems] = useState([]);
  const [steelItems, setSteelItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
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
        const activeCategoryId = (activeTab === "ALL" || activeTab === "PIPES")
          ? undefined
          : categories.find((c) => c.name === activeTab)?.id;
        const [itemsData, pipeData, steelData] = await Promise.all([
          fetchItems({ categoryId: activeCategoryId }),
          fetchPipeItems().catch(() => []),
          fetchSteelItems().catch(() => []),
        ]);
        const normalItems = Array.isArray(itemsData) ? itemsData : [];
        setItems(normalItems);
        setPipeItems(Array.isArray(pipeData) ? pipeData : []);
        setSteelItems(Array.isArray(steelData) ? steelData : []);
        const initial = {};
        normalItems.forEach((it) => { initial[it.id] = Number(it.price); });
        initialPricesRef.current = initial;
      } catch (err) {
        console.error("Failed to load:", err);
        setError(err.message || "Failed to load items.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab, categories]);

  const updatePrice = (id, value) => {
    const num = value === "" ? 0 : Number(value) || 0;
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, price: num } : it)));
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

  const pipeVariants = [...new Set(pipeItems.map((p) => p.variant).filter(Boolean))];
  const pipeVariantTabs = pipeVariants.map((v) => `Pipe ${v}`);
  const steelTypes = [...new Set(steelItems.map((s) => s.type).filter(Boolean))];
  const steelTypeTabs = steelTypes.map((t) => `MS ${t}`);
  const categoryTabs = ["ALL", ...categories.map((c) => c.name), ...pipeVariantTabs, ...steelTypeTabs];

  const isPipeTab = activeTab.startsWith("Pipe ");
  const isSteelTab = activeTab.startsWith("MS ") && steelTypeTabs.includes(activeTab);
  const activeVariant = isPipeTab ? activeTab.replace("Pipe ", "") : null;
  const activeSteelType = isSteelTab ? activeTab.replace("MS ", "") : null;
  const visibleNormalItems = (isPipeTab || isSteelTab) ? [] : items;
  const visiblePipeItems = activeTab === "ALL"
    ? pipeItems
    : isPipeTab
      ? pipeItems.filter((p) => p.variant === activeVariant)
      : [];
  const visibleSteelItems = activeTab === "ALL"
    ? steelItems
    : isSteelTab
      ? steelItems.filter((s) => s.type === activeSteelType)
      : [];
  const totalCount = visibleNormalItems.length + visiblePipeItems.length + visibleSteelItems.length;

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
          {!loading && (
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              {items.length} item{items.length !== 1 ? 's' : ''}
              {visiblePipeItems.length > 0 && ` · ${visiblePipeItems.length} pipe variant${visiblePipeItems.length !== 1 ? 's' : ''}`}
              {visibleSteelItems.length > 0 && ` · ${visibleSteelItems.length} steel section${visibleSteelItems.length !== 1 ? 's' : ''}`}
            </span>
          )}
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
        {/* Category pill tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginBottom: '16px',
        }}>
          {categoryTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '5px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '20px',
                border: '1.5px solid',
                cursor: 'pointer',
                transition: 'all 0.15s',
                borderColor: activeTab === tab ? '#4f46e5' : '#e5e7eb',
                background: activeTab === tab ? '#4f46e5' : '#f9fafb',
                color: activeTab === tab ? '#fff' : '#374151',
              }}
            >
              {tab}
            </button>
          ))}
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

          {!loading && totalCount === 0 && (
            <div className="items-empty">
              {isPipeTab
                ? `No pipe variants found for ${activeVariant}.`
                : activeTab !== "ALL"
                  ? `No items in "${activeTab}" category.`
                  : "No items yet. Add items from Billing."}
            </div>
          )}

          {!loading && totalCount > 0 && (
            <table className="items-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category / Type</th>
                  <th>Per</th>
                  <th>Details</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* ── Regular items ── */}
                {visibleNormalItems.map((it) => (
                  <tr key={`item-${it.id}`}>
                    <td className="items-cell-name">{it.name}</td>
                    <td>{it.category?.name ?? "—"}</td>
                    <td className="items-cell-per">{it.unitType || "PCS"}</td>
                    <td style={{ color: '#9ca3af', fontSize: '12px' }}>—</td>
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

                {/* ── Pipe chart items ── */}
                {visiblePipeItems.map((p) => (
                  <tr key={`pipe-${p.id}`} style={{ background: '#fafbff' }}>
                    <td className="items-cell-name">
                      <span>{p.variant} {p.size}</span>
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '10px',
                        fontWeight: '600',
                        background: '#ede9fe',
                        color: '#6d28d9',
                        borderRadius: '4px',
                        padding: '1px 6px',
                        textTransform: 'uppercase',
                      }}>PIPE</span>
                    </td>
                    <td style={{ color: '#6b7280' }}>Pipe — {p.variant}</td>
                    <td className="items-cell-per">KG</td>
                    <td style={{ fontSize: '12px', color: '#6b7280' }}>
                      t:{p.thickness}mm · {p.weightPerMeter} kg/m
                    </td>
                    <td style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
                      Weight-based
                    </td>
                    <td style={{ fontSize: '12px', color: '#9ca3af' }}>—</td>
                  </tr>
                ))}

                {/* ── Steel chart items ── */}
                {visibleSteelItems.map((s) => (
                  <tr key={`steel-${s.id}`} style={{ background: '#f0fdf4' }}>
                    <td className="items-cell-name">
                      <span>MS {s.size}</span>
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '10px',
                        fontWeight: '600',
                        background: '#dcfce7',
                        color: '#15803d',
                        borderRadius: '4px',
                        padding: '1px 6px',
                        textTransform: 'uppercase',
                      }}>STEEL</span>
                    </td>
                    <td style={{ color: '#6b7280' }}>Steel — {s.type}</td>
                    <td className="items-cell-per">KG</td>
                    <td style={{ fontSize: '12px', color: '#6b7280' }}>
                      {Number(s.weightPerMeter).toFixed(3)} kg/m
                    </td>
                    <td style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
                      Weight-based
                    </td>
                    <td style={{ fontSize: '12px', color: '#9ca3af' }}>—</td>
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
