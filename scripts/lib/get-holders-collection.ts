import { DAS, Helius } from 'helius-sdk'

/**
 * Get all assets by collection
 * @param client Helius Helius client
 * @param group string Solana account address of group
 */
export async function getHoldersCollection(client: Helius, group: string): Promise<DAS.GetAssetResponseList> {
  let page = 1
  // Create a response list similar to the one returned by the API
  const list: DAS.GetAssetResponseList = { total: 0, items: [], limit: 1000, page }

  // Loop through all pages of assets
  while (list.total < page * list.limit) {
    console.log(`   => getAllAssetsByGroup [${group}] => Fetching page ${page}...`)
    const assets = await client.rpc.getAssetsByGroup({
      groupKey: 'collection',
      groupValue: group,
      limit: list.limit,
      page: page,
    })
    if (assets.items.length === 0) {
      break
    }
    list.items.push(...assets.items)
    list.total += assets.total
    page++
  }

  // Filter the assets by owner
  const items = list.items?.length ? list?.items : []

  // Return the list with the page offset by 1
  return { ...list, page: page - 1, items }
}
