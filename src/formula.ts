import { sha256Content } from './sha256.js'
import type { Asset, Update } from './types.js'

const urlPattern =
  /url +"(?<url>https:\/\/github.com\/(?<owner>.+?)\/(?<repo>.+?)\/releases\/download\/(?<tag>.+?)\/(?<path>.+?))"/g

export const parseFormula = (content: string): Asset[] => {
  const dependencies: Asset[] = []
  for (const p = new RegExp(urlPattern); ; ) {
    const m = p.exec(content)
    if (m === null) {
      break
    }
    if (m.groups === undefined) {
      continue
    }
    const { url, owner, repo, tag, path } = m.groups
    dependencies.push({ url, owner, repo, tag, path })
  }
  return dependencies
}

export const updateFormula = async (content: string, updates: Update[]): Promise<string> => {
  let s = content
  for (const update of updates) {
    const patch = await computePatch(update)
    s = applyPatch(s, patch)
  }
  return s
}

type Patch = {
  current: Formula
  latest: Formula
}

type Formula = {
  url: string
  sha256: string
  tag: string
}

const computePatch = async (u: Update): Promise<Patch> => {
  const latestAssetPath = u.path.replace(u.tag, u.latestTag)
  const latestAssetURL = `https://github.com/${u.owner}/${u.repo}/releases/download/${u.latestTag}/${latestAssetPath}`
  return {
    latest: {
      url: latestAssetURL,
      sha256: await sha256Content(latestAssetURL),
      tag: u.latestTag,
    },
    current: {
      url: u.url,
      sha256: await sha256Content(u.url),
      tag: u.tag,
    },
  }
}

const applyPatch = (content: string, p: Patch): string => {
  let s = content
  s = s.replace(`url "${p.current.url}"`, `url "${p.latest.url}"`)
  s = s.replace(`sha256 "${p.current.sha256}"`, `sha256 "${p.latest.sha256}"`)
  s = s.replace(`version "${p.current.tag}"`, `version "${p.latest.tag}"`)
  return s
}
