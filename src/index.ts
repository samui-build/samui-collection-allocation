import { PublicKey } from '@solana/web3.js'
import { Hono } from 'hono'

import deanslistGen1 from './lists/deanslist-gen1.json' assert { type: 'json' }
import deanslistTokenHolders from './lists/deanslist-token-holders.json' assert { type: 'json' }
import devs from './lists/devs.json' assert { type: 'json' }
import smbGen2 from './lists/smb-gen2.json' assert { type: 'json' }
import smbGen3 from './lists/smb-gen3.json' assert { type: 'json' }
import template from './lists/template.json' assert { type: 'json' }

const lists = {
  deanslistGen1,
  deanslistTokenHolders,
  devs,
  smbGen2,
  smbGen3,
  template,
}

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})


app.get('/lists', (c) => {
  return c.json(lists)
})

app.get('/lists/:name', (c) => {
  const name = c.req.param('name')
  const list = Object.keys(lists).find((key) => key === name)

  if (!list) {
    return c.text('List not found')
  }

  const found = lists[list as keyof typeof lists]

  return c.json(found)
})


app.get('/wallet/:address', (c) => {
  const address = c.req.param('address')

  if (!address) {
    return c.text('Address not found')
  }

  try {
    new PublicKey(address)

    let total = 0
    const listsFound: Record<string, { name: string; description: string; amount: number }> = {}

    for (const [listName, list] of Object.entries(lists)) {
      const wallet = list.wallets.find((wallet) => wallet.address === address)
      if (wallet) {
        total += wallet.amount
        listsFound[listName] = {
          name: list.name,
          description: list.description,
          amount: wallet.amount,
        }
      }
    }

    if (Object.keys(listsFound).length === 0) {
      return c.json({address, total, lists: {}})
    }

    const result = {address, total, lists: listsFound}
    return c.json(result)
  } catch (error) {
    c.status(400)
    return c.json({error: `Error fetching wallet`})
  }
})

export default app
