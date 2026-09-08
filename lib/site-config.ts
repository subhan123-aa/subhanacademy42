import { promises as fs } from "fs";
import path from "path";
import type { SiteConfig } from "@/lib/types";

const dataDir = process.env.VERCEL || process.env.NODE_ENV === "production"
  ? path.join("/tmp", ".data")
  : path.join(process.cwd(), ".data");
const fileName = "site-config.json";

const defaultConfig: SiteConfig = {
  heroHeadline: "Build Your Own Local Grocery Business",
  heroSubheadline:
    "Learn how I built SabjiHub from scratch and how you can build and launch your own local grocery delivery platform in your city.",
  dashboardShowcaseImage: "/images/sabjihub-dashboard-showcase.svg",
  stats: [
    { label: "5K+ App Downloads", value: "5K+", detail: "Community signal and product interest." },
    { label: "400+ Orders Delivered", value: "400+", detail: "Real operations experience from the SabjiHub journey." },
    { label: "2L+ Sales", value: "2L+", detail: "Sales milestone reflected in the case study." },
    { label: "Real Local Business Experience", value: "100%", detail: "Built for people who want practical execution." }
  ]
};

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {
    // Ignore error if directory exists or restricted
  }
}

export async function getSiteConfig(): Promise<SiteConfig> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(path.join(dataDir, fileName), "utf8");
    return JSON.parse(raw) as SiteConfig;
  } catch {
    return defaultConfig;
  }
}

export async function saveSiteConfig(config: SiteConfig) {
  try {
    await ensureDataDir();
    await fs.writeFile(path.join(dataDir, fileName), JSON.stringify(config, null, 2), "utf8");
  } catch (err) {
    console.warn("[lib/site-config] Warning: Could not write site config:", err);
  }
}

export function getDefaultSiteConfig() {
  return defaultConfig;
}
