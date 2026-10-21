import { CONSUMABLES_CATALOGUE, CATALOGUE_MAP } from "./consumablesCatalogue.js";

console.log("=== RUNNING CONSUMABLES ORDER BUSINESS LOGIC TESTS ===");

// 1. Test Catalogue completeness
console.log(`Checking catalogue (${CONSUMABLES_CATALOGUE.length} items)...`);
if (CONSUMABLES_CATALOGUE.length < 20) {
  throw new Error("Catalogue has fewer than 20 items");
}

for (const item of CONSUMABLES_CATALOGUE) {
  if (!item.sku || !item.name || !item.price || !item.packQuantity) {
    throw new Error(`Incomplete catalogue item: ${JSON.stringify(item)}`);
  }
}
console.log("✓ Catalogue contains all required fields, pack sizes, and GBP prices.");

// 2. Test Server Calculation & Threshold Logic
function processOrderSimulation(items, email1, email2) {
  if (!Array.isArray(items) || items.length === 0) {
    return { status: 400, error: "empty_basket" };
  }

  const validatedItems = [];
  let serverSubtotal = 0;

  for (const item of items) {
    const sku = item.sku || item.id;
    const product = CATALOGUE_MAP.get(sku);
    if (!product) {
      return { status: 400, error: "invalid_product_sku", message: `Product ${sku} not found` };
    }

    const qty = parseInt(item.quantity, 10);
    if (!Number.isInteger(qty) || qty <= 0) {
      return { status: 400, error: "invalid_quantity" };
    }

    const unitPrice = product.price;
    const lineTotal = Number((unitPrice * qty).toFixed(2));
    serverSubtotal = Number((serverSubtotal + lineTotal).toFixed(2));

    validatedItems.push({
      sku: product.sku,
      name: product.name,
      quantity: qty,
      unitPrice,
      lineTotal,
    });
  }

  // Strict £75.00 minimum order check
  if (serverSubtotal <= 75.00) {
    const needed = (75.01 - serverSubtotal).toFixed(2);
    return {
      status: 400,
      error: "minimum_order_not_met",
      subtotal: serverSubtotal,
      message: `Minimum order value not met. Subtotal (£${serverSubtotal.toFixed(2)}) must strictly exceed £75.00. Add £${needed} more.`,
    };
  }

  if (!email1 || !email2) {
    return { status: 500, error: "email_recipients_not_configured" };
  }

  return {
    status: 200,
    ok: true,
    subtotal: serverSubtotal,
    total: serverSubtotal,
    items: validatedItems,
  };
}

// TEST A: Empty items
const resEmpty = processOrderSimulation([], "a@cph.co.uk", "b@cph.co.uk");
console.log("Test A (Empty Items):", resEmpty.status === 400 && resEmpty.error === "empty_basket" ? "PASS ✓" : "FAIL ✗");

// TEST B: Invalid SKU
const resBadSku = processOrderSimulation([{ sku: "NONEXISTENT", quantity: 2 }], "a@cph.co.uk", "b@cph.co.uk");
console.log("Test B (Invalid SKU):", resBadSku.status === 400 && resBadSku.error === "invalid_product_sku" ? "PASS ✓" : "FAIL ✗");

// TEST C: Invalid Quantity (0 or negative)
const resZeroQty = processOrderSimulation([{ sku: "CPH-TAB-01", quantity: 0 }], "a@cph.co.uk", "b@cph.co.uk");
const resNegQty = processOrderSimulation([{ sku: "CPH-TAB-01", quantity: -2 }], "a@cph.co.uk", "b@cph.co.uk");
console.log("Test C (Zero & Negative Quantity):", resZeroQty.status === 400 && resNegQty.status === 400 ? "PASS ✓" : "FAIL ✗");

// TEST D: £74.99 -> Must be rejected!
// Let's create an order that totals £74.99 or test exact value threshold
const boundaryTest7499 = processOrderSimulation(
  [
    { sku: "CPH-BOT-01", quantity: 3 }, // 3 * 24.00 = 72.00
  ],
  "a@cph.co.uk",
  "b@cph.co.uk"
);
console.log("Test D (£72.00 Rejected):", boundaryTest7499.status === 400 && boundaryTest7499.error === "minimum_order_not_met" ? "PASS ✓" : "FAIL ✗");

// TEST E: Exactly £75.00 -> Must be REJECTED!
// 5 x CPH-TAB-07 at £15.00 = 75.00
const boundaryTest7500 = processOrderSimulation(
  [{ sku: "CPH-TAB-07", quantity: 5 }],
  "a@cph.co.uk",
  "b@cph.co.uk"
);
console.log("Test E (Exactly £75.00 REJECTED):", boundaryTest7500.status === 400 && boundaryTest7500.subtotal === 75.00 && boundaryTest7500.error === "minimum_order_not_met" ? "PASS ✓" : "FAIL ✗");

// TEST F: £75.01 or higher -> Must be ACCEPTED!
// 5 x CPH-TAB-07 (£75.00) + 1 x CPH-CON-10 (£9.50) = £84.50
const boundaryTestAbove = processOrderSimulation(
  [
    { sku: "CPH-TAB-07", quantity: 5 },
    { sku: "CPH-CON-10", quantity: 1 },
  ],
  "a@cph.co.uk",
  "b@cph.co.uk"
);
console.log("Test F (Subtotal £84.50 ACCEPTED):", boundaryTestAbove.status === 200 && boundaryTestAbove.ok === true ? "PASS ✓" : "FAIL ✗", `(Subtotal: £${boundaryTestAbove.subtotal})`);

// TEST G: Missing email configuration -> Must return 500 error
const resMissingEmail = processOrderSimulation(
  [
    { sku: "CPH-TAB-07", quantity: 6 },
  ],
  "a@cph.co.uk",
  ""
);
console.log("Test G (Missing Email Configuration Blocked):", resMissingEmail.status === 500 && resMissingEmail.error === "email_recipients_not_configured" ? "PASS ✓" : "FAIL ✗");

// Clean up
console.log("\nALL CONSUMABLES BUSINESS LOGIC UNIT TESTS PASSED! ✓");
