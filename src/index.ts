import { Connection } from '@solana/web3.js'
import { Context, Hono } from 'hono'
import { getSnapshot } from './lib/get-snapshot'
import { getSnapshotsForAddress } from './lib/get-snapshots-for-address'
import { snapshots } from './snapshots'
import { cors } from 'hono/cors'
import { env } from 'hono/adapter'
import { getSnapshotsForAddresses } from './lib/get-snapshots-for-addresses'
import { getWalletAddress } from './lib/get-wallet-address'
import { isValidSolanaPublicKey } from './lib/is-valid-solana-public-key'

const app = new Hono()

function getEnv(c: Context) {
  return env<{ ALLOWED_ORIGINS: string; SOLANA_ENDPOINT: string }>(c)
}

function getOrigins(c: Context): string[] {
  const envOrigins: string[] = getEnv(c).ALLOWED_ORIGINS?.split(';') ?? []

  return envOrigins.map((origin) => origin.trim()).filter((origin) => origin.length > 0)
}

function getConnection(c: Context): Connection {
  const endpoint: string = getEnv(c).SOLANA_ENDPOINT
  if (!endpoint.length) {
    throw new Error('SOLANA_ENDPOINT is not set')
  }

  return new Connection(endpoint)
}

app.use(
  cors({
    origin: (origin, c) => {
      return getOrigins(c)?.includes(origin) ? origin : null
    },
  }),
)

app.get('/', (c) => {
  return c.text('Samui Collection Allocation API')
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
  return c.json({ ...snapshot, wallets: await getSnapshot(snapshot.id) })
})

app.get('/resolve/:address', async (c) => {
  const addressOrDomain = c.req.param('address')

  if (!addressOrDomain) {
    return c.text('Address not found')
  }

  const connection = getConnection(c)
  const address = await getWalletAddress(connection, addressOrDomain)

  if (!address) {
    c.status(400)
    return c.json({ error: 'Domain not found' })
  }

  return c.json({ address })
})

app.get('/wallet/:address', async (c) => {
  const addressOrDomain = c.req.param('address')

  if (!addressOrDomain) {
    return c.text('Address not found')
  }
  const connection = getConnection(c)
  const address = await getWalletAddress(connection, addressOrDomain)

  if (!address) {
    c.status(400)
    return c.json({ error: 'Invalid address' })
  }

  try {
    const result = await getSnapshotsForAddress(address)

    return c.json(result)
  } catch (error) {
    c.status(400)
    console.error(error)
    return c.json({ error: `Error fetching wallet` })
  }
})

app.get('/wallets/:addresses', async (c) => {
  const addressesParam = c.req.param('addresses') ?? ''
  const addresses =
    addressesParam
      .trim()
      .split(',')
      .map((address) => address.trim()) ?? []

  if (!addresses.length) {
    return c.text('No addresses found')
  }

  const validAddresses = addresses.filter((address) => isValidSolanaPublicKey(address))

  if (validAddresses.length === 0) {
    return c.text('No valid addresses found')
  }

  if (validAddresses.length > 100) {
    return c.text('Too many addresses, max 100')
  }

  try {
    const result = await getSnapshotsForAddresses(addresses)

    return c.json(result)
  } catch (error) {
    c.status(400)
    console.error(error)
    return c.json({ error: `Error fetching wallet` })
  }
})

export default app
