import { Snapshot, SnapshotWallet } from '../../src/snapshots'
import { getContext } from './get-context'
import { getHoldersCollection } from './get-holders-collection'

export async function getSnapshotWalletsNft(snapshot: Snapshot) {
  const { collectionOrMint: collection, helius, updateWallets } = await getContext(snapshot)
  const holderMap: Record<string, SnapshotWallet> = {}

  const assets = await getHoldersCollection(helius, collection)

  for (const asset of assets.items) {
    if (asset.ownership.owner in holderMap) {
      holderMap[asset.ownership.owner].amount++
      continue
    }
    holderMap[asset.ownership.owner] = { address: asset.ownership.owner, amount: 1 }
  }

  const holders: SnapshotWallet[] = Object.values(holderMap)
  // Sort by address and amount
  holders.sort((a, b) => a.address.localeCompare(b.address)).sort((a, b) => b.amount - a.amount)

  updateWallets(holders)
}
