import * as core from '@actions/core'
import * as github from '@actions/github'
import * as glob from '@actions/glob'
import { promises as fs } from 'fs'
import { parseFormula, updateFormula } from './formula.js'
import { findAssetUpdates } from './release.js'
import { Octokit } from './types.js'

interface Inputs {
  path: string
  token: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  const octokit = github.getOctokit(inputs.token)
  const globber = await glob.create(inputs.path)
  for (const f of await globber.glob()) {
    await process(octokit, f)
  }
}

const process = async (octokit: Octokit, filename: string) => {
  const content = (await fs.readFile(filename)).toString()

  const assets = parseFormula(content)
  core.info(`found ${assets.length} asset(s)`)

  const updates = await findAssetUpdates(octokit, assets)
  core.info(`found ${updates.length} update(s)`)

  const newContent = await updateFormula(content, updates)

  core.info(`writing to ${filename}`)
  await fs.writeFile(filename, newContent)
}
