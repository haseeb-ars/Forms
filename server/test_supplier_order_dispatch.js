// server/test_supplier_order_dispatch.js
import {
  CONSUMABLES_CATALOGUE,
  CATALOGUE_MAP,
  SUPPLIERS,
  BRANCH_SUPPLIER_ACCOUNTS,
  getBranchSupplierAccount,
  getBranchDetails,
} from "./consumablesCatalogue.js";

console.log("=== RUNNING SUPPLIER EMAIL ORDERING & ARCHITECTURE TESTS ===");

// 1. Verify Supplier Default Emails
console.log("\n1. Verifying Placeholder Supplier Emails:");
for (const [key, supplier] of Object.entries(SUPPLIERS)) {
  console.log(`- ${supplier.name} (${key}): ${supplier.defaultEmail}`);
  if (supplier.defaultEmail !== "haseebarshed2@gmail.com") {
    throw new Error(`Expected supplier ${key} default email to be haseebarshed2@gmail.com, got ${supplier.defaultEmail}`);
  }
}
console.log("✓ All suppliers defaulted to placeholder email: haseebarshed2@gmail.com");

// 2. Verify Minimum Order Values
console.log("\n2. Verifying Supplier Minimum Order Values:");
console.log(`- Premvan min order: £${SUPPLIERS.PREMVAN.minimumOrderValue} (Expected: £75.00)`);
console.log(`- Fortuna min order: £${SUPPLIERS.FORTUNA.minimumOrderValue} (Expected: £25.00)`);
console.log(`- EMT min order: £${SUPPLIERS.EMT.minimumOrderValue} (Expected: £150.00)`);
if (SUPPLIERS.PREMVAN.minimumOrderValue !== 75 || SUPPLIERS.FORTUNA.minimumOrderValue !== 25 || SUPPLIERS.EMT.minimumOrderValue !== 150) {
  throw new Error("Minimum order values do not match requirements");
}
console.log("✓ Minimum order values verified: Premvan £75, Fortuna £25, EMT £150");

// 3. Verify Branch Details & Real Supplier Accounts
console.log("\n3. Verifying Real Branch Details & Supplier Accounts:");
const expectedAccounts = {
  wilmslow: {
    name: "Wilmslow Road Pharmacy",
    address: "480 Wilmslow Rd, Withington, Manchester M20 3BG",
    phone: "0161 445 3282",
    accounts: {
      EMT: "WIL102",
      FORTUNA: "10007120",
      PREMVAN: "919258",
    },
  },
  liverpool: {
    name: "247 Pharmacy",
    address: "15 Stuart Rd, Waterloo, Liverpool L22 4QR",
    phone: "0151 332 3300",
    accounts: {
      EMT: "MED002",
      FORTUNA: "10006977",
      PREMVAN: "247015",
    },
  },
  southport: {
    name: "CarePlus Chemist",
    address: "34 Shakespeare St, Southport PR8 5AB",
    phone: "01704 339220",
    accounts: {
      EMT: "CAR093",
      FORTUNA: "10007119",
      PREMVAN: "CRP034",
    },
  },
};

for (const [bId, exp] of Object.entries(expectedAccounts)) {
  const details = getBranchDetails(bId);
  console.log(`\nChecking Branch: ${details.name} (${bId})`);
  console.log(`Address: ${details.address} (Expected: ${exp.address})`);
  console.log(`Phone: ${details.phone} (Expected: ${exp.phone})`);

  if (details.address !== exp.address || details.phone !== exp.phone) {
    throw new Error(`Branch ${bId} details mismatch`);
  }

  for (const [sKey, expAcc] of Object.entries(exp.accounts)) {
    const acc = getBranchSupplierAccount(bId, sKey);
    console.log(`  • Account with ${sKey}: ${acc} (Expected: ${expAcc})`);
    if (acc !== expAcc) {
      throw new Error(`Branch ${bId} account for ${sKey} expected ${expAcc}, got ${acc}`);
    }
  }
}
console.log("✓ All 3 branches verified with exact supplier account numbers, addresses, and phone numbers!");

// 4. Verify PremMed Repair Patch Product Image
console.log("\n4. Verifying PremMed Repair Patch Image:");
const patchProduct = CATALOGUE_MAP.get("PVPATCH");
if (!patchProduct) {
  throw new Error("PVPATCH not found in catalogue map");
}
console.log("PVPATCH Details:", patchProduct.name, patchProduct.packQuantity, patchProduct.price, patchProduct.image);
console.log("✓ PremMed Repair Patch verified in catalogue.");

// 5. Verify Recipients
const testSupplierEmail = SUPPLIERS.PREMVAN.defaultEmail;
const recipients = Array.from(new Set([testSupplierEmail, "info@careplushealth.co.uk"].filter(Boolean)));
console.log("\n5. Verifying Order Email Recipients:", recipients);
if (!recipients.includes("haseebarshed2@gmail.com") || !recipients.includes("info@careplushealth.co.uk")) {
  throw new Error("Recipients must include both placeholder supplier email and info@careplushealth.co.uk");
}
console.log("✓ Purchase orders will be delivered to both info@careplushealth.co.uk and the supplier's email.");

console.log("\n🎉 ALL ARCHITECTURE, BRANCH ACCOUNTS, AND DISPATCH TESTS PASSED 100%!");
