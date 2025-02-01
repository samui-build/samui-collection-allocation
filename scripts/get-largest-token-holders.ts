import { DAS, Helius } from "helius-sdk";

export interface LargestTokenHolders {
  total: number,
  items: DAS.TokenAccounts[],
  limit: number,
  page: number,
}

/**
 * Get the largest token holders
 * @param client Helius client
 * @param mint string Solana mint address
 */
export async function getLargestTokenHolders(
  client: Helius,
  mint: string,
): Promise<LargestTokenHolders> {
  let page = 1
  // Create a response list similar to the one returned by the API
  const list: LargestTokenHolders = {
    total: 0,
    items: [],
    limit: 1000,
    page
  }

  // Loop through all pages of assets
  while (list.total < page * list.limit) {

    console.log(` => Fetching page ${page} of holders of mint ${mint}`)
    const assets = await client.rpc.getTokenAccounts({mint, limit: list.limit, page: page})

    if (!assets?.token_accounts?.length) {
      console.log(` => No ${page > 1 ? 'more' : ''} token accounts found for mint ${mint}`)
      break
    }

    if (assets?.token_accounts?.length === 0) {
      break
    }
    list.items.push(...assets.token_accounts)
    list.total += assets.total ?? 0
    page++
  }

  // Filter the assets by owner
  const items = list.items?.length ? list?.items : []

  // Return the list with the page offset by 1
  return {...list, page: page - 1, items}
}