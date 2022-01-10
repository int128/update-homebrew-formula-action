import * as core from '@actions/core'
import fetch from 'node-fetch'
import { createHash } from 'crypto'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

const streamPipeline = promisify(pipeline)

export const sha256Content = async (url: string): Promise<string> => {
  core.info(`downloading ${url}`)
  const response = await fetch(url)
  core.info(`got status ${response.status}`)
  if (response.body === null) {
    throw new Error(`got status ${response.statusText} (response.body === null)`)
  }

  const h = createHash('sha256')
  await streamPipeline(response.body, h)
  return h.digest('hex')
}
