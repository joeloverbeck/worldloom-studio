import { listRecentWorlds, rememberWorld, type RecentWorld } from "./recent-worlds.js";
import { WorldFile } from "./world-file.js";

export class ActiveWorldSession {
  current: WorldFile | null = null;

  create(path: string): WorldFile {
    this.replace(null);
    const worldFile = WorldFile.create(path);
    this.replace(worldFile);
    rememberWorld(worldFile.path);
    return worldFile;
  }

  open(path: string): WorldFile {
    this.replace(null);
    const worldFile = WorldFile.open(path);
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
}
