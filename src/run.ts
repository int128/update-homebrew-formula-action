import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as github from '@actions/github'
import { promises as fs } from 'fs'
import fetch from 'node-fetch'
import { createHash } from 'crypto'
import { GitHub } from '@actions/github/lib/utils'

type Octokit = InstanceType<typeof GitHub>

interface Inputs {
  path: string
  token: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  const globber = await glob.create(inputs.path)
  const files = await globber.glob()
  const octokit = github.getOctokit(inputs.token)
  for (const f of files) {
    await updateFormula(f, octokit)
  }
}

const releaseURLPattern =
  /url "(?<url>https:\/\/github.com\/(?<owner>.+?)\/(?<repo>.+?)\/releases\/download\/(?<tag>.+?)\/(?<path>.+?))"/g

const updateFormula = async (filename: string, octokit: Octokit): Promise<void> => {
  const content = (await fs.readFile(filename)).toString()
  const updates = await calculateUpdateForFormula(content, octokit)

  let newContent = content
  for (const u of updates) {
    core.info(`apply update ${JSON.stringify(u, undefined, 2)}`)
    newContent = newContent.replace(`url "${u.current.url}"`, `url "${u.latest.url}"`)
    newContent = newContent.replace(`sha256 "${u.current.sha256}"`, `sha256 "${u.latest.sha256}"`)
    newContent = newContent.replace(`version "${u.current.version}"`, `version "${u.latest.version}"`)
  }
  core.debug(`writing to ${filename}\n---\n${newContent}\n---`)
  // await fs.writeFile(filename, newContent)
}

interface Formula {
  url: string
  version: string
  sha256: string
}

interface Update {
  current: Formula
  latest: Formula
}

const calculateUpdateForFormula = async (content: string, octokit: Octokit): Promise<Update[]> => {
  const updates: Update[] = []
  for (const p = new RegExp(releaseURLPattern); ; ) {
    const m = p.exec(content)
    if (m === null) {
      break
    }
    if (m.groups === undefined) {
      continue
    }
    const update = await calculateUpdateForRelease(m.groups as unknown as GitHubRelease, octokit)
    if (update !== undefined) {
      updates.push(update)
    }
  }
  return updates
}

interface GitHubRelease {
  url: string
  owner: string
  repo: string
  tag: string
  path: string
}

const calculateUpdateForRelease = async (r: GitHubRelease, octokit: Octokit): Promise<Update | undefined> => {
  const { data: latest } = await octokit.rest.repos.getLatestRelease({
    owner: r.owner,
    repo: r.repo,
  })
  core.info(`found the latest release ${latest.tag_name}`)

  const currentVersion = extractVersionFromTag(r.tag)
  const latestVersion = extractVersionFromTag(latest.tag_name)
  if (currentVersion === latestVersion) {
    core.info(`up-to-date: current ${currentVersion} === latest ${latestVersion}`)
    return
  }

  const latestURL = replaceAll(r.url, currentVersion, latestVersion)
  return {
    current: {
      url: r.url,
      sha256: await sha256Content(r.url),
      version: currentVersion,
    },
    latest: {
      url: latestURL,
      sha256: await sha256Content(latestURL),
      version: latestVersion,
    },
  }
}

const replaceAll = (s: string, oldString: string, newString: string): string => s.split(oldString).join(newString)

const extractVersionFromTag = (tag: string): string => tag.split(/\/|%2[Ff]/).pop() || tag

const sha256Content = async (url: string): Promise<string> => {
  core.info(`downloading ${url}`)
  const response = await fetch(url)
  core.info(`got status ${response.status}`)
  const h = createHash('sha256')
  h.setEncoding('hex')
  response.body.pipe(h)
  return await new Promise((resolve) =>
    response.body.on('end', () => {
      h.end()
      resolve(h.read())
    })
  )
}
