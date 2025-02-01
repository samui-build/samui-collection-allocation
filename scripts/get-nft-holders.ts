import { getAllAssetsByGroup } from "./get-all-assets-by-group";
import { getContext, Holder } from "./get-context";

async function main() {
  const {collectionOrMint: collection, helius, updateWallets} = await getContext()
  const holderMap: Record<string, Holder> = {}

  const assets = await getAllAssetsByGroup(helius, collection)

  for (const asset of assets.items) {
    if (asset.ownership.owner in holderMap) {
      holderMap[asset.ownership.owner].amount++
      continue
    }
    holderMap[asset.ownership.owner] = {address: asset.ownership.owner, amount: 1,}
  }

  const holders: Holder[] = Object.values(holderMap)
  // Sort by amount
  holders.sort((a, b) => b.amount - a.amount)

  updateWallets(holders)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

