export type Repository = {
  owner: string
  repo: string
}

export type Asset = {
  owner: string
  repo: string
  tag: string
  url: string
  path: string
}

export type Update = Asset & {
  latestTag: string
}
