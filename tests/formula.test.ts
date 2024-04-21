import { promises as fs } from 'fs'
import { Asset } from '../src/types.js'
import { parseFormula } from '../src/formula.js'

test('parse formula', async () => {
  const content = (await fs.readFile(`${__dirname}/fixtures/kubelogin.rb`)).toString()
  const formula = parseFormula(content)
  expect(formula).toStrictEqual<Asset[]>([
    {
      url: 'https://github.com/int128/kubelogin/releases/download/v1.24.0/kubelogin_darwin_amd64.zip',
      owner: 'int128',
      repo: 'kubelogin',
      tag: 'v1.24.0',
      path: 'kubelogin_darwin_amd64.zip',
    },
    {
      url: 'https://github.com/int128/kubelogin/releases/download/v1.24.0/kubelogin_linux_amd64.zip',
      owner: 'int128',
      repo: 'kubelogin',
      tag: 'v1.24.0',
      path: 'kubelogin_linux_amd64.zip',
    },
  ])
})
