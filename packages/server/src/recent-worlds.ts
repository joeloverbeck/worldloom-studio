import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export interface RecentWorld {
  path: string;
  openedAt: string;
}

const configPath = (): string => {
  const root = process.env.WORLDLOOM_CONFIG_DIR ?? join(process.cwd(), ".worldloom-studio");
  return join(root, "recent-worlds.json");
};

export const listRecentWorlds = (): RecentWorld[] => {
  try {
    return JSON.parse(readFileSync(configPath(), "utf8")) as RecentWorld[];
  } catch {
    return [];
  }
};

export const rememberWorld = (path: string): RecentWorld[] => {
  const resolved = resolve(path);
  const next = [{ path: resolved, openedAt: new Date().toISOString() }, ...listRecentWorlds().filter((item) => item.path !== resolved)].slice(0, 12);
  const target = configPath();
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(next, null, 2)}\n`);
  return next;
};
