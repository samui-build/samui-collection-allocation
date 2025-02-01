import { Helius } from 'helius-sdk'
import 'dotenv/config'
import { existsSync, readFileSync, writeFileSync } from "node:fs";

export interface Holder {
  address: string
  amount: number
}

export async function getContext() {
  const endpoint = process.env.HELIUS_ENDPOINT
  if (!endpoint) {
    throw new Error('HELIUS_ENDPOINT is not set')
  }

  const collectionOrMint = process.argv[2]
  if (!collectionOrMint) {
    throw new Error('Collection or mint address is not set')
  }

  const targetFile = process.argv[3]
  if (!targetFile) {
    throw new Error('Target file is not set')
  }

  if (!existsSync(targetFile)) {
    throw new Error('Target file does not exist')
  }

  const targetContent = JSON.parse(readFileSync(targetFile, 'utf-8'))

  if (!Array.isArray(targetContent.wallets)) {
    throw new Error('Target file does not contain a `wallets` array')
  }

  const helius = new Helius(endpoint.split('=')[1])


  return {
    collectionOrMint,
    helius,
    updateWallets: (holders: Holder[]) => {
      targetContent.wallets = holders
      writeFileSync(targetFile, JSON.stringify(targetContent, null, 2))
      console.log(' => Updated target file:', targetFile)
    }
  }
}