import { apps } from './apps/index.js'

const root = document.getElementById('app')

root.innerHTML = `
  <header class="listing-header">
    <span class="listing-title">p5-tattle</span>
  </header>
  <main class="listing-grid">
    ${apps
      .map(
        (app) => `
      <a href="${app.path}" class="app-card">
        <h2>${app.name}</h2>
        <p>${app.description}</p>
      </a>
    `
      )
      .join('')}
  </main>
`
