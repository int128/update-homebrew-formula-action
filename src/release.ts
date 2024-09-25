import * as core from '@actions/core'
import { Asset, Update } from './types.js'

export const findAssetUpdates = (version: string, assets: Asset[]): Update[] => {
  const updates: Update[] = []
  for (const asset of assets) {
    if (asset.tag === version) {
      core.info(`asset ${asset.owner}/${asset.repo}@${asset.tag} is up-to-date`)
      continue
    }
    updates.push({
      ...asset,
      latestTag: version,
    })
  }
  return updates
}
