import { calculateTrustScore } from "@/lib/trust-score/calculate";
import { getVerdict } from "@/lib/trust-score/verdict";

type Factors = Parameters<typeof calculateTrustScore>[0] & { notFoundInSystem?: boolean };

function runScenario(
  name: string,
  factors: Factors,
  options?: { useUnknownVerdict?: boolean; expectedScore?: number; expectedVerdict?: string },
) {
  const inDB = !factors.notFoundInSystem;
  const { score, breakdown } = calculateTrustScore({
    inMarkSureDB: inDB,
    adminVerified: factors.adminVerified || false,
    hasValidBarcode: factors.hasValidBarcode !== undefined ? factors.hasValidBarcode : (factors as any).validBarcode || false,
    reportCount: factors.reportCount || 0,
    batchMismatch: factors.batchMismatch !== undefined ? factors.batchMismatch : (factors as any).invalidBatch || false,
  });
  const verdict = getVerdict(score, inDB);

  console.log(`\n=== ${name} ===`);
  console.log("Factors:", JSON.stringify(factors));
  console.log("Score:", score);
  console.log("Verdict:", verdict);
  if (options?.expectedScore !== undefined) {
    console.log(
      "Expected score:",
      options.expectedScore,
      score === options.expectedScore ? "✓" : "✗",
    );
  }
  if (options?.expectedVerdict !== undefined) {
    console.log(
      "Expected verdict:",
      options.expectedVerdict,
      verdict === options.expectedVerdict ? "✓" : "✗",
    );
  }
  console.log("Breakdown:");
  for (const factor of breakdown) {
    const sign = factor.points >= 0 ? "+" : "";
    console.log(`  - ${factor.label} (${sign}${factor.points})`);
  }
}

// Scenario 1: Verified safe product → score 90, verdict 'safe'
runScenario(
  "Verified safe product",
  {
    adminVerified: true,
    inMarkSureDB: true,
    hasValidBarcode: true,
    reportCount: 0,
    batchMismatch: false,
    notFoundInSystem: false,
  },
  { expectedScore: 90, expectedVerdict: "safe" },
);

// Scenario 2: Product with 2 reports (in DB, valid barcode, not admin verified)
runScenario("Product with 2 reports", {
  adminVerified: false,
  inMarkSureDB: true,
  hasValidBarcode: true,
  reportCount: 2,
  batchMismatch: false,
  notFoundInSystem: false,
});

// Scenario 3: Product with invalid batch number
runScenario("Product with invalid batch number", {
  adminVerified: false,
  inMarkSureDB: true,
  hasValidBarcode: true,
  reportCount: 0,
  batchMismatch: true,
  notFoundInSystem: false,
});

// Scenario 4: Unknown product (not found in system) → score 0, verdict 'unknown'
runScenario(
  "Unknown product (not found in system)",
  {
    adminVerified: false,
    inMarkSureDB: false,
    hasValidBarcode: false,
    reportCount: 0,
    batchMismatch: false,
    notFoundInSystem: true,
  },
  { useUnknownVerdict: true, expectedScore: 0, expectedVerdict: "unknown" },
);
