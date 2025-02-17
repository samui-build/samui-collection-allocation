import { snapshotMap, snapshots } from './snapshots'
import { PublicKey } from '@solana/web3.js'

for (const snapshot of snapshots) {
  const tag = ` -> [${snapshot.id}]`
  const wallets = snapshotMap.get(snapshot.id)
  if (!wallets) {
    throw new Error(`${tag} No wallets found.`)
  }
  if (snapshot.type !== 'static') {
    console.log(`${tag} Skipping snapshot.`)
    continue
  }
  console.log(`${tag} Verifying snapshot.`)
  const domains: string[] = []
  for (const wallet of wallets) {
    if (!wallet.address) {
      throw new Error(`${tag} No address found for wallet ${JSON.stringify(wallet)}`)
    }

    // We want to filter out the domains
    if (wallet.address.includes('.')) {
      console.log(`${tag} WARNING Incompatible address ${wallet.address} (includes a dot)`)
      domains.push(wallet.address)
      // And any other invalid addresses
    } else if (!isValidAddress(wallet.address)) {
      console.log(`${tag} ERROR Invalid address ${wallet.address}`)
      throw new Error(`Invalid address ${wallet.address}`)
    }
  }
  if (domains.length > 0) {
    console.log(`${tag} ERROR Found ${domains.length} domains.`)
    console.log(`${domains.join('\n')}`)
    throw new Error(`Found domains in snapshot ${snapshot.id}`)
  } else {
    console.log(`${tag} No domains found.`)
  }
}

function isValidAddress(address: string) {
  try {
    new PublicKey(address)
    return true
    // eslint-disable-next-line
  } catch (error) {
    return false
  }
}
