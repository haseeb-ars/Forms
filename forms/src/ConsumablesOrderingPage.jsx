import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "./AppContext.jsx";
import {
  CONSUMABLES_CATALOGUE,
  CONSUMABLES_CATEGORIES,
} from "./consumablesCatalogue.js";
import {
  submitConsumablesOrder,
  fetchConsumablesOrders,
  retryConsumablesOrderEmail,
} from "./api.js";
import "./ConsumablesOrderingPage.css";

// SVG product illustrations for healthcare consumables
function ProductIcon({ type }) {
  switch (type) {
    case "splitBox":
    case "splitBox4":
    case "dosette7":
    case "cassette28":
    case "pocketBox":
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <rect x="10" y="15" width="60" height="50" rx="8" fill="#ccfbf1" stroke="#0d9488" strokeWidth="2.5" />
          <line x1="40" y1="15" x2="40" y2="65" stroke="#0d9488" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="10" y1="40" x2="70" y2="40" stroke="#0d9488" strokeWidth="2" strokeDasharray="3 3" />
          <rect x="20" y="24" width="12" height="6" rx="3" fill="#0d9488" />
          <rect x="48" y="24" width="12" height="6" rx="3" fill="#14b8a6" />
          <rect x="20" y="48" width="12" height="6" rx="3" fill="#14b8a6" />
          <rect x="48" y="48" width="12" height="6" rx="3" fill="#0d9488" />
        </svg>
      );
    case "splitter":
    case "crusher":
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <circle cx="40" cy="40" r="28" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
          <path d="M26 40 L54 40" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
          <path d="M40 20 L40 32" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
          <circle cx="40" cy="40" r="10" fill="#bae6fd" />
        </svg>
      );
    case "bottleAmber":
    case "bottlePet":
    case "bottleLarge":
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <rect x="30" y="10" width="20" height="10" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
          <path d="M24 24 C24 20, 56 20, 56 24 L58 68 C58 72, 22 72, 22 68 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" />
          <rect x="28" y="34" width="24" height="24" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
          <line x1="32" y1="42" x2="48" y2="42" stroke="#92400e" strokeWidth="1.5" />
          <line x1="32" y1="48" x2="44" y2="48" stroke="#92400e" strokeWidth="1.5" />
        </svg>
      );
    case "tabletPot":
    case "ointmentJar":
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <rect x="20" y="14" width="40" height="10" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
          <rect x="18" y="24" width="44" height="46" rx="6" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
          <rect x="24" y="34" width="32" height="20" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="28" y1="40" x2="52" y2="40" stroke="#0d9488" strokeWidth="2" />
          <line x1="28" y1="46" x2="44" y2="46" stroke="#94a3b8" strokeWidth="1.5" />
        </svg>
      );
    case "medicineCup":
    case "spoon":
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <path d="M20 25 L30 68 C30 72, 50 72, 50 68 L60 25 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
          <line x1="26" y1="38" x2="38" y2="38" stroke="#0284c7" strokeWidth="1.5" />
          <line x1="28" y1="48" x2="42" y2="48" stroke="#0284c7" strokeWidth="1.5" />
          <line x1="30" y1="58" x2="46" y2="58" stroke="#0284c7" strokeWidth="1.5" />
        </svg>
      );
    case "labels":
    case "warningLabels":
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <rect x="16" y="16" width="48" height="32" rx="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
          <circle cx="28" cy="32" r="5" fill="#eab308" />
          <line x1="38" y1="28" x2="56" y2="28" stroke="#854d0e" strokeWidth="2" />
          <line x1="38" y1="36" x2="50" y2="36" stroke="#854d0e" strokeWidth="2" />
          <rect x="22" y="30" width="48" height="32" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="30" y1="42" x2="62" y2="42" stroke="#0d9488" strokeWidth="2" />
          <line x1="30" y1="50" x2="54" y2="50" stroke="#64748b" strokeWidth="1.5" />
        </svg>
      );
    case "syringe":
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <line x1="20" y1="60" x2="14" y2="66" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="22" y="24" width="36" height="34" rx="2" transform="rotate(-45 22 24)" fill="#f1f5f9" stroke="#7e22ce" strokeWidth="2" />
          <rect x="42" y="12" width="10" height="28" transform="rotate(-45 42 12)" fill="#a855f7" />
          <line x1="58" y1="8" x2="72" y2="-6" stroke="#6b21a8" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "triangle":
    case "spatula":
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <polygon points="40,16 68,64 12,64" fill="#f1f5f9" stroke="#0d9488" strokeWidth="2.5" />
          <circle cx="40" cy="46" r="4" fill="#0d9488" />
          <circle cx="32" cy="54" r="4" fill="#14b8a6" />
          <circle cx="48" cy="54" r="4" fill="#14b8a6" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 80 80" className="product-svg-art" fill="none">
          <rect x="16" y="20" width="48" height="44" rx="6" fill="#f0fdfa" stroke="#0d9488" strokeWidth="2" />
          <circle cx="40" cy="42" r="12" fill="#ccfbf1" stroke="#0d9488" strokeWidth="1.5" />
          <path d="M40 36 L40 48 M34 42 L46 42" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

export default function ConsumablesOrderingPage() {
  const { currentUser, branch } = useApp();

  // Catalogue & Filter state
  const [catalogue] = useState(CONSUMABLES_CATALOGUE);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
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
  // Persisted in localStorage for convenience across reloads
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

  // Calculate Cart Subtotal & Total
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

  // 🛡️ CRITICAL MINIMUM ORDER VALUE RULE:
  // Subtotal must be strictly greater than £75.00
  // £74.99 -> blocked, £75.00 -> blocked, £75.01 -> allowed!
  const isMinimumOrderMet = cartSubtotal > 75.0;
  const amountNeededToMeetMin = Math.max(0, 75.01 - cartSubtotal).toFixed(2);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return catalogue.filter((p) => {
      const matchCat =
        selectedCategory === "All Products" || p.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [catalogue, selectedCategory, searchQuery]);

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

  // Open Checkout Modal
  const handleProceedToCheckout = () => {
    if (!isMinimumOrderMet) return;
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    setOrderError("");
  };

  // Submit Order to Server
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Client-side minimum order validation check
    if (!isMinimumOrderMet) {
      setOrderError(
        `Order subtotal (£${cartSubtotal.toFixed(2)}) must strictly exceed £75.00 before placing an order.`
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
          emailStatus: result.emailStatus,
          emailError: result.emailError,
          message: result.message,
        });

        // Clear basket safely once order is accepted by the server
        clearBasket();
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
  const loadPastOrders = async (filter = historyBranchFilter) => {
    setHistoryLoading(true);
    try {
      const branchId = filter === "my" ? (currentUser?.branchId || "") : "";
      const orders = await fetchConsumablesOrders(branchId);
      setPastOrders(orders);
    } catch (e) {
      console.warn("Could not load orders history:", e);
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
      alert(res.message || "Email notification resent successfully!");
      loadPastOrders();
    } catch (e) {
      alert(`Retry failed: ${e.message}`);
    }
  };

  return (
    <div className="consumables-page">
      {/* 1. Header Banner */}
      <div className="consumables-header">
        <div className="consumables-header__info">
          <h1>Consumables Ordering</h1>
          <p>
            Browse medical packaging, amber dispensing bottles, dosettes, and dispensary consumables.
            Direct electronic order request dispatched to procurement teams.
          </p>
        </div>
        <div className="consumables-header__actions">
          <button
            type="button"
            className="orders-history-btn"
            onClick={handleOpenHistory}
          >
            📋 Order History
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

      {/* 2. Controls: Search & Category Chips */}
      <div className="consumables-controls">
        <div className="search-box-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search consumables by product name, SKU, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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

      {/* 3. Product Catalogue Grid */}
      <div className="products-grid">
        {filteredProducts.map((product) => {
          const qty = cardQuantities[product.sku] || 1;
          const isInCart = basket[product.sku] !== undefined;

          return (
            <div key={product.sku} className="product-card">
              <div className="product-image-container">
                <span className="product-sku-pill">{product.sku}</span>
                {product.badge && (
                  <span className="product-badge-pill">{product.badge}</span>
                )}
                <ProductIcon type={product.iconType} />
              </div>

              <div className="product-details">
                <span className="product-category-tag">{product.category}</span>
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
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "#0d9488",
                        fontWeight: 700,
                      }}
                    >
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
        })}
      </div>

      {/* ========================================================
          4. Slide-out Basket Drawer / Panel
          ======================================================== */}
      {isCartOpen && (
        <div className="cart-modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer__header">
              <h2>
                <span>🛒</span> Basket ({cartItemCount} {cartItemCount === 1 ? "item" : "items"})
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
                  {/* Live Minimum Order Notice in Cart */}
                  {!isMinimumOrderMet ? (
                    <div className="min-order-banner min-order-banner--warning">
                      <strong>Minimum order value: £75.00</strong>
                      Your basket subtotal is currently <strong>£{cartSubtotal.toFixed(2)}</strong>.
                      Your basket must strictly exceed £75.00 before you can place your order.
                      Please add at least <strong>£{amountNeededToMeetMin}</strong> more to qualify.
                    </div>
                  ) : (
                    <div className="min-order-banner min-order-banner--success">
                      <strong>✓ Minimum order threshold met!</strong>
                      Your subtotal of <strong>£{cartSubtotal.toFixed(2)}</strong> qualifies for order placement.
                    </div>
                  )}

                  {basketItemsList.map(({ product, quantity }) => {
                    const lineTotal = (product.price * quantity).toFixed(2);
                    return (
                      <div key={product.sku} className="cart-item-card">
                        <div className="cart-item-header">
                          <div>
                            <div className="cart-item-title">{product.name}</div>
                            <div className="cart-item-meta">
                              SKU: {product.sku} • {product.packQuantity}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="cart-item-remove-btn"
                            title="Remove product"
                            onClick={() => removeFromBasket(product.sku)}
                          >
                            🗑️
                          </button>
                        </div>

                        <div className="cart-item-footer">
                          <div className="quantity-control">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() =>
                                updateBasketQuantity(product.sku, quantity - 1)
                              }
                            >
                              −
                            </button>
                            <input
                              type="number"
                              className="qty-input"
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
                              className="qty-btn"
                              onClick={() =>
                                updateBasketQuantity(product.sku, quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>

                          <div className="cart-item-price-calc">
                            {quantity} × £{product.price.toFixed(2)} ={" "}
                            <span className="cart-item-line-total">
                              £{lineTotal}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {basketItemsList.length > 0 && (
              <div className="cart-drawer__footer">
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Order Subtotal:</span>
                  <span
                    className={`cart-summary-value ${
                      isMinimumOrderMet ? "success" : ""
                    }`}
                  >
                    £{cartSubtotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  className="checkout-btn"
                  disabled={!isMinimumOrderMet}
                  onClick={handleProceedToCheckout}
                >
                  {isMinimumOrderMet ? (
                    <span>Review & Place Order →</span>
                  ) : (
                    <span>Order Blocked: Add £{amountNeededToMeetMin} More</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          5. Checkout / Place Order Review Modal
          ======================================================== */}
      {isCheckoutOpen && (
        <div
          className="cart-modal-overlay cart-modal-overlay--centered"
          onClick={() => !isSubmitting && setIsCheckoutOpen(false)}
        >
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-modal__header">
              <h2>Confirm Consumables Order</h2>
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
                    Order Successfully Placed!
                  </h2>
                  <p style={{ margin: "0 0 12px 0", color: "#64748b" }}>
                    Your consumables order has been accepted and recorded.
                  </p>

                  <div className="order-success-ref">
                    Ref: {completedOrder.orderRef}
                  </div>

                  <div>
                    {completedOrder.emailStatus === "sent" ? (
                      <span className="email-dispatch-pill sent">
                        ✉️ Notification dispatched to both procurement email addresses
                      </span>
                    ) : (
                      <span className="email-dispatch-pill failed">
                        ⚠️ Order logged, but email notification reported:{" "}
                        {completedOrder.emailError || "Pending dispatch"}
                      </span>
                    )}
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
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <strong>Order Total:</strong> £
                      {Number(completedOrder.total || cartSubtotal).toFixed(2)} GBP
                    </div>
                    <div>
                      <strong>Date & Time:</strong>{" "}
                      {new Date().toLocaleString("en-GB")}
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
                    <h3>2. Order Summary ({cartItemCount} Items)</h3>
                    <table className="order-review-table">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Product</th>
                          <th style={{ textAlign: "center" }}>Qty</th>
                          <th style={{ textAlign: "right" }}>Unit Price</th>
                          <th style={{ textAlign: "right" }}>Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {basketItemsList.map(({ product, quantity }) => (
                          <tr key={product.sku}>
                            <td style={{ fontFamily: "monospace", color: "#0d9488", fontWeight: 700 }}>
                              {product.sku}
                            </td>
                            <td>
                              <strong>{product.name}</strong>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                {product.packQuantity}
                              </div>
                            </td>
                            <td style={{ textAlign: "center", fontWeight: 700 }}>
                              {quantity}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              £{product.price.toFixed(2)}
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 700 }}>
                              £{(product.price * quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} style={{ textAlign: "right", fontWeight: 700 }}>
                            Order Subtotal:
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 800, fontSize: "1rem" }}>
                            £{cartSubtotal.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={4} style={{ textAlign: "right", fontWeight: 800, color: "#0d9488" }}>
                            Total (GBP):
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 800, fontSize: "1.2rem", color: "#0d9488" }}>
                            £{cartSubtotal.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div style={{ fontSize: "0.78rem", color: "#64748b", textAlign: "center" }}>
                    ℹ️ Upon clicking "Confirm & Place Order", complete order details will be transmitted electronically to the two configured procurement email inboxes. No credit card is required.
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
                    disabled={isSubmitting || !isMinimumOrderMet}
                  >
                    {isSubmitting ? "Processing Order..." : "Confirm & Place Order →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          6. Order History Modal (With complete itemised quantities & details)
          ======================================================== */}
      {isHistoryOpen && (
        <div className="cart-modal-overlay cart-modal-overlay--centered" onClick={() => setIsHistoryOpen(false)}>
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

            <div style={{ padding: "10px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
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
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Order Details ({orderItems.length} lines, {totalUnits} total items):
                          </span>
                          <table className="history-items-table">
                            <thead>
                              <tr>
                                <th>SKU</th>
                                <th>Product Name & Pack</th>
                                <th style={{ textAlign: "center" }}>Quantity</th>
                                <th style={{ textAlign: "right" }}>Unit Price</th>
                                <th style={{ textAlign: "right" }}>Line Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderItems.map((item, idx) => (
                                <tr key={item.sku || idx}>
                                  <td style={{ fontFamily: "monospace", color: "#0d9488", fontWeight: 700 }}>
                                    {item.sku}
                                  </td>
                                  <td>
                                    <strong>{item.name}</strong>
                                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                      {item.packQuantity || ""} {item.size ? `(${item.size})` : ""}
                                    </div>
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <span className="history-qty-pill">
                                      {item.quantity}
                                    </span>
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
                            {ord.email_status === "sent" ? "✓ Email Notification Dispatched" : "⚠️ Email Dispatch Pending/Failed"}
                          </span>

                          <div style={{ display: "flex", gap: "8px" }}>
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
}
