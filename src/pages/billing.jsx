import "../styles/billing.css";
import "../styles/customer.css";
import "../styles/items.css";
import "../styles/summary.css";
import "../styles/print.css";

import PrintInvoice from "../components/PrintInvoice.jsx";
import AddCustomerModal from "../components/AddCustomerModal.jsx";
import AddCategoryModal from "../components/AddCategoryModal.jsx";
import AddItemModal from "../components/AddItemModal.jsx";
import AddEmployeeModal from "../components/AddEmployeeModel.jsx";
import Logo from "../components/Logo.jsx";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchCustomers,
  fetchEmployees,
  fetchItems,
  fetchPipeItems,
  calculatePipeWeight,
  createOrder,
  updateOrderStatus,
  logout
} from "../api/api";

export default function Billing() {
  const navigate = useNavigate();

  const [showAddCustomer, setShowAddCustomer] = useState(false);

  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);

  const [customerIndex, setCustomerIndex] = useState(0);
  const [employeeIndex, setEmployeeIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);

  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [itemsFromDb, setItemsFromDb] = useState([]);
  const [pipeItemsFromDb, setPipeItemsFromDb] = useState([]);
  const [itemFilter, setItemFilter] = useState("");
  const [dropdownCategory, setDropdownCategory] = useState("ALL");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [items, setItems] = useState([]);
  const [gstEnabled, setGstEnabled] = useState(false);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const [printNow, setPrintNow] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);



  const customerRef = useRef(null);
  const employeeRef = useRef(null);
  const placeholderDropdownRef = useRef(null);
  const itemFilterInputRef = useRef(null);
  const unitValueRefs = useRef([]);
  const priceRefs = useRef([]);
  const deleteRefs = useRef([]);
  const gstSelectRef = useRef(null);
  const previewBtnRef = useRef(null);
  const printBtnRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (showItemDropdown && placeholderDropdownRef.current && !placeholderDropdownRef.current.contains(e.target)) {
        setShowItemDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileDropdown, showItemDropdown]);

  useEffect(() => {
    fetchCustomers().then(setCustomers).catch(console.error);
    fetchEmployees().then(setEmployees).catch(console.error);
    fetchItems({}).then((data) => setItemsFromDb(Array.isArray(data) ? data : [])).catch((err) => {
      console.error("Failed to load items:", err);
      setItemsFromDb([]);
    });
    fetchPipeItems().then((data) => setPipeItemsFromDb(Array.isArray(data) ? data : [])).catch((err) => {
      console.error("Failed to load pipe items:", err);
    });
  }, []);

  useEffect(() => {
    if (showItemDropdown) {
      setItemFilter("");
      setItemIndex(0);
      setDropdownCategory("ALL");
      setTimeout(() => itemFilterInputRef.current?.focus(), 0);
      fetchItems({}).then((data) => setItemsFromDb(Array.isArray(data) ? data : [])).catch((err) => {
        console.error("Failed to load items:", err);
      });
      fetchPipeItems().then((data) => setPipeItemsFromDb(Array.isArray(data) ? data : [])).catch((err) => {
        console.error("Failed to load pipe items:", err);
      });
    }
  }, [showItemDropdown]);

  useEffect(() => {
    customerRef.current?.focus();
  }, []);

  const subTotal = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const gstAmount = gstEnabled ? subTotal * 0.18 : 0;
  const finalTotal = subTotal + gstAmount;

  const itemCategories = [...new Set(itemsFromDb.map((it) => it.category?.name).filter(Boolean))];
  const pipeVariants = [...new Set(pipeItemsFromDb.map((p) => p.variant).filter(Boolean))];
  const pipeVariantTabs = pipeVariants.map((v) => `Pipe ${v}`);
  const categoryTabs = ["ALL", ...itemCategories, ...pipeVariantTabs];

  const allItemsForDropdown = [
    ...itemsFromDb,
    ...pipeItemsFromDb.map((p) => ({
      _isPipe: true,
      id: `pipe-${p.id}`,
      name: `${p.variant} ${p.size}`,
      displayName: `${p.variant} ${p.size} (t:${p.thickness}mm)`,
      variant: p.variant,
      size: p.size,
      thickness: p.thickness,
      weightPerMeter: p.weightPerMeter,
      unitType: "KG",
    }))
  ];

  const filteredItemsFromDb = allItemsForDropdown.filter((it) => {
    const matchesSearch = (it.displayName || it.name).toLowerCase().includes(itemFilter.toLowerCase());
    const matchesCategory =
      dropdownCategory === "ALL" ||
      (it._isPipe && dropdownCategory === `Pipe ${it.variant}`) ||
      (!it._isPipe && it.category?.name === dropdownCategory);
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const handleKeys = (e) => {
      if (e.ctrlKey && e.key === "o") {
        e.preventDefault();
        navigate("/orders");
      }
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        handlePrint();
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [navigate, items, selectedCustomer]);

  useEffect(() => {
    const handleExit = (e) => {
      if (e.key === "Escape" && showPreview) {
        e.preventDefault();
        e.stopPropagation();
        setShowPreview(false);
        return;
      }

      const noModalOpen = !showAddCustomer && !showAddItem && !showAddEmployee && !showAddCategory && !showPreview;
      const noDropdownOpen = !showCustomerDropdown && !showEmployeeDropdown && !showItemDropdown;
      if (e.key === "Escape" && items.length && !showExitPopup && noModalOpen && noDropdownOpen) {
        e.preventDefault();
        setShowExitPopup(true);
      }

      if (showExitPopup) {
        if (["y", "Y"].includes(e.key)) {
          e.preventDefault();
          resetBilling();
        }
        if (["n", "N", "Escape"].includes(e.key)) {
          e.preventDefault();
          setShowExitPopup(false);
        }
      }
    };

    window.addEventListener("keydown", handleExit);
    return () => window.removeEventListener("keydown", handleExit);
  }, [showExitPopup, items.length, showAddCustomer, showAddItem, showAddEmployee, showAddCategory, showPreview]);

  const resetBilling = () => {
    setItems([]);
    setSelectedCustomer(null);
    setSelectedEmployee(null);
    setGstEnabled(false);
    setShowExitPopup(false);
    setShowItemDropdown(false);
    customerRef.current?.focus();
  };

  const addItemToList = (it) => {
    if (it._isPipe) {
      setItems((prev) => [
        ...prev,
        {
          id: `${it.id}-${Date.now()}`,
          name: `${it.variant} ${it.size} (${it.thickness}mm)`,
          unitType: "KG",
          originalPrice: 0,
          price: 0,
          unitValue: 0,
          amount: 0,
          _isPipe: true,
          variant: it.variant,
          size: it.size,
          thickness: it.thickness,
          weightPerMeter: it.weightPerMeter,
          length: "",
          weight: 0,
        },
      ]);
    } else {
      const originalPrice = Number(it.price) || 0;
      const existing = items.find((i) => i.id === it.id);
      if (existing) {
        const newVal = (Number(existing.unitValue) || 0) + 1;
        const sellingPrice = Number(existing.price) || 0;
        setItems((prev) =>
          prev.map((i) =>
            i.id === it.id
              ? { ...i, unitValue: newVal, amount: newVal * sellingPrice }
              : i
          )
        );
      } else {
        const defaultQty = 1;
        setItems((prev) => [
          ...prev,
          {
            id: it.id,
            name: it.name,
            unitType: it.unitType || "PCS",
            originalPrice,
            price: originalPrice,
            unitValue: defaultQty,
            amount: defaultQty * originalPrice,
          },
        ]);
      }
    }
    setItemIndex(0);
    setItemFilter("");
    setTimeout(() => itemFilterInputRef.current?.focus(), 0);
  };

  const handlePipeLength = async (index, length) => {
    const next = [...items];
    const item = next[index];
    item.length = length;
    const lengthNum = Number(length) || 0;
    if (lengthNum > 0) {
      try {
        const result = await calculatePipeWeight({
          variant: item.variant,
          size: item.size,
          thickness: item.thickness,
          length: lengthNum,
        });
        const weight = Number(result.totalWeight) || 0;
        item.weight = weight;
        item.amount = weight * (Number(item.price) || 0);
      } catch (err) {
        console.error("Pipe weight calculation failed:", err);
      }
    } else {
      item.weight = 0;
      item.amount = 0;
    }
    setItems(next);
  };

  const updateItemUnitValue = (index, value) => {
    const num = value === "" ? 0 : Number(value) || 0;
    setItems((prev) => {
      const next = [...prev];
      const item = next[index];
      if (!item) return prev;
      item.unitValue = num;
      if (item._isPipe) {
        item.amount = (Number(item.weight) || 0) * (Number(item.price) || 0);
      } else {
        item.amount = num * (Number(item.price) || 0);
      }
      return next;
    });
  };

  const updateItemPrice = (index, value) => {
    const num = value === "" ? 0 : Number(value) || 0;
    setItems((prev) => {
      const next = [...prev];
      const item = next[index];
      if (!item) return prev;
      item.price = num;
      if (item._isPipe) {
        item.amount = (Number(item.weight) || 0) * num;
      } else {
        item.amount = (Number(item.unitValue) || 0) * num;
      }
      return next;
    });
  };

  const handlePrint = () => {
    if (!selectedCustomer || !items.length) return;
    setShowPreview(true);
  };

  const handleConfirmPrint = async () => {
    setOrderError(null);
    setSavingOrder(true);
    try {
      const orderData = {
        customerId: selectedCustomer.id,
        employeeId: selectedEmployee?.id || null,
        gstEnabled: gstEnabled,
        items: items.map((item) => ({
          itemId: item._isPipe ? null : item.id,
          isPipe: Boolean(item._isPipe),
          itemName: item._isPipe ? item.name : undefined,
          unitType: item._isPipe ? item.unitType : undefined,
          unitValue: item._isPipe ? (Number(item.weight) || 0) : (Number(item.unitValue) || 0),
          price: Number(item.price) || 0,
        })),
      };

      const savedOrder = await createOrder(orderData);
      console.log("✅ Order saved:", savedOrder);
      await updateOrderStatus(savedOrder.id, "PRINTED");
      setPrintNow(true);
      setShowPreview(false);
    } catch (error) {
      console.error('Failed to save order:', error);
      setOrderError(error.message || 'Failed to save order. Please try again.');
      alert(`Error: ${error.message || 'Failed to save order. Please try again.'}`);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleAfterPrint = () => {
    console.log('🔄 Print completed, resetting form');
    setPrintNow(false);
    setItems([]);
    setSelectedCustomer(null);
    setSelectedEmployee(null);
    setGstEnabled(false);
    setShowPreview(false);
    setOrderError(null);
  };

  return (
    <div className="billing-page">
      <header className="billing-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '100%' }}>
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '6px 0',
            marginTop: '7px',
          }}>
            <Logo height={52} />
          </div>
          <span style={{
            fontSize: '17px',
            fontWeight: '700',
            color: '#fff',
            letterSpacing: '0.02em',
            lineHeight: 1,
            position: 'relative',
            top: '-3px',   /* ↑↓ move up (negative) or down (positive) */
            left: '-18px', /* ←→ move left (negative) or right (positive) */
          }}>
            QuoteApp
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button className="billing-nav-btn" onClick={() => setShowAddCategory(true)}>+ Category</button>
          <button className="billing-nav-btn" onClick={() => setShowAddItem(true)}>+ Item</button>
          <button className="billing-nav-btn" onClick={() => setShowAddEmployee(true)}>+ Employee</button>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
          <button className="billing-nav-btn" onClick={() => navigate("/items")}>Items</button>
          <button className="billing-nav-btn" onClick={() => navigate("/orders")}>Orders</button>
          <div className="relative" ref={profileRef}>
            <button
              className="billing-nav-btn"
              onClick={() => setShowProfileDropdown((v) => !v)}
              aria-expanded={showProfileDropdown}
              aria-haspopup="true"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
            >
              👤 Profile
            </button>
            {showProfileDropdown && (
              <div className="dropdown profile-dropdown">
                <button
                  className="dropdown-item text-left w-full"
                  onMouseDown={() => {
                    logout();
                    navigate("/");
                    setShowProfileDropdown(false);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="billing-content">
        <section className="card col-span-4 relative">
          <h2 className="card-title">Customer Details</h2>

          <input
            ref={customerRef}
            className="input mb-3"
            placeholder="Customer Name"
            value={selectedCustomer?.name || ""}
            onFocus={() => setShowCustomerDropdown(true)}
            onKeyDown={(e) => {
              if (showCustomerDropdown) {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setCustomerIndex(i => (i + 1) % customers.length);
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setCustomerIndex(i => (i - 1 + customers.length) % customers.length);
                }
                if (e.key === "Enter" && customers[customerIndex]) {
                  e.preventDefault();
                  setSelectedCustomer(customers[customerIndex]);
                  setShowCustomerDropdown(false);
                  employeeRef.current?.focus();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCustomerDropdown(false);
                }
              }
            }}
          />

          {showCustomerDropdown && (
            <div className="dropdown">
              <div
                className="dropdown-item create"
                onMouseDown={() => setShowAddCustomer(true)}
              >
                + Add New Customer
              </div>

              {customers.map((c, i) => (
                <div
                  key={c.id}
                  className={`dropdown-item ${i === customerIndex ? "bg-gray-100" : ""}`}
                  onMouseDown={() => {
                    setSelectedCustomer(c);
                    setShowCustomerDropdown(false);
                    employeeRef.current?.focus();
                  }}
                >
                  {c.name}
                </div>
              ))}
            </div>
          )}

          <input className="input bg-gray-100" value={selectedCustomer?.phone || ""} disabled />

          <input
            ref={employeeRef}
            className="input mt-3"
            placeholder="Employee"
            value={selectedEmployee?.name || ""}
            onFocus={() => setShowEmployeeDropdown(true)}
            onKeyDown={(e) => {
              if (showEmployeeDropdown) {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (employees.length) {
                    setEmployeeIndex(i => (i + 1) % employees.length);
                  }
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (employees.length) {
                    setEmployeeIndex(i => (i - 1 + employees.length) % employees.length);
                  }
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (employees.length && employees[employeeIndex]) {
                    setSelectedEmployee(employees[employeeIndex]);
                  }
                  setShowEmployeeDropdown(false);
                  placeholderDropdownRef.current?.focus();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowEmployeeDropdown(false);
                  placeholderDropdownRef.current?.focus();
                }
              } else if (e.key === "Enter" || e.key === "ArrowDown") {
                e.preventDefault();
                placeholderDropdownRef.current?.focus();
              }
            }}
          />

          {showEmployeeDropdown && (
            <div className="dropdown">
              {employees.map((e, i) => (
                <div
                  key={e.id}
                  className={`dropdown-item ${i === employeeIndex ? "bg-gray-100" : ""}`}
                  onMouseDown={() => {
                    setSelectedEmployee(e);
                    setShowEmployeeDropdown(false);
                    placeholderDropdownRef.current?.focus();
                  }}
                >
                  {e.name}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card col-span-8 relative">
          <h2 className="card-title">Item List</h2>

          {items.length > 0 && (
            <div className="item-row item-row-head">
              <div className="item-col-name">Name</div>
              <div className="item-col-qty">Qty</div>
              <div className="item-col-weight">Weight</div>
              <div className="item-col-price">Price</div>
              <div className="item-col-unit">Unit</div>
              <div className="item-col-amount">Amount</div>
              <div className="item-col-eye" aria-hidden="true" />
              <div className="item-col-action">Action</div>
            </div>
          )}
          {items.map((item, index) => (
            <div className="item-row" key={`${item.id}-${index}`}>
              <div className="item-col-name" style={{ overflow: 'hidden' }}>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                {item._isPipe && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>Length:</span>
                    <input
                      className="qty-input"
                      type="number"
                      min="0"
                      step="0.01"
                      style={{ width: '64px', fontSize: '12px', padding: '3px 6px' }}
                      placeholder="m"
                      value={item.length}
                      onChange={(e) => handlePipeLength(index, e.target.value)}
                    />
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}></span>
                  </div>
                )}
              </div>
              <div className="item-col-qty">
                <input
                  ref={(el) => (unitValueRefs.current[index] = el)}
                  className="qty-input"
                  type="number"
                  min="0"
                  placeholder="Qty"
                  step={["KG", "SQFT"].includes(item.unitType) ? "0.01" : "1"}
                  value={item.unitValue == null ? "" : item.unitValue}
                  onChange={(e) => updateItemUnitValue(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      gstSelectRef.current?.focus();
                      return;
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      priceRefs.current[index]?.focus();
                    }
                    if (e.key === "ArrowUp" && index === 0) {
                      e.preventDefault();
                      placeholderDropdownRef.current?.focus();
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      unitValueRefs.current[index - 1]?.focus();
                    }
                  }}
                />
              </div>
              <div className="item-col-weight">
                {item._isPipe ? (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#4f46e5' }}>
                      {item.weight ? Number(item.weight).toFixed(2) : '—'}
                    </span>
                    {item.weight > 0 && <span style={{ fontSize: '10px', color: '#9ca3af', marginLeft: '2px' }}>KG</span>}
                  </div>
                ) : (
                  <span style={{ fontSize: '13px', color: '#d1d5db', display: 'block', textAlign: 'right' }}>—</span>
                )}
              </div>
              <div className="item-col-price">
                <input
                  ref={(el) => (priceRefs.current[index] = el)}
                  className="item-input item-input-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price == null ? "" : item.price}
                  onChange={(e) => updateItemPrice(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      gstSelectRef.current?.focus();
                      return;
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      deleteRefs.current[index]?.focus();
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      unitValueRefs.current[index]?.focus();
                    }
                  }}
                />
              </div>
              <div className="item-col-unit item-col-unit-readonly">{item.unitType || "PCS"}</div>
              <div className="item-col-amount">₹{(Number(item.amount) || 0).toFixed(2)}</div>
              <div className="item-col-eye">
                <span
                  className="price-eye-btn"
                  title={`Original: ₹${Number(item.originalPrice ?? item.price).toFixed(2)} | Selling: ₹${Number(item.price).toFixed(2)}`}
                  aria-label="View original and selling price"
                >
                  👁
                </span>
              </div>
              <div className="item-col-action">
                <button
                  ref={(el) => (deleteRefs.current[index] = el)}
                  type="button"
                  className="delete-btn"
                  onClick={() => {
                    const hasMore = items.length > 1;
                    const nextIndex =
                      !hasMore ? -1 : index < items.length - 1 ? index : index - 1;

                    setItems((prev) => prev.filter((_, i) => i !== index));

                    setTimeout(() => {
                      if (nextIndex >= 0) {
                        unitValueRefs.current[nextIndex]?.focus();
                      } else {
                        gstSelectRef.current?.focus();
                      }
                    }, 0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      gstSelectRef.current?.focus();
                      return;
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (index < items.length - 1) {
                        unitValueRefs.current[index + 1]?.focus();
                      } else {
                        gstSelectRef.current?.focus();
                      }
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      priceRefs.current[index]?.focus();
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          <div className="item-placeholder-wrap" ref={placeholderDropdownRef} tabIndex={-1}>
            <button
              type="button"
              className="item-placeholder-btn"
              onClick={() => setShowItemDropdown((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowItemDropdown(false);
                  gstSelectRef.current?.focus();
                  return;
                }
                if (e.key === "ArrowUp" && items.length > 0) {
                  e.preventDefault();
                  unitValueRefs.current[items.length - 1]?.focus();
                }
              }}
            >
              Search & Select Item
            </button>
            {showItemDropdown && (
              <div className="item-dropdown">
                <input
                  ref={itemFilterInputRef}
                  type="text"
                  className="input item-dropdown-filter"
                  placeholder="Type to filter..."
                  value={itemFilter}
                  onChange={(e) => {
                    setItemFilter(e.target.value);
                    setItemIndex(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowItemDropdown(false);
                      gstSelectRef.current?.focus();
                      return;
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setItemIndex((i) => (i + 1) % Math.max(1, filteredItemsFromDb.length));
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setItemIndex((i) => (i - 1 + filteredItemsFromDb.length) % Math.max(1, filteredItemsFromDb.length));
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const it = filteredItemsFromDb[itemIndex];
                      if (it) addItemToList(it);
                    }
                  }}
                />
                {/* Category filter pills */}
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  padding: '6px 8px',
                  overflowX: 'auto',
                  borderBottom: '1px solid #f3f4f6',
                  position: 'sticky',
                  top: '38px',
                  background: '#fff',
                  zIndex: 1,
                }}>
                  {categoryTabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setDropdownCategory(tab);
                        setItemIndex(0);
                      }}
                      style={{
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: 500,
                        borderRadius: '20px',
                        border: '1px solid',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        borderColor: dropdownCategory === tab ? '#4f46e5' : '#e5e7eb',
                        background: dropdownCategory === tab ? '#4f46e5' : '#f9fafb',
                        color: dropdownCategory === tab ? '#fff' : '#374151',
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {filteredItemsFromDb.map((it, i) => (
                  <div
                    key={it.id}
                    className={`item-option ${i === itemIndex ? "bg-gray-100" : ""}`}
                    onMouseDown={() => addItemToList(it)}
                  >
                    {it._isPipe ? (
                      <span>
                        <span style={{ fontWeight: 500 }}>{it.variant} {it.size}</span>
                        <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '6px' }}>t:{it.thickness}mm</span>
                      </span>
                    ) : it.name}
                  </div>
                ))}
                {filteredItemsFromDb.length === 0 && (
                  <div className="item-option text-gray-500">No items match</div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="card col-span-12">
          <h2 className="card-title">Billing Summary</h2>

          <div className="summary-row"><span>Subtotal</span><span>₹{subTotal.toFixed(2)}</span></div>

          <div className="summary-row">
            <span>GST</span>
            <select
              ref={gstSelectRef}
              className="input w-24"
              value={gstEnabled ? "yes" : "no"}
              onChange={(e) => setGstEnabled(e.target.value === "yes")}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  previewBtnRef.current?.focus();
                }
                if (e.key === "ArrowUp" && items.length) {
                  e.preventDefault();
                  unitValueRefs.current[items.length - 1]?.focus();
                }
              }}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>

          <div className="mt-4 text-right">
            <button
              ref={previewBtnRef}
              type="button"
              className="print-btn"
              onClick={handlePrint}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (showPreview) printBtnRef.current?.focus();
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  gstSelectRef.current?.focus();
                }
              }}
            >
              Preview
            </button>
          </div>

          {showPreview && (
            <div className="preview-container" style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <PrintInvoice
                customer={selectedCustomer}
                employee={selectedEmployee}
                items={items}
                subTotal={subTotal}
                gstAmount={gstAmount}
                total={finalTotal}
                billingDate={new Date()}
                isPreview={true}
              />
              <button
                ref={printBtnRef}
                type="button"
                className="print-btn"
                onClick={handleConfirmPrint}
                disabled={savingOrder}
                style={{ marginTop: '20px', opacity: savingOrder ? 0.6 : 1, cursor: savingOrder ? 'not-allowed' : 'pointer' }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    previewBtnRef.current?.focus();
                  }
                }}
              >
                {savingOrder ? 'Saving...' : 'Print'}
              </button>
              <button
                className="print-btn"
                onClick={() => setShowPreview(false)}
                style={{ marginTop: '20px', marginLeft: '10px', backgroundColor: '#999' }}
              >
                Cancel
              </button>
              {orderError && (
                <div style={{
                  padding: '10px',
                  marginTop: '10px',
                  backgroundColor: '#fee',
                  color: '#c33',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  {orderError}
                </div>
              )}
            </div>
          )}

        </section>
      </main>

      {showAddCustomer && (
        <AddCustomerModal
          onClose={() => setShowAddCustomer(false)}
          onSaved={(customer) => {
            setCustomers(p => [customer, ...p]);
            setSelectedCustomer(customer);
            employeeRef.current?.focus();
          }}
        />
      )}

      {showAddCategory && <AddCategoryModal onClose={() => setShowAddCategory(false)} />}
      {showAddItem && <AddItemModal onClose={() => setShowAddItem(false)} />}
      {showAddEmployee && <AddEmployeeModal onClose={() => setShowAddEmployee(false)} />}

      {printNow && (
        <PrintInvoice
          customer={selectedCustomer}
          employee={selectedEmployee}
          items={items}
          subTotal={subTotal}
          gstAmount={gstAmount}
          total={finalTotal}
          billingDate={new Date()}
          isPreview={false}
          onAfterPrint={() => {
            setPrintNow(false);
            resetBilling();
          }}
        />
      )}

      {showExitPopup && (
        <div className="exit-overlay">
          <div className="exit-box">
            <p>Exit billing for this customer?</p>
            <div className="exit-hint">
              Press <b>Y</b> = Yes | <b>N</b> / <b>Esc</b> = No
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
