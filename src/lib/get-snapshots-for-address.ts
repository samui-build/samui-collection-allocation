import { Snapshot, snapshots, SnapshotWallet } from "../snapshots";
import { getSnapshot } from "./get-snapshot";

export async function getSnapshotsForAddress(address: string): Promise<{
  address: string,
  allocation: number,
  snapshots: Record<string, Omit<SnapshotWallet, 'address'>>
}> {
  const results = {
    address,
    allocation: 0,
    snapshots: new Map<string, Omit<SnapshotWallet, 'address'>>(),
  }

  for (const snapshot of snapshots) {
    results.snapshots.set(snapshot.id, {
      amount: 0,
      allocation: 0
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
      results.snapshots.get(snapshot.id)!.amount = found.amount
      results.snapshots.get(snapshot.id)!.allocation = found.allocation
    }
  }

  return {...results, snapshots: Object.fromEntries(results.snapshots)}
}

