import "../styles/billing.css";
import "../styles/customer.css";
import "../styles/items.css";
import "../styles/summary.css";
import "../styles/print.css";

import PrintInvoice from "../components/PrintInvoice.jsx";
import AddCustomerModal from "../components/AddCustomerModal.jsx";
import AddCategoryModal from "../components/addcategorymodal.jsx";
import AddItemModal from "../components/additemmodal.jsx";
import AddEmployeeModal from "../components/addemployeemodel.jsx";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchCustomers,
  fetchEmployees,
  fetchItems
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

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [items, setItems] = useState([]);
  const [gstEnabled, setGstEnabled] = useState(false);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  const [printNow, setPrintNow] = useState(false);

  const customerRef = useRef(null);
  const employeeRef = useRef(null);
  const itemSearchRef = useRef(null);
  const qtyRefs = useRef([]);

  useEffect(() => {
    fetchCustomers().then(setCustomers).catch(console.error);
    fetchEmployees().then(setEmployees).catch(console.error);
  }, []);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const subTotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const gstAmount = gstEnabled ? subTotal * 0.18 : 0;
  const finalTotal = subTotal + gstAmount;

  useEffect(() => {
    const handleKeys = (e) => {
      if (e.ctrlKey && e.key === "o") navigate("/orders");

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
      if (e.key === "Escape" && items.length && !showExitPopup) {
        setShowExitPopup(true);
      }

      if (showExitPopup) {
        if (["y", "Y"].includes(e.key)) resetBilling();
        if (["n", "N", "Escape"].includes(e.key)) setShowExitPopup(false);
      }
    };

    window.addEventListener("keydown", handleExit);
    return () => window.removeEventListener("keydown", handleExit);
  }, [showExitPopup, items.length]);

  const resetBilling = () => {
    setItems([]);
    setSelectedCustomer(null);
    setSelectedEmployee(null);
    setGstEnabled(false);
    setShowExitPopup(false);
    customerRef.current?.focus();
  };

  const handlePrint = () => {
    if (!selectedCustomer || !items.length) return;
    setPrintNow(true);
  };

  return (
    <div className="billing-page">
      <header className="billing-navbar">
        <div className="text-lg font-semibold text-blue-600">Quotation</div>
        <div className="ml-auto flex gap-4">
          <button className="billing-nav-btn" onClick={() => setShowAddCategory(true)}>Add Category</button>
          <button className="billing-nav-btn" onClick={() => setShowAddItem(true)}>Add Item</button>
          <button className="billing-nav-btn" onClick={() => setShowAddEmployee(true)}>Add Employee</button>
          <button className="billing-nav-btn" onClick={() => navigate("/orders")}>Orders</button>
          <button className="billing-nav-btn font-medium">Profile ⌄</button>
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
              if (e.key === "ArrowDown") setCustomerIndex(i => (i + 1) % customers.length);
              if (e.key === "ArrowUp") setCustomerIndex(i => (i - 1 + customers.length) % customers.length);
              if (e.key === "Enter" && customers[customerIndex]) {
                setSelectedCustomer(customers[customerIndex]);
                setShowCustomerDropdown(false);
                employeeRef.current?.focus();
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
              if (e.key === "ArrowDown") setEmployeeIndex(i => (i + 1) % employees.length);
              if (e.key === "ArrowUp") setEmployeeIndex(i => (i - 1 + employees.length) % employees.length);
              if (e.key === "Enter" && employees[employeeIndex]) {
                setSelectedEmployee(employees[employeeIndex]);
                setShowEmployeeDropdown(false);
                itemSearchRef.current?.focus();
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
                    itemSearchRef.current?.focus();
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

          <input
            ref={itemSearchRef}
            className="input mb-3"
            placeholder="Search item"
            onChange={async (e) => {
              const data = await fetchItems({ search: e.target.value });
              setItemsFromDb(data || []);
              setItemIndex(0);
              setShowItemDropdown(true);
            }}
          />

          {showItemDropdown && (
            <div className="item-dropdown">
              {itemsFromDb.map((it, i) => (
                <div
                  key={it.id}
                  className={`item-option ${i === itemIndex ? "bg-gray-100" : ""}`}
                  onMouseDown={() => {
                    setItems(p => [...p, { ...it, qty: 1 }]);
                    setShowItemDropdown(false);
                    setTimeout(() => qtyRefs.current[items.length]?.focus(), 0);
                  }}
                >
                  {it.name}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card col-span-12">
          <h2 className="card-title">Billing Summary</h2>

          <div className="summary-row"><span>Total Items</span><span>{totalItems}</span></div>
          <div className="summary-row"><span>Subtotal</span><span>₹{subTotal.toFixed(2)}</span></div>

          <div className="summary-row">
            <span>GST</span>
            <select
              className="input w-24"
              value={gstEnabled ? "yes" : "no"}
              onChange={(e) => setGstEnabled(e.target.value === "yes")}
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
            <button className="print-btn" onClick={handlePrint}>
              Print Receipt
            </button>
          </div>
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
          billingDate={new Date().toLocaleDateString()}
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
