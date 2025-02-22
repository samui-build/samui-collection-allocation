import { Connection } from '@solana/web3.js'
import { Context, Hono } from 'hono'
import { snapshots } from './snapshots'
import { cors } from 'hono/cors'
import { env } from 'hono/adapter'
import { getWalletAddress } from './lib/get-wallet-address'
import { isValidSolanaPublicKey } from './lib/is-valid-solana-public-key'
import { getSnapshotsMap } from './lib/get-snapshots-map'

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

app.get('/snapshots', async (c) => {
  // Get the addresses from the query param
  const addressesQueryParam = c.req.query('addresses') ?? ''
  // Split the addresses by comma and trim them
  const addresses =
    addressesQueryParam
      .trim()
      .split(',')
      .map((wallet) => wallet.trim()) ?? []

  // Ensure the addresses are valid
  const validAddresses = addresses.filter((address) => isValidSolanaPublicKey(address))

  // Throw an error if there are too many addresses
  if (validAddresses.length > 100) {
    return c.text('Too many addresses, max 100')
  }

  // Get the snapshots
  const result = await getSnapshotsMap({ addresses: validAddresses.length ? validAddresses : [], snapshots })

  return c.json(result)
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

export default app
