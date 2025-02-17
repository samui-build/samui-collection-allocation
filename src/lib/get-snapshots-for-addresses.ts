import { SnapshotWallet } from '../snapshots'
import { getSnapshotsForAddress } from './get-snapshots-for-address'

export async function getSnapshotsForAddresses(addresses: string[]): Promise<
  {
    address: string
    allocation: number
    snapshots: Record<string, Omit<SnapshotWallet, 'address'>>
  }[]
> {
  return await Promise.all(
    addresses.map(async (address) => {
      return await getSnapshotsForAddress(address)
    }),
  )
}
