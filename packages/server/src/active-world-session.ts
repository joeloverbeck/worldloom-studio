import { listRecentWorlds, rememberWorld, type RecentWorld } from "./recent-worlds.js";
import { WorldFile } from "./world-file.js";

export class ActiveWorldSession {
  current: WorldFile | null = null;

  create(path: string): WorldFile {
    const worldFile = WorldFile.create(this.validatedPath(path));
    this.replace(worldFile);
    rememberWorld(worldFile.path);
    return worldFile;
  }

  open(path: string): WorldFile {
    const worldFile = WorldFile.open(this.validatedPath(path));
    this.replace(worldFile);
    rememberWorld(worldFile.path);
    return worldFile;
  }

  close(): void {
    this.replace(null);
  }

  recentWorlds(): RecentWorld[] {
    return listRecentWorlds();
  }

  private replace(worldFile: WorldFile | null): void {
    this.current?.close();
    this.current = worldFile;
  }

  private validatedPath(path: string): string {
    const trimmed = path?.trim();
    if (!trimmed) throw new Error("World file path is required.");
    return trimmed;
  }
}
