import { readFileSync } from "fs";
import { resolve } from "path";
import { searchProductsByName } from "../lib/db/products";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (e) {
    console.error("No .env.local found");
  }
}

async function test() {
  loadEnvLocal();
  console.log("Searching for 'panadol'...");
  const results = await searchProductsByName("panadol");
  console.log("Results:\n", JSON.stringify(results, null, 2));
}

test().catch(console.error);
