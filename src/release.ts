import * as core from '@actions/core'
import { Octokit, Repository, Asset, Update } from './types'

export const findAssetUpdates = async (octokit: Octokit, assets: Asset[]): Promise<Update[]> => {
  const updates: Update[] = []
  for (const asset of assets) {
    const latestReleaseTag = await findLatestRelease(octokit, asset)
    if (latestReleaseTag === asset.tag) {
      core.info(`asset ${asset.owner}/${asset.repo}@${asset.tag} is up-to-date`)
      continue
    }
    updates.push({
      ...asset,
      latestTag: latestReleaseTag,
    })
  }
  return updates
}

const findLatestRelease = async (octokit: Octokit, r: Repository): Promise<string> => {
  const { data: latestRelease } = await octokit.rest.repos.getLatestRelease({
    owner: r.owner,
    repo: r.repo,
  })
  core.info(`found the latest release ${r.owner}/${r.repo}@${latestRelease.tag_name}`)
  return latestRelease.tag_name
}
