/**
 * Registry of all apps in p5-tattle.
 * Add a new entry here to surface it on the apps listing page.
 *
 * @example
 * import { apps } from './apps/index.js'
 * apps.forEach(app => console.log(app.name, app.path))
 */
export const apps = [
  {
    id: 'drawing',
    name: 'Uli Illustration',
    description: 'Upload a reference image and draw pixel art on top with a grid-snapped brush.',
    path: '/apps/drawing/',
  },
]
