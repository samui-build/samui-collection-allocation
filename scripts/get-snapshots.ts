import { snapshots } from '../src/snapshots'
import { getSnapshotWalletsNft } from './lib/get-snapshot-wallets-nft'
import { getSnapshotWalletsToken } from './lib/get-snapshot-wallets-token'
import { getSnapshotWalletsDomain } from './lib/get-snapshot-wallets-domain'

async function main() {
  for (const snapshot of snapshots) {
    switch (snapshot.type) {
      case 'domain':
        console.log(` => Fetching domain snapshot ${snapshot.id} of ${snapshot.name}`)
        await getSnapshotWalletsDomain(snapshot)
        break
      case 'nft':
        console.log(` => Fetching nft snapshot ${snapshot.id} of ${snapshot.name}`)
        await getSnapshotWalletsNft(snapshot)
        break
      case 'static':
        console.log(` => Skipping static snapshot ${snapshot.id} of ${snapshot.name}`)
        break
      case 'token':
        console.log(` => Fetching token snapshot ${snapshot.id} of ${snapshot.name}`)
        await getSnapshotWalletsToken(snapshot)
        break
      default:
        console.log(` => Unknown snapshot type ${snapshot.type}`)
        break
    }
  }
}

main().catch((error) => {
  throw error
})
