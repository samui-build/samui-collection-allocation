import { Hono } from 'hono'

import ogs from './lists/ogs.json' assert { type: 'json' }
import template from './lists/template.json' assert { type: 'json' }
import tokenHolders from './lists/token-holders.json' assert { type: 'json' }

const lists = {
  ogs,
  template,
  tokenHolders,
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
    return c.text('Wallet not found')
  }

  const result = {address, total, lists: listsFound}
  return c.json(result)
})

export default app
