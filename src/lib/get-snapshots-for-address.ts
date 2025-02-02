import { Snapshot, snapshots, SnapshotWallet } from "../snapshots";
import { getSnapshot } from "./get-snapshot";

export async function getSnapshotsForAddress(address: string): Promise<{
  address: string,
  allocation: number,
  snapshots: Record<string, { snapshot: Snapshot, wallet: SnapshotWallet }>
}> {
  const results = {address, allocation: 0, snapshots: new Map<string, { snapshot: Snapshot, wallet: SnapshotWallet }>()}

  for (const snapshot of snapshots) {
    results.snapshots.set(snapshot.id, {
      snapshot,
      wallet: {address, amount: 0, allocation: 0},
    })

    const wallets = await getSnapshot(snapshot.id)
    if (!wallets) {
      continue
    }

    const found = wallets.find((wallet) => wallet.address === address)
    if (!found) {
      continue
    }

    // check if the amount is greater than the minimum to get the allocation
    if (found.amount >= snapshot.minimumAmount) {
      found.allocation = 1
      results.allocation += found.allocation
      results.snapshots.get(snapshot.id)!.wallet = found
    }
  }

  return {...results, snapshots: Object.fromEntries(results.snapshots)}
}

