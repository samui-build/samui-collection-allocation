import { Snapshot, SnapshotWallet } from "../../src/snapshots";
import { getContext } from "./get-context";
import { getHoldersMint } from "./get-holders-mint";

export async function getSnapshotWalletsToken(snapshot: Snapshot) {
  const {collectionOrMint: mint, helius, updateWallets} = await getContext(snapshot)
  const holderMap: Record<string, SnapshotWallet> = {}


  const assets = await getHoldersMint(helius, mint)

  for (const asset of assets.items) {
    if (!asset.owner) {
      console.log(` => No owner found for token account ${asset.address}`)
      continue
    }
    if (asset.owner in holderMap) {
      holderMap[asset.owner].amount = Number(asset.amount) + holderMap[asset.owner].amount
      continue
    }
    holderMap[asset.owner] = {address: asset.owner, amount: Number(asset.amount)}
  }

  const holders: SnapshotWallet[] = Object.values(holderMap)
  // Sort by address and amount
  holders.sort((a, b) => a.address.localeCompare(b.address)).sort((a, b) => b.amount - a.amount)

  updateWallets(holders)
}