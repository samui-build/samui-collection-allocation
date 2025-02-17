import { Connection, PublicKey } from '@solana/web3.js'
import { Snapshot, SnapshotWallet } from '../../src/snapshots'
import { getContext } from './get-context'
import { ANS_PROGRAM_ID, NameRecordHeader } from '@onsol/tldparser'

export async function getSnapshotWalletsDomain(snapshot: Snapshot) {
  const { helius, updateWallets } = await getContext(snapshot)

  const owners = await getOwnersFromNameAccount(helius.connection, snapshot.address)

  const holders: SnapshotWallet[] = countHolders(owners)
  // Sort by address and amount
  holders.sort((a, b) => a.address!.localeCompare(b.address!)).sort((a, b) => b.amount - a.amount)

  updateWallets(holders)
}

async function getOwnersFromNameAccount(connection: Connection, nameAccount: string) {
  return await findAllDomainsForTld(connection, new PublicKey(nameAccount)).then((accounts) => {
    return accounts
      .map(({ account }) => NameRecordHeader.fromAccountInfo(account))
      .map((account) => account?.owner?.toBase58())
      .filter((owner) => owner !== undefined)
      .sort()
  })
}

export async function findAllDomainsForTld(connection: Connection, parentAccount: PublicKey) {
  return await connection.getProgramAccounts(ANS_PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 8,
          bytes: parentAccount.toBase58(),
          encoding: 'base58',
        },
      },
    ],
  })
}

function countHolders(addresses: string[]): SnapshotWallet[] {
  const addressMap = new Map<string, number>()

  addresses.forEach((address) => {
    addressMap.set(address, (addressMap.get(address) || 0) + 1)
  })

  return Array.from(addressMap, ([address, amount]) => ({ address, amount }))
}
