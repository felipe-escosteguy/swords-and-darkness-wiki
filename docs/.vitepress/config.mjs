import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

function getSidebarItems(dir) {
  const fullPath = path.resolve(__dirname, '../', dir)
  if (!fs.existsSync(fullPath)) return []
  
  // Sort naturally to ensure chapters are in order
  const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
  const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.md')).sort(collator.compare)
  
  return files.map(f => {
    // Clean up title for the sidebar: removes the "B01 - Chapter 01" prefixes to make it cleaner
    const text = f.replace('.md', '').replace(/^B\d+ - Chapter \d+_?\s*/, '').replace(/^B\d+ - Chapter \d+\s*-\s*/, '')
    return {
      text,
      link: `/${dir}/${f.replace('.md', '')}`
    }
  })
}

export default defineConfig({
  title: "Swords & Darkness",
  description: "Campaign setting and rules wiki",
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap', rel: 'stylesheet' }]
  ],
  themeConfig: {
    logo: { light: '/logo-black.png', dark: '/logo-white.png' },
    siteTitle: false,
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Book I', link: '/Book I - Core Rules/B01 - Chapter 00 - Introduction' },
      { text: 'Book II', link: '/Book II - The Known World/B02 - Chapter 00_ Introduction' },
      { text: 'Book III', link: '/Book III - The Darkness/B03 - Chapter 01_ Dungeon Dwellers' }
    ],
    sidebar: [
      {
        text: 'Book I - Core Rules',
        collapsed: false,
        items: getSidebarItems('Book I - Core Rules')
      },
      {
        text: 'Book II - The Known World',
        collapsed: false,
        items: getSidebarItems('Book II - The Known World')
      },
      {
        text: 'Book III - The Darkness',
        collapsed: false,
        items: getSidebarItems('Book III - The Darkness')
      }
    ]
  }
})
