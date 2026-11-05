import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "./AppContext.jsx";
import {
  CONSUMABLES_CATALOGUE,
  SUPPLIERS,
  SUPPLIER_LIST,
  CONSUMABLES_CATEGORIES,
  getBranchSupplierAccount,
} from "./consumablesCatalogue.js";
import {
  submitConsumablesOrder,
  fetchConsumablesOrders,
  retryConsumablesOrderEmail,
  fetchConsumablesCatalogue,
} from "./api.js";
import "./ConsumablesOrderingPage.css";

// SVG Fallback product illustrations
function FallbackProductIcon({ type }) {
  switch (type) {
    case "bottleAmber":
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <rect x="30" y="10" width="20" height="10" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
          <path d="M24 24 C24 20, 56 20, 56 24 L58 68 C58 72, 22 72, 22 68 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" />
          <rect x="28" y="34" width="24" height="24" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
          <line x1="32" y1="42" x2="48" y2="42" stroke="#92400e" strokeWidth="1.5" />
          <line x1="32" y1="48" x2="44" y2="48" stroke="#92400e" strokeWidth="1.5" />
        </svg>
      );
    case "splitBox":
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <rect x="14" y="16" width="52" height="48" rx="6" fill="#f1f5f9" stroke="#0284c7" strokeWidth="2.5" />
          <line x1="40" y1="16" x2="40" y2="64" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 3" />
          <rect x="20" y="24" width="14" height="12" rx="3" fill="#bae6fd" />
          <rect x="46" y="24" width="14" height="12" rx="3" fill="#0284c7" />
        </svg>
      );
    case "cassette28":
    case "dosette7":
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <rect x="10" y="15" width="60" height="50" rx="8" fill="#ccfbf1" stroke="#0d9488" strokeWidth="2.5" />
          <line x1="40" y1="15" x2="40" y2="65" stroke="#0d9488" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="10" y1="40" x2="70" y2="40" stroke="#0d9488" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );
    case "crusher":
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <circle cx="40" cy="40" r="28" fill="#fef3c7" stroke="#d97706" strokeWidth="2.5" />
          <path d="M26 40 L54 40" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
          <circle cx="40" cy="40" r="10" fill="#fde68a" />
        </svg>
      );
    case "warningLabels":
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <rect x="16" y="16" width="48" height="48" rx="4" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
          <text x="40" y="46" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#dc2626">CD</text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <rect x="16" y="20" width="48" height="44" rx="6" fill="#f0fdfa" stroke="#0d9488" strokeWidth="2" />
          <circle cx="40" cy="42" r="12" fill="#ccfbf1" stroke="#0d9488" strokeWidth="1.5" />
        </svg>
      );
  }
}

// Product Image with Error Fallback
function ProductImage({ src, alt, iconType }) {
  const [hasError, setHasError] = useState(!src);

  if (hasError || !src) {
    return <FallbackProductIcon type={iconType} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="product-real-img"
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}

export default function ConsumablesOrderingPage() {
  const { currentUser, branch } = useApp();

  // Active Catalogue and Suppliers
  const [catalogue, setCatalogue] = useState(CONSUMABLES_CATALOGUE);
  const [suppliersMap, setSuppliersMap] = useState(SUPPLIERS);

  // Sync with server on mount for any custom environment overrides
  useEffect(() => {
    let isMounted = true;
    fetchConsumablesCatalogue()
      .then((data) => {
        if (!isMounted || !data) return;
        if (Array.isArray(data.catalogue) && data.catalogue.length > 0) {
          setCatalogue(data.catalogue);
        }
        if (data.suppliers && typeof data.suppliers === "object") {
          setSuppliersMap(data.suppliers);
        }
      })
      .catch(() => {
        // use fallback static config
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter States
  const [selectedSupplier, setSelectedSupplier] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  // Product card quantity selectors: { [sku]: number }
  const [cardQuantities, setCardQuantities] = useState(() => {
    const initial = {};
    CONSUMABLES_CATALOGUE.forEach((p) => {
      initial[p.sku] = 1;
    });
    return initial;
  });

  // Basket state: { [sku]: { product, quantity } }
  const [basket, setBasket] = useState(() => {
    try {
      const saved = localStorage.getItem("cph_consumables_basket");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cph_consumables_basket", JSON.stringify(basket));
    } catch {
      // ignore
    }
  }, [basket]);

  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pastOrders, setPastOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyBranchFilter, setHistoryBranchFilter] = useState("all");

  // Checkout form details
  const [staffName, setStaffName] = useState(currentUser?.name || "");
  const [staffEmail, setStaffEmail] = useState(currentUser?.email || "");
  const [staffPhone, setStaffPhone] = useState(branch?.phone || "");
  const [deliveryAddress, setDeliveryAddress] = useState(
    branch?.pharmacyAddress || "CarePlus Health Main Dispensary"
  );
  const [orderNotes, setOrderNotes] = useState("");

  // Order submission feedback state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);

  // Group basket items by supplier
  const basketItemsList = useMemo(() => Object.values(basket), [basket]);

  const cartItemCount = useMemo(() => {
    return basketItemsList.reduce((sum, item) => sum + item.quantity, 0);
  }, [basketItemsList]);

  const cartSubtotal = useMemo(() => {
    const sum = basketItemsList.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    return Number(sum.toFixed(2));
  }, [basketItemsList]);

  // Per-supplier breakdown in the cart:
  // { [supplierKey]: { supplier, items: [], subtotal: 0, isMinMet: boolean, amountNeeded: 0 } }
  const supplierCartBreakdown = useMemo(() => {
    const breakdown = {};

    // Initialize active suppliers map
    Object.keys(suppliersMap).forEach((key) => {
      breakdown[key] = {
        supplier: suppliersMap[key],
        items: [],
        subtotal: 0,
        isMinMet: false,
        amountNeeded: suppliersMap[key].minimumOrderValue,
      };
    });

    basketItemsList.forEach((it) => {
      const sKey = (it.product.supplier || "PREMVAN").toUpperCase();
      if (!breakdown[sKey]) {
        breakdown[sKey] = {
          supplier: {
            id: sKey.toLowerCase(),
            name: sKey,
            key: sKey,
            minimumOrderValue: 50.0,
            defaultEmail: "orders@careplushealth.co.uk",
          },
          items: [],
          subtotal: 0,
          isMinMet: false,
          amountNeeded: 50.0,
        };
      }
      breakdown[sKey].items.push(it);
      breakdown[sKey].subtotal = Number(
        (breakdown[sKey].subtotal + it.product.price * it.quantity).toFixed(2)
      );
    });

    // Calculate minimums for suppliers with items in basket
    Object.keys(breakdown).forEach((key) => {
      const item = breakdown[key];
      const minVal = item.supplier.minimumOrderValue || 50.0;
      item.isMinMet = item.items.length === 0 || item.subtotal >= minVal;
      item.amountNeeded = Math.max(0, Number((minVal - item.subtotal).toFixed(2)));
    });

    return breakdown;
  }, [basketItemsList, suppliersMap]);

  // Active suppliers that currently have items in the basket
  const activeSuppliersInCart = useMemo(() => {
    return Object.values(supplierCartBreakdown).filter((sb) => sb.items.length > 0);
  }, [supplierCartBreakdown]);

  // Check if ALL active suppliers meet their minimum order value
  const allSuppliersMinOrderMet = useMemo(() => {
    if (activeSuppliersInCart.length === 0) return false;
    return activeSuppliersInCart.every((sb) => sb.isMinMet);
  }, [activeSuppliersInCart]);

  // Which suppliers currently fail their minimum order
  const unmetSuppliersList = useMemo(() => {
    return activeSuppliersInCart.filter((sb) => !sb.isMinMet);
  }, [activeSuppliersInCart]);

  // Filter products by Supplier, Category, and Search
  const filteredProducts = useMemo(() => {
    return catalogue.filter((p) => {
      const matchSupplier =
        selectedSupplier === "ALL" ||
        (p.supplier && p.supplier.toUpperCase() === selectedSupplier.toUpperCase());

      const matchCat =
        selectedCategory === "All Categories" || p.category === selectedCategory;

      const matchSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSupplier && matchCat && matchSearch;
    });
  }, [catalogue, selectedSupplier, selectedCategory, searchQuery]);

  // Group filtered products by supplier for the "All Suppliers" view
  const productsBySupplier = useMemo(() => {
    const groups = {};
    Object.keys(suppliersMap).forEach((sKey) => {
      groups[sKey] = [];
    });

    filteredProducts.forEach((p) => {
      const sKey = (p.supplier || "PREMVAN").toUpperCase();
      if (!groups[sKey]) groups[sKey] = [];
      groups[sKey].push(p);
    });

    return groups;
  }, [filteredProducts, suppliersMap]);

  // Product card quantity controls
  const handleCardQtyChange = (sku, delta) => {
    setCardQuantities((prev) => {
      const current = prev[sku] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [sku]: next };
    });
  };

  const handleCardQtyDirectInput = (sku, val) => {
    const num = parseInt(val, 10);
    setCardQuantities((prev) => ({
      ...prev,
      [sku]: Number.isInteger(num) && num > 0 ? num : 1,
    }));
  };

  // Add to basket
  const handleAddToBasket = (product) => {
    const qtyToAdd = cardQuantities[product.sku] || 1;
    setBasket((prev) => {
      const existing = prev[product.sku];
      const newQty = existing ? existing.quantity + qtyToAdd : qtyToAdd;
      return {
        ...prev,
        [product.sku]: {
          product,
          quantity: newQty,
        },
      };
    });
  };

  // Basket item quantity updates
  const updateBasketQuantity = (sku, newQty) => {
    if (newQty <= 0) {
      removeFromBasket(sku);
      return;
    }
    setBasket((prev) => {
      if (!prev[sku]) return prev;
      return {
        ...prev,
        [sku]: {
          ...prev[sku],
          quantity: newQty,
        },
      };
    });
  };

  const removeFromBasket = (sku) => {
    setBasket((prev) => {
      const updated = { ...prev };
      delete updated[sku];
      return updated;
    });
  };

  const clearBasket = () => {
    setBasket({});
    try {
      localStorage.removeItem("cph_consumables_basket");
    } catch {
      // ignore
    }
  };

  // Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (!allSuppliersMinOrderMet) return;
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    setOrderError("");
  };

  // Submit Order to Server
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!allSuppliersMinOrderMet) {
      const failingNames = unmetSuppliersList
        .map((s) => `${s.supplier.name} (Add £${s.amountNeeded.toFixed(2)} more)`)
        .join(", ");
      setOrderError(
        `Cannot place order: The following supplier minimum order requirements are not met: ${failingNames}.`
      );
      return;
    }

    if (!staffName.trim()) {
      setOrderError("Please enter the ordering staff member's name.");
      return;
    }

    setIsSubmitting(true);
    setOrderError("");

    try {
      const idempotencyKey = `cph-ord-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const orderPayload = {
        idempotencyKey,
        branchId: currentUser?.branchId || branch?.id || "wilmslow",
        branchName: branch?.pharmacyName || currentUser?.name || "CarePlus Health",
        branchPhone: branch?.phone || staffPhone.trim(),
        staffName: staffName.trim(),
        staffEmail: staffEmail.trim(),
        staffPhone: staffPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        notes: orderNotes.trim(),
        items: basketItemsList.map((item) => ({
          sku: item.product.sku,
          quantity: item.quantity,
        })),
      };

      const result = await submitConsumablesOrder(orderPayload);

      if (result && result.ok) {
        setCompletedOrder({
          ...result.order,
          orderRef: result.orderRef || result.order.order_ref,
          supplierOrders: result.supplierOrders || [],
          emailStatus: result.emailStatus,
          emailError: result.emailError,
          message: result.message,
        });

        clearBasket();
        loadPastOrders(historyBranchFilter);
      } else {
        throw new Error(result.message || "Failed to submit order");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      setOrderError(err.message || "An unexpected error occurred while placing your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load Past Orders
  const loadPastOrders = async (filterType = "all") => {
    setHistoryLoading(true);
    try {
      const branchIdParam =
        filterType === "my" && (currentUser?.branchId || branch?.id)
          ? (currentUser?.branchId || branch?.id)
          : undefined;
      const res = await fetchConsumablesOrders(branchIdParam);
      const rows = Array.isArray(res) ? res : (res?.rows || []);
      setPastOrders(rows);
    } catch (err) {
      console.error("Failed to load past orders:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenHistory = () => {
    setIsHistoryOpen(true);
    loadPastOrders(historyBranchFilter);
  };

  const handleRetryEmail = async (orderId) => {
    try {
      const res = await retryConsumablesOrderEmail(orderId);
      if (res.ok) {
        alert("Email notification resent successfully to all suppliers!");
        loadPastOrders(historyBranchFilter);
      }
    } catch (err) {
      alert("Failed to resend email: " + err.message);
    }
  };

  const handleReorder = (ord) => {
    const rawItems = typeof ord.items === "string" ? JSON.parse(ord.items) : (ord.items || []);
    if (!Array.isArray(rawItems) || rawItems.length === 0) return;

    setBasket((prev) => {
      const updated = { ...prev };
      for (const it of rawItems) {
        const catProduct = CONSUMABLES_CATALOGUE.find((p) => p.sku === it.sku);
        const productObj = catProduct || {
          sku: it.sku,
          name: it.name,
          packSize: it.packSize || "",
          unitPrice: Number(it.unitPrice) || 0,
          supplier: it.supplier || "PREMVAN",
          category: it.category || "packaging",
          image: it.image || "",
        };

        const existingQty = updated[it.sku]?.quantity || 0;
        updated[it.sku] = {
          product: productObj,
          quantity: existingQty + (Number(it.quantity) || 1),
        };
      }
      return updated;
    });

    setIsHistoryOpen(false);
    setIsCartOpen(true);
  };

  return (
    <div className="consumables-page">
      {/* 1. Header Banner */}
      <div className="consumables-header">
        <div className="consumables-header__info">
          <h1>Consumables & Dispensary Supplies</h1>
          <p>
            Browse medical packaging, amber dispensing bottles, dosettes, paper prescription bags,
            and dispensary consumables organized by official manufacturer and supplier.
          </p>
        </div>

        <div className="consumables-header__actions">
          <button
            type="button"
            className="orders-history-btn"
            onClick={handleOpenHistory}
          >
            📋 Past Orders
          </button>

          <button
            type="button"
            className="cart-trigger-btn"
            onClick={() => setIsCartOpen(true)}
          >
            <span>🛒 Basket</span>
            <span className="cart-count-badge">{cartItemCount}</span>
            <span>(£{cartSubtotal.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* 2. Supplier Tabs (Product Range Sections) */}
      <div className="supplier-tabs-wrapper">
        <div className="supplier-tabs-label">
          <span>Filter by Supplier:</span>
        </div>
        <div className="supplier-tabs-list">
          <button
            type="button"
            className={`supplier-tab ${selectedSupplier === "ALL" ? "active" : ""}`}
            onClick={() => setSelectedSupplier("ALL")}
          >
            <span className="supplier-tab-name">All Suppliers</span>
            <span className="supplier-tab-count">{catalogue.length} Products</span>
          </button>

          {SUPPLIER_LIST.map((sup) => {
            const count = catalogue.filter(
              (p) => (p.supplier || "").toUpperCase() === sup.key
            ).length;
            const supCart = supplierCartBreakdown[sup.key];
            const hasItemsInCart = supCart && supCart.items.length > 0;

            return (
              <button
                type="button"
                key={sup.key}
                className={`supplier-tab ${selectedSupplier === sup.key ? "active" : ""}`}
                onClick={() => setSelectedSupplier(sup.key)}
                style={{
                  borderBottomColor:
                    selectedSupplier === sup.key ? sup.accentColor : "transparent",
                }}
              >
                <span
                  className="supplier-logo-badge"
                  style={{ backgroundColor: sup.accentColor }}
                >
                  {sup.logoText || sup.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="supplier-tab-name">{sup.name}</span>
                <span className="supplier-tab-count">
                  {count} items &bull; Min £{sup.minimumOrderValue.toFixed(0)}
                </span>
                {hasItemsInCart && (
                  <span
                    className={`supplier-tab-status-dot ${
                      supCart.isMinMet ? "met" : "pending"
                    }`}
                    title={
                      supCart.isMinMet
                        ? "Minimum order met"
                        : `Add £${supCart.amountNeeded} more`
                    }
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Controls: Search & Category Chips */}
      <div className="consumables-controls">
        <div className="search-box-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search consumables by product name, SKU, size, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="category-filter-chips">
          {CONSUMABLES_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              className={`cat-chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Product Range Sections */}
      {selectedSupplier === "ALL" ? (
        // RENDER DISTINCT SECTIONS FOR EACH SUPPLIER
        <div className="suppliers-sections-container">
          {SUPPLIER_LIST.map((sup) => {
            const products = productsBySupplier[sup.key] || [];
            if (products.length === 0) return null;
            const supCart = supplierCartBreakdown[sup.key];
            const hasItems = supCart && supCart.items.length > 0;
            const pctMet = hasItems
              ? Math.min(100, Math.round((supCart.subtotal / sup.minimumOrderValue) * 100))
              : 0;

            return (
              <section key={sup.key} className="supplier-range-section">
                {/* Supplier Section Header */}
                <div
                  className="supplier-section-header"
                  style={{ borderLeftColor: sup.accentColor }}
                >
                  <div className="supplier-header-main">
                    <div className="supplier-title-wrap">
                      <span
                        className="supplier-avatar"
                        style={{ backgroundColor: sup.accentColor }}
                      >
                        {sup.logoText || sup.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <div className="supplier-name-row">
                          <h2>{sup.name}</h2>
                          <span className="supplier-badge-pill">{sup.badge}</span>
                        </div>
                        <p className="supplier-desc">{sup.description}</p>
                      </div>
                    </div>

                    <div className="supplier-destination-pill">
                      <span className="email-icon">📧</span>
                      <span>Orders sent to: <strong>{sup.defaultEmail}</strong></span>
                    </div>
                  </div>

                  {/* Supplier Minimum Order Tracker */}
                  <div className="supplier-min-status-box">
                    <div className="supplier-min-label-row">
                      <div className="min-req-text">
                        Minimum Order Value: <strong>£{sup.minimumOrderValue.toFixed(2)}</strong>
                      </div>
                      <div className="cart-current-text">
                        In Basket: <strong>£{supCart ? supCart.subtotal.toFixed(2) : "0.00"}</strong>
                      </div>
                    </div>

                    <div className="supplier-min-progress-track">
                      <div
                        className={`supplier-min-progress-fill ${
                          supCart?.isMinMet && hasItems ? "complete" : ""
                        }`}
                        style={{
                          width: `${pctMet}%`,
                          backgroundColor:
                            supCart?.isMinMet && hasItems ? "#059669" : sup.accentColor,
                        }}
                      />
                    </div>

                    <div className="supplier-min-status-feedback">
                      {hasItems ? (
                        supCart.isMinMet ? (
                          <span className="status-badge success">
                            ✓ Supplier Minimum (£{sup.minimumOrderValue.toFixed(2)}) Satisfied
                          </span>
                        ) : (
                          <span className="status-badge warning">
                            ⚠️ Add £{supCart.amountNeeded.toFixed(2)} more of {sup.name} items to meet minimum order
                          </span>
                        )
                      ) : (
                        <span className="status-badge neutral">
                          Basket empty for this supplier (£{sup.minimumOrderValue.toFixed(2)} minimum)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Products Grid for this Supplier */}
                <div className="products-grid">
                  {products.map((product) => renderProductCard(product))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        // RENDER SINGLE SELECTED SUPPLIER SECTION
        <div className="single-supplier-container">
          {(() => {
            const sup = suppliersMap[selectedSupplier] || SUPPLIERS[selectedSupplier];
            const supCart = supplierCartBreakdown[selectedSupplier];
            const hasItems = supCart && supCart.items.length > 0;
            const pctMet = hasItems
              ? Math.min(100, Math.round((supCart.subtotal / sup.minimumOrderValue) * 100))
              : 0;

            return (
              <>
                <div
                  className="supplier-section-header"
                  style={{ borderLeftColor: sup.accentColor }}
                >
                  <div className="supplier-header-main">
                    <div className="supplier-title-wrap">
                      <span
                        className="supplier-avatar"
                        style={{ backgroundColor: sup.accentColor }}
                      >
                        {sup.logoText || sup.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <div className="supplier-name-row">
                          <h2>{sup.name} Product Range</h2>
                          <span className="supplier-badge-pill">{sup.badge}</span>
                        </div>
                        <p className="supplier-desc">{sup.description}</p>
                      </div>
                    </div>

                    <div className="supplier-destination-pill">
                      <span className="email-icon">📧</span>
                      <span>Orders sent to: <strong>{sup.defaultEmail}</strong></span>
                    </div>
                  </div>

                  <div className="supplier-min-status-box">
                    <div className="supplier-min-label-row">
                      <div className="min-req-text">
                        Minimum Order Value: <strong>£{sup.minimumOrderValue.toFixed(2)}</strong>
                      </div>
                      <div className="cart-current-text">
                        In Basket: <strong>£{supCart ? supCart.subtotal.toFixed(2) : "0.00"}</strong>
                      </div>
                    </div>

                    <div className="supplier-min-progress-track">
                      <div
                        className={`supplier-min-progress-fill ${
                          supCart?.isMinMet && hasItems ? "complete" : ""
                        }`}
                        style={{
                          width: `${pctMet}%`,
                          backgroundColor:
                            supCart?.isMinMet && hasItems ? "#059669" : sup.accentColor,
                        }}
                      />
                    </div>

                    <div className="supplier-min-status-feedback">
                      {hasItems ? (
                        supCart.isMinMet ? (
                          <span className="status-badge success">
                            ✓ Supplier Minimum (£{sup.minimumOrderValue.toFixed(2)}) Satisfied
                          </span>
                        ) : (
                          <span className="status-badge warning">
                            ⚠️ Add £{supCart.amountNeeded.toFixed(2)} more of {sup.name} items to meet minimum order
                          </span>
                        )
                      ) : (
                        <span className="status-badge neutral">
                          Basket empty for this supplier (£{sup.minimumOrderValue.toFixed(2)} minimum)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="products-grid">
                  {filteredProducts.map((product) => renderProductCard(product))}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ========================================================
          5. Slide-out Basket Drawer / Panel
          ======================================================== */}
      {isCartOpen && (
        <div className="cart-modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer__header">
              <h2>
                <span>🛒</span> Dispensary Basket ({cartItemCount}{" "}
                {cartItemCount === 1 ? "item" : "items"})
              </h2>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setIsCartOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="cart-drawer__body">
              {basketItemsList.length === 0 ? (
                <div className="cart-empty-state">
                  <span className="cart-empty-icon">🛍️</span>
                  <h3>Your basket is empty</h3>
                  <p>Browse our catalogue and add consumables to begin ordering.</p>
                </div>
              ) : (
                <>
                  {/* Overall Supplier Validation Notice */}
                  {!allSuppliersMinOrderMet ? (
                    <div className="min-order-banner min-order-banner--warning">
                      <strong>⚠️ Minimum Order Value Notice:</strong>
                      <div style={{ marginTop: "4px" }}>
                        Each supplier requires their own minimum order value before dispatch:
                      </div>
                      <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                        {unmetSuppliersList.map((sb) => (
                          <li key={sb.supplier.key}>
                            <strong>{sb.supplier.name}:</strong> Currently £{sb.subtotal.toFixed(2)} / £{sb.supplier.minimumOrderValue.toFixed(2)} (add at least <strong>£{sb.amountNeeded.toFixed(2)}</strong> more)
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="min-order-banner min-order-banner--success">
                      <strong>✓ All Supplier Minimums Met!</strong>
                      <div>
                        All {activeSuppliersInCart.length} supplier orders qualify for immediate automated dispatch.
                      </div>
                    </div>
                  )}

                  {/* Group Items in Basket by Supplier */}
                  {activeSuppliersInCart.map((sb) => (
                    <div key={sb.supplier.key} className="cart-supplier-group">
                      <div className="cart-supplier-header">
                        <div className="cart-supplier-title">
                          <span
                            className="cart-supplier-badge"
                            style={{ backgroundColor: sb.supplier.accentColor }}
                          >
                            {sb.supplier.logoText || sb.supplier.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="cart-supplier-info">
                            <span className="cart-supplier-name">{sb.supplier.name}</span>
                            <span className="cart-supplier-email">{sb.supplier.defaultEmail}</span>
                          </div>
                        </div>
                        <span
                          className={`cart-supplier-status-pill ${
                            sb.isMinMet ? "met" : "unmet"
                          }`}
                        >
                          {sb.isMinMet
                            ? `✓ Min £${sb.supplier.minimumOrderValue.toFixed(0)} Met`
                            : `⚠️ Need +£${sb.amountNeeded.toFixed(2)}`}
                        </span>
                      </div>

                      <div className="cart-supplier-items">
                        {sb.items.map(({ product, quantity }) => {
                          const lineTotal = (product.price * quantity).toFixed(2);
                          return (
                            <div key={product.sku} className="cart-item-card">
                              <div className="cart-item-thumb">
                                <ProductImage
                                  src={product.image}
                                  alt={product.name}
                                  iconType={product.iconType}
                                />
                              </div>

                              <div className="cart-item-content">
                                <div className="cart-item-header">
                                  <div className="cart-item-info">
                                    <div className="cart-item-title">{product.name}</div>
                                    <div className="cart-item-meta">
                                      SKU: {product.sku} &bull; {product.packQuantity}
                                      {product.dimensions ? ` (${product.dimensions})` : ""}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="cart-item-remove-btn"
                                    title="Remove product"
                                    onClick={() => removeFromBasket(product.sku)}
                                  >
                                    ✕
                                  </button>
                                </div>

                                <div className="cart-item-footer">
                                  <div className="cart-qty-control">
                                    <button
                                      type="button"
                                      className="cart-qty-btn"
                                      onClick={() =>
                                        updateBasketQuantity(product.sku, quantity - 1)
                                      }
                                      aria-label="Decrease quantity"
                                    >
                                      −
                                    </button>
                                    <input
                                      type="number"
                                      className="cart-qty-input"
                                      min={1}
                                      value={quantity}
                                      onChange={(e) =>
                                        updateBasketQuantity(
                                          product.sku,
                                          parseInt(e.target.value, 10) || 1
                                        )
                                      }
                                    />
                                    <button
                                      type="button"
                                      className="cart-qty-btn"
                                      onClick={() =>
                                        updateBasketQuantity(product.sku, quantity + 1)
                                      }
                                      aria-label="Increase quantity"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <div className="cart-item-price-calc">
                                    <span className="cart-calc-multi">
                                      {quantity} × £{product.price.toFixed(2)} =
                                    </span>
                                    <span className="cart-item-line-total">
                                      £{lineTotal}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="cart-supplier-subtotal-bar">
                        <span className="subtotal-label">{sb.supplier.name} Subtotal:</span>
                        <span className="subtotal-amount">£{sb.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {basketItemsList.length > 0 && (
              <div className="cart-drawer__footer">
                <div className="cart-summary-row">
                  <span className="cart-summary-label">
                    Total ({activeSuppliersInCart.length} Supplier Orders):
                  </span>
                  <span
                    className={`cart-summary-value ${
                      allSuppliersMinOrderMet ? "success" : ""
                    }`}
                  >
                    £{cartSubtotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  className="checkout-btn"
                  disabled={!allSuppliersMinOrderMet}
                  onClick={handleProceedToCheckout}
                >
                  {allSuppliersMinOrderMet ? (
                    <span>Review & Place Orders ({activeSuppliersInCart.length}) →</span>
                  ) : (
                    <span>
                      Order Blocked: Supplier Minimum Not Met
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          6. Checkout / Place Order Review Modal
          ======================================================== */}
      {isCheckoutOpen && (
        <div
          className="cart-modal-overlay cart-modal-overlay--centered"
          onClick={() => !isSubmitting && setIsCheckoutOpen(false)}
        >
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-modal__header">
              <h2>Confirm Consumables Orders</h2>
              {!isSubmitting && (
                <button
                  type="button"
                  className="close-drawer-btn"
                  style={{ color: "#ffffff" }}
                  onClick={() => setIsCheckoutOpen(false)}
                >
                  ✕
                </button>
              )}
            </div>

            {completedOrder ? (
              // Order Success Screen
              <div className="checkout-modal__body">
                <div className="order-success-card">
                  <div className="order-success-icon">✓</div>
                  <h2 style={{ margin: "0 0 6px 0", color: "#0f172a" }}>
                    Orders Dispatched Successfully!
                  </h2>
                  <p style={{ margin: "0 0 12px 0", color: "#64748b" }}>
                    Your purchase orders have been submitted and transmitted to each supplier.
                  </p>

                  <div className="order-success-ref">
                    Master Reference: {completedOrder.orderRef}
                  </div>

                  {/* Supplier POs Breakdown */}
                  {Array.isArray(completedOrder.supplierOrders) &&
                    completedOrder.supplierOrders.length > 0 && (
                      <div className="dispatched-pos-list">
                        <h4>Purchase Orders Transmitted:</h4>
                        {completedOrder.supplierOrders.map((so) => (
                          <div key={so.poRef} className="dispatched-po-item">
                            <div>
                              <strong>{so.supplierName}</strong> ({so.poRef})
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                Dispatched to: <strong>{so.supplierEmail}</strong> &amp; <strong>info@careplushealth.co.uk</strong>
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "#0369a1", marginTop: "2px" }}>
                                Branch A/C with {so.supplierName}: <strong>{so.accountNumber || getBranchSupplierAccount(currentUser?.branchId || branch?.id, so.supplier)}</strong>
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, color: "#0284c7" }}>
                              £{Number(so.subtotal).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Pricing Verification Notice Banner */}
                  <div
                    style={{
                      background: "#fff1f2",
                      border: "1px solid #fecdd3",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      margin: "12px 0",
                      fontSize: "0.78rem",
                      color: "#be123c",
                      textAlign: "left",
                      lineHeight: "1.4",
                    }}
                  >
                    <strong>Notice:</strong> If this order does not reflect the accurate prices on our portal, Please Contact Mehraan from CarePlus Health (<a href="mailto:mehraan@careplushealth.co.uk" style={{ color: "#be123c", textDecoration: "underline", fontWeight: 700 }}>mehraan@careplushealth.co.uk</a>) and DO NOT PROCESS THIS ORDER
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "16px",
                      textAlign: "left",
                      fontSize: "0.85rem",
                      lineHeight: "1.6",
                      margin: "16px 0",
                    }}
                  >
                    <div>
                      <strong>Combined Total:</strong> £
                      {Number(completedOrder.total || cartSubtotal).toFixed(2)} GBP
                    </div>
                    <div>
                      <strong>Date & Time:</strong> {new Date().toLocaleString("en-GB")}
                    </div>
                    <div>
                      <strong>Ordering Branch:</strong>{" "}
                      {completedOrder.branch_name || branch?.pharmacyName || "CarePlus Health"}
                    </div>
                    <div>
                      <strong>Delivery Destination:</strong>{" "}
                      {completedOrder.delivery_address || deliveryAddress}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => window.print()}
                    >
                      🖨️ Print Receipt
                    </button>
                    <button
                      type="button"
                      className="btn-primary-teal"
                      onClick={() => {
                        setCompletedOrder(null);
                        setIsCheckoutOpen(false);
                      }}
                    >
                      Start New Order
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Checkout Confirmation Form
              <form onSubmit={handleSubmitOrder} className="checkout-modal-form">
                <div className="checkout-modal__body">
                  {orderError && (
                    <div className="min-order-banner min-order-banner--warning">
                      ⚠️ {orderError}
                    </div>
                  )}

                  {/* Supplier Architecture Notice */}
                  <div className="supplier-dispatch-summary-box">
                    <span className="dispatch-summary-icon">📦</span>
                    <div>
                      <strong>Automated Supplier Email Architecture:</strong>
                      <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#475569" }}>
                        This order will be split automatically into {activeSuppliersInCart.length} separate official purchase orders. Each order will be delivered directly to the designated supplier's sales inbox:
                      </p>
                      <div className="dispatch-recipients-tags">
                        {activeSuppliersInCart.map((sb) => (
                          <span key={sb.supplier.key} className="recipient-tag">
                            <strong>{sb.supplier.name}:</strong> {sb.supplier.defaultEmail} (£{sb.subtotal.toFixed(2)})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="checkout-section">
                    <h3>1. Branch & Staff Contact Details</h3>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Staff Member Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Sarah Jenkins"
                          value={staffName}
                          onChange={(e) => setStaffName(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Staff Email</label>
                        <input
                          type="email"
                          placeholder="e.g. clinician@careplushealth.co.uk"
                          value={staffEmail}
                          onChange={(e) => setStaffEmail(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Contact Telephone</label>
                        <input
                          type="text"
                          placeholder="e.g. 0161 123 4567"
                          value={staffPhone}
                          onChange={(e) => setStaffPhone(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Ordering Branch</label>
                        <input
                          type="text"
                          readOnly
                          style={{ background: "#f1f5f9" }}
                          value={branch?.pharmacyName || currentUser?.name || "CarePlus Health"}
                        />
                      </div>

                      <div className="form-group full">
                        <label>Delivery Address</label>
                        <input
                          type="text"
                          placeholder="Full delivery street address"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                        />
                      </div>

                      <div className="form-group full">
                        <label>Delivery Instructions / Special Notes</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Leave with dispensary manager, urgent stock replenishment..."
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="checkout-section">
                    <h3>2. Order Breakdown by Supplier</h3>
                    {activeSuppliersInCart.map((sb) => (
                      <div key={sb.supplier.key} style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            background: "#f1f5f9",
                            padding: "8px 12px",
                            borderRadius: "6px 6px 0 0",
                            fontWeight: 700,
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.85rem",
                          }}
                        >
                          <span>
                            Supplier: <strong>{sb.supplier.name}</strong> &bull; A/C: <span style={{ color: "#0369a1", fontFamily: "monospace" }}>{getBranchSupplierAccount(currentUser?.branchId || branch?.id, sb.supplier.key)}</span>
                          </span>
                          <span style={{ color: "#0284c7", fontSize: "0.78rem" }}>
                            Dispatch: {sb.supplier.defaultEmail} &amp; info@careplushealth.co.uk
                          </span>
                        </div>
                        <table className="order-review-table" style={{ marginTop: 0 }}>
                          <thead>
                            <tr>
                              <th>SKU</th>
                              <th>Product</th>
                              <th style={{ textAlign: "center" }}>Qty</th>
                              <th style={{ textAlign: "right" }}>Unit Price</th>
                              <th style={{ textAlign: "right" }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sb.items.map(({ product, quantity }) => (
                              <tr key={product.sku}>
                                <td style={{ fontFamily: "monospace", color: "#0284c7", fontWeight: 700 }}>
                                  {product.sku}
                                </td>
                                <td>
                                  <strong>{product.name}</strong>
                                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                    {product.packQuantity}
                                  </div>
                                </td>
                                <td style={{ textAlign: "center", fontWeight: 700 }}>{quantity}</td>
                                <td style={{ textAlign: "right" }}>£{product.price.toFixed(2)}</td>
                                <td style={{ textAlign: "right", fontWeight: 700 }}>
                                  £{(product.price * quantity).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={4} style={{ textAlign: "right", fontWeight: 700 }}>
                                {sb.supplier.name} Subtotal:
                              </td>
                              <td style={{ textAlign: "right", fontWeight: 800 }}>
                                £{sb.subtotal.toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ))}

                    <div
                      style={{
                        padding: "12px",
                        background: "#f0fdfa",
                        border: "1px solid #99f6e4",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong style={{ color: "#0f766e" }}>Grand Total (All Suppliers):</strong>
                      <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f766e" }}>
                        £{cartSubtotal.toFixed(2)} GBP
                      </span>
                    </div>

                    {/* Disclaimer Banner on Purchase Orders */}
                    <div
                      style={{
                        marginTop: "14px",
                        padding: "10px 14px",
                        background: "#fff1f2",
                        border: "1px solid #fecdd3",
                        borderRadius: "8px",
                        fontSize: "0.78rem",
                        color: "#be123c",
                        lineHeight: "1.4",
                        textAlign: "left",
                      }}
                    >
                      <strong>⚠️ Order Processing Notice:</strong> If this order does not reflect the accurate prices on our portal, Please Contact Mehraan from CarePlus Health (<a href="mailto:mehraan@careplushealth.co.uk" style={{ color: "#be123c", textDecoration: "underline", fontWeight: 700 }}>mehraan@careplushealth.co.uk</a>) and DO NOT PROCESS THIS ORDER
                    </div>
                  </div>
                </div>

                <div className="checkout-modal__footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={isSubmitting}
                    onClick={() => setIsCheckoutOpen(false)}
                  >
                    ← Back to Basket
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-teal"
                    disabled={isSubmitting || !allSuppliersMinOrderMet}
                  >
                    {isSubmitting
                      ? "Transmitting Purchase Orders..."
                      : `Confirm & Dispatch ${activeSuppliersInCart.length} Purchase Orders →`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          7. Past Orders Modal
          ======================================================== */}
      {isHistoryOpen && (
        <div
          className="cart-modal-overlay cart-modal-overlay--centered"
          onClick={() => setIsHistoryOpen(false)}
        >
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-modal__header">
              <h2>Consumables Orders History</h2>
              <button
                type="button"
                className="close-drawer-btn"
                style={{ color: "#ffffff" }}
                onClick={() => setIsHistoryOpen(false)}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                padding: "10px 24px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className={`cat-chip ${historyBranchFilter === "all" ? "active" : ""}`}
                  style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                  onClick={() => {
                    setHistoryBranchFilter("all");
                    loadPastOrders("all");
                  }}
                >
                  All Orders ({pastOrders.length})
                </button>
                {currentUser?.branchId && (
                  <button
                    type="button"
                    className={`cat-chip ${historyBranchFilter === "my" ? "active" : ""}`}
                    style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                    onClick={() => {
                      setHistoryBranchFilter("my");
                      loadPastOrders("my");
                    }}
                  >
                    My Branch ({currentUser.branchId})
                  </button>
                )}
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                onClick={() => loadPastOrders(historyBranchFilter)}
              >
                🔄 Refresh
              </button>
            </div>

            <div className="checkout-modal__body">
              {historyLoading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  Loading order history...
                </div>
              ) : pastOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No previous orders found.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {pastOrders.map((ord) => {
                    const orderItems = Array.isArray(ord.items)
                      ? ord.items
                      : typeof ord.items === "string"
                      ? JSON.parse(ord.items || "[]")
                      : [];
                    const totalUnits = orderItems.reduce(
                      (acc, it) => acc + (parseInt(it.quantity, 10) || 0),
                      0
                    );
                    const supOrders = Array.isArray(ord.supplier_orders)
                      ? ord.supplier_orders
                      : typeof ord.supplier_orders === "string"
                      ? JSON.parse(ord.supplier_orders || "[]")
                      : [];

                    return (
                      <div key={ord.id} className="history-order-card">
                        <div className="history-order-header">
                          <div>
                            <span className="history-order-ref">{ord.order_ref}</span>
                            <span className="history-order-date">
                              📅 {new Date(ord.created_at).toLocaleString("en-GB")}
                            </span>
                          </div>
                          <div className="history-order-total">
                            £{Number(ord.total).toFixed(2)}
                          </div>
                        </div>

                        {supOrders.length > 0 && (
                          <div className="history-suppliers-badges">
                            {supOrders.map((so) => (
                              <span key={so.poRef} className="history-po-badge">
                                <strong>{so.supplierName}:</strong> {so.poRef} (£{Number(so.subtotal).toFixed(2)}) &bull; Sent to {so.supplierEmail}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="history-order-meta">
                          <div className="history-meta-item">
                            <strong>Branch:</strong> {ord.branch_name || "CarePlus Health"} {ord.branch_id ? `(${ord.branch_id})` : ""}
                          </div>
                          <div className="history-meta-item">
                            <strong>Staff Member:</strong> {ord.staff_name || "Staff"}
                          </div>
                          <div className="history-meta-item">
                            <strong>Contact:</strong> {ord.staff_phone || ord.staff_email || "N/A"}
                          </div>
                          <div className="history-meta-item">
                            <strong>Destination:</strong> {ord.delivery_address || "Dispensary"}
                          </div>
                          {ord.notes && (
                            <div className="history-meta-item" style={{ gridColumn: "1 / -1" }}>
                              <strong>Special Notes:</strong> {ord.notes}
                            </div>
                          )}
                        </div>

                        {/* Order Quantities & Items Table */}
                        <div style={{ marginTop: "4px" }}>
                          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                            Order Details ({orderItems.length} lines, {totalUnits} items total):
                          </div>
                          <table className="history-items-table">
                            <thead>
                              <tr>
                                <th>SKU</th>
                                <th>Product Name & Pack</th>
                                <th>Supplier</th>
                                <th style={{ textAlign: "center" }}>Qty</th>
                                <th style={{ textAlign: "right" }}>Price</th>
                                <th style={{ textAlign: "right" }}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderItems.map((item, idx) => (
                                <tr key={item.sku || idx}>
                                  <td style={{ fontFamily: "monospace", color: "#0284c7", fontWeight: 700 }}>
                                    {item.sku}
                                  </td>
                                  <td>
                                    <strong>{item.name}</strong>
                                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                      {item.packQuantity || ""} {item.size ? `(${item.size})` : ""}
                                    </div>
                                  </td>
                                  <td>
                                    <span className="table-supplier-tag">{item.supplierName || item.supplier}</span>
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <span className="history-qty-pill">{item.quantity}</span>
                                  </td>
                                  <td style={{ textAlign: "right", color: "#475569" }}>
                                    £{Number(item.unitPrice).toFixed(2)}
                                  </td>
                                  <td style={{ textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                                    £{Number(item.lineTotal || item.unitPrice * item.quantity).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="history-order-footer">
                          <span
                            className={`email-dispatch-pill ${
                              ord.email_status === "sent" ? "sent" : "failed"
                            }`}
                            style={{ margin: 0, padding: "4px 12px", fontSize: "0.78rem" }}
                          >
                            {ord.email_status === "sent"
                              ? "✓ Dispatched to Supplier Inboxes"
                              : "⚠️ Dispatch Notice / Retry Needed"}
                          </span>

                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                            <button
                              type="button"
                              className="btn-primary"
                              style={{
                                padding: "5px 12px",
                                fontSize: "0.82rem",
                                background: "#059669",
                                borderColor: "#059669",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                              onClick={() => handleReorder(ord)}
                            >
                              🔁 Re-order Items
                            </button>
                            {ord.email_status !== "sent" && (
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                                onClick={() => handleRetryEmail(ord.id)}
                              >
                                ✉️ Retry Notification
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                              onClick={() => window.print()}
                            >
                              🖨️ Print
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="checkout-modal__footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsHistoryOpen(false)}
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to render a product card
  function renderProductCard(product) {
    const qty = cardQuantities[product.sku] || 1;
    const isInCart = basket[product.sku] !== undefined;
    const sup = suppliersMap[product.supplier] || SUPPLIERS[product.supplier] || {};

    return (
      <div key={product.sku} className="product-card">
        <div className="product-image-container">
          <span className="product-sku-pill">{product.sku}</span>
          <span
            className="product-supplier-pill"
            style={{ backgroundColor: sup.accentColor || "#0d9488" }}
          >
            {product.supplierName || product.supplier}
          </span>
          <ProductImage
            src={product.image}
            alt={product.name}
            iconType={product.iconType}
          />
        </div>

        <div className="product-details">
          <div className="product-category-row">
            <span className="product-category-tag">{product.category}</span>
            {product.dimensions && (
              <span className="product-dim-tag">{product.dimensions}</span>
            )}
          </div>

          <h3 className="product-title">{product.name}</h3>
          <p className="product-description">{product.description}</p>

          <div className="product-specs-row">
            <span className="spec-pack">📦 {product.packQuantity}</span>
            <span className="spec-size">{product.size}</span>
          </div>

          <div className="product-pricing-row">
            <div>
              <span className="product-price-label">Pack Price:</span>
              <div className="product-price">
                £{product.price.toFixed(2)}
              </div>
            </div>
            {isInCart && (
              <span className="in-cart-indicator">
                ✓ In Basket ({basket[product.sku].quantity})
              </span>
            )}
          </div>

          <div className="product-actions-row">
            <div className="quantity-control">
              <button
                type="button"
                className="qty-btn"
                onClick={() => handleCardQtyChange(product.sku, -1)}
              >
                −
              </button>
              <input
                type="number"
                className="qty-input"
                min={1}
                value={qty}
                onChange={(e) =>
                  handleCardQtyDirectInput(product.sku, e.target.value)
                }
              />
              <button
                type="button"
                className="qty-btn"
                onClick={() => handleCardQtyChange(product.sku, 1)}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="add-to-cart-btn"
              onClick={() => handleAddToBasket(product)}
            >
              <span>+ Add to Basket</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
