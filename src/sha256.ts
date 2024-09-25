import * as core from '@actions/core'
import { HttpClient } from '@actions/http-client'
import { createHash } from 'crypto'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

const streamPipeline = promisify(pipeline)

export const sha256Content = async (url: string): Promise<string> => {
  const client = new HttpClient()
  core.info(`Downloading ${url}`)
  const response = await client.get(url)
  core.info(`Got status ${response.message.statusCode} ${response.message.statusMessage}`)
  const h = createHash('sha256')
  await streamPipeline(response.message, h)
  return h.digest('hex')
}
