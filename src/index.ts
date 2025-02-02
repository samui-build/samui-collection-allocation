import { PublicKey } from '@solana/web3.js'
import { Hono } from 'hono'
import { getSnapshot } from "./lib/get-snapshot";
import { getSnapshotsForAddress } from "./lib/get-snapshots-for-address";
import { snapshots } from "./snapshots";

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/snapshots', (c) => {
  return c.json(snapshots)
})

app.get('/snapshots/:id', async (c) => {
  const id = c.req.param('id')
  const snapshot = snapshots.find((snapshot) => snapshot.id === id)
  if (!snapshot) {
    return c.text('Snapshot not found')
  }
  return c.json({...snapshot, wallets: await getSnapshot(snapshot.id)})
})


app.get('/wallet/:address', async (c) => {
  const address = c.req.param('address')

  if (!address) {
    return c.text('Address not found')
  }

  if (!isValidAddress(address)) {
    c.status(400)
    return c.json({error: 'Invalid address'})
  }

  try {
    const result = await getSnapshotsForAddress(address)

    return c.json(result)
  } catch (error) {
    c.status(400)
    console.error(error)
    return c.json({error: `Error fetching wallet`})
  }
})

export default app


function isValidAddress(address: string) {
  try {
    new PublicKey(address)
    return true
  } catch (error) {
    return false
  }
}