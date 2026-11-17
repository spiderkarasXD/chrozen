const fs = require('node:fs')
const path = require('node:path')
const postcss = require('postcss')
const root = path.resolve(__dirname, '../src/zen/common/styles')
function include(file) {
  return fs.readFileSync(file, 'utf8').replace(/^%include (.+)$/gm, (_, name) => include(path.join(path.dirname(file), name.trim()))).replace(/^%.*$/gm, '')
}
const tree = postcss.parse(include(path.join(root, 'zen-theme.css')))
const theme = tree.nodes.find(node => node.type === 'rule' && node.selector.includes(':root')).clone()
theme.selector = ':root'
fs.writeFileSync(path.join(__dirname, 'zen-theme.generated.css'), '/* Derived from src/zen/common/styles/zen-theme.css. MPL-2.0. */\n' + theme.toString())

