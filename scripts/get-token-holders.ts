import { getContext, Holder } from "./get-context";
import { getLargestTokenHolders } from "./get-largest-token-holders";

async function main() {
  const {collectionOrMint: mint, helius, updateWallets} = await getContext()
  const holderMap: Record<string, Holder> = {}

  const assets = await getLargestTokenHolders(helius, mint)

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
    // console.log(asset)
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

