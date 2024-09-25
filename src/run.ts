import * as core from '@actions/core'
import * as glob from '@actions/glob'
import { promises as fs } from 'fs'
import { parseFormula, updateFormula } from './formula.js'
import { findAssetUpdates } from './release.js'

type Inputs = {
  path: string
  version: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  const globber = await glob.create(inputs.path)
  for (const f of await globber.glob()) {
    await process(f, inputs.version)
  }
}

const process = async (filename: string, version: string) => {
  const content = (await fs.readFile(filename)).toString()

  const assets = parseFormula(content)
  core.info(`Found ${assets.length} asset(s)`)

  const updates = findAssetUpdates(version, assets)
  core.info(`Found ${updates.length} update(s)`)

  const newContent = await updateFormula(content, updates)

  core.info(`Writing to ${filename}`)
  await fs.writeFile(filename, newContent)
}
