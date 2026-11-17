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
    const stack = document.createElement('div')
    stack.className = 'tab-stack'
    const background = document.createElement('div')
    background.className = 'tab-background'
    const content = document.createElement('div')
    content.className = 'tab-content'
    const icon = document.createElement('span')
    icon.className = 'tab-icon-image'
    icon.setAttribute('aria-hidden', 'true')
    icon.textContent = '◎'
    content.append(icon, label, close)
    stack.append(background, content)
    row.append(stack)
    return row
  }))
})

const menu = document.querySelector('#browser-menu')
document.querySelector('#PanelUI-button').addEventListener('click', () => menu.togglePopover())
menu.addEventListener('toggle', () => {
  document.querySelector('#PanelUI-button').setAttribute('aria-expanded', String(menu.matches(':popover-open')))
})
document.querySelector('#menu-location').addEventListener('click', () => {
  menu.hidePopover()
  input.focus()
  input.select()
})
document.querySelector('#zen-theme-button').addEventListener('click', () => {
  const light = document.documentElement.toggleAttribute('data-light')
  localStorage.setItem('chrozen-light', String(light))
  action('theme', light)
})
if (localStorage.getItem('chrozen-light') === 'true') {
  document.documentElement.setAttribute('data-light', '')
  action('theme', true)
}
window.chrozen.onShortcut((shortcut) => {
  if (shortcut === 'location') {
    input.focus()
    input.select()
  }
})
