# update-homebrew-formula-action [![ts](https://github.com/int128/update-homebrew-formula-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/update-homebrew-formula-action/actions/workflows/ts.yaml)

This is an action to update a formula of Homebrew.

**Status:** work in progress


## Getting Started

To run this action:

```yaml
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: int128/update-homebrew-formula-action@v1
        with:
          path: foo.rb
      - run: git diff
```

You can see the changed formula if a new release is available.


## Inputs

| Name | Default | Description
|------|----------|------------
| `path` | (required) | Path to formula file(s)
| `token` | `github.token` | GitHub token


## Outputs

None.
