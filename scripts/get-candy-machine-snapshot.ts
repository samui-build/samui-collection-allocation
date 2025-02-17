import { writeFileSync } from 'node:fs'
import { getSnapshot } from '../src/lib/get-snapshot'
import { snapshots } from '../src/snapshots'

async function main() {
  const result: string[] = []
  for (const snapshot of snapshots) {
    const wallets = await getSnapshot(snapshot.id)
    if (!wallets) {
      console.log(` => No wallets found for ${snapshot.id}`)
      continue
    }
    console.log(` => Found ${wallets.length} wallets for ${snapshot.id}`)
    for (const wallet of wallets) {
      result.push(wallet.address)
    }
  }

  const unique = [...new Set(result.sort())]
  writeFileSync(`${process.cwd()}/src/snapshots/candy-machine.json`, JSON.stringify(unique, null, 2))
  console.log(` => Updated candy-machine.json with ${unique.length} wallets`)
}

main().catch((error) => {
  throw error
})
