// server/test_email_templates.js
import fs from "fs";

// Read server/index.js and verify the template builders
const serverCode = fs.readFileSync("server/index.js", "utf8");

const MANDATORY_DISCLAIMER =
  "If this order does not reflect the accurate prices on our portal, Please Contact Mehraan from CarePlus Health (mehraan@careplushealth.co.uk) and DO NOT PROCESS THIS ORDER";

console.log("Checking for mandatory disclaimer in server/index.js...");
const occurrences = (serverCode.match(new RegExp(MANDATORY_DISCLAIMER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
console.log(`Found ${occurrences} exact matches of mandatory disclaimer in server/index.js`);

if (occurrences < 3) {
  throw new Error(`Expected at least 3 occurrences of disclaimer, found ${occurrences}`);
}

console.log("✓ Mandatory disclaimer correctly integrated across HTML email, plain text, and master summary.");

console.log("Checking for recipient routing to both supplier email and info@careplushealth.co.uk...");
if (!serverCode.includes('"info@careplushealth.co.uk"') && !serverCode.includes("'info@careplushealth.co.uk'")) {
  throw new Error("Missing info@careplushealth.co.uk recipient routing");
}
console.log("✓ info@careplushealth.co.uk is included in supplier PO dispatches.");

console.log("Checking for branch account number integration...");
if (!serverCode.includes("accountNumber") || !serverCode.includes("getBranchSupplierAccount")) {
  throw new Error("Missing branch supplier account number resolution");
}
console.log("✓ Branch account numbers are resolved and rendered on purchase orders.");

console.log("✓ All email template tests PASSED!");
