# update-homebrew-formula-action [![ts](https://github.com/int128/update-homebrew-formula-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/update-homebrew-formula-action/actions/workflows/ts.yaml)

This is an action to update a Homebrew formula to the desired version.

## Getting Started

To update a formula,

```yaml
name: update

jobs:
  formula:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: int128/update-homebrew-formula-action@v2
        with:
          path: example.rb
          version: v1.0.0
      - uses: int128/update-generated-files-action@v2
```

You can see the changed formula if a new release is available.

## Inputs

| Name      | Default    | Description                       |
| --------- | ---------- | --------------------------------- |
| `path`    | (required) | Glob pattern to formula(s)        |
| `version` | (required) | Desired version of the formula(s) |

## Outputs

None.
