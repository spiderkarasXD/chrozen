const input = document.querySelector('#urlbar-input')
const list = document.querySelector('#tabbrowser-tabs')
const { action, onTabs } = window.chrozen
document.querySelector('#urlbar').addEventListener('submit', (event) => {
  event.preventDefault()
  action('navigate', input.value)
  input.blur()
})
document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    action(button.dataset.action)
    if (button.dataset.action === 'new') input.focus()
  })
})
onTabs((tabs, active) => {
  if (document.activeElement !== input) input.value = tabs.find((tab) => tab.id === active)?.url ?? ''
  list.replaceChildren(...tabs.map((tab) => {
    const row = document.createElement('div')
    row.className = 'tabbrowser-tab'
    row.toggleAttribute('selected', tab.id === active)
    const label = document.createElement('button')
    label.className = 'tab-label-container'
    label.textContent = tab.title
    label.addEventListener('click', () => action('select', tab.id))
    const close = document.createElement('button')
    close.className = 'tab-close-button'
    close.setAttribute('aria-label', 'Close ' + tab.title)
    close.textContent = '×'
    close.addEventListener('click', () => action('close', tab.id))
    row.append(label, close)
    return row
  }))
})
