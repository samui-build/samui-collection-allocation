import { snapshotMap, SnapshotWallet } from "../snapshots";

export async function getSnapshot(id: string): Promise<SnapshotWallet[]> {
  const found = snapshotMap.get(id)
  if (!found) {
    console.log(`getSnapshot [${id}]: Snapshot not found`)
    return []
  }
  return found
}