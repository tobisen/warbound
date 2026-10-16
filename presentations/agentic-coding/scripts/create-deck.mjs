import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const slug = process.argv[2] || 'my-presentation'
const title = process.argv.slice(3).join(' ') || 'My Presentation'
const filePath = resolve(`src/data/decks/${slug}.ts`)

if (existsSync(filePath)) {
  console.error(`Deck already exists: ${filePath}`)
  process.exit(1)
}

mkdirSync(dirname(filePath), { recursive: true })

const deckSource = `import type { SlideDefinition } from '../deck'
import { presentationImageAssets } from '../imageAssets'

export const ${toIdentifier(slug)}Deck: SlideDefinition[] = [
  {
    type: 'title',
    props: {
      kicker: 'Presentation',
      title: '${escapeText(title)}',
      subtitle: 'Replace this subtitle with your presentation promise.',
      presenter: 'Your Name',
      meta: new Date().getFullYear().toString(),
    },
    notes: ['Open with the audience promise and why this topic matters.'],
  },
  {
    type: 'introduction',
    props: {
      kicker: 'Introduction',
      title: 'What we will cover',
      intro: 'Use this slide to set expectations and orient the audience.',
      points: ['Context', 'Main idea', 'Next step'],
    },
  },
  {
    type: 'image-background',
    imageAsset: 'generated-tech-arc',
    props: {
      kicker: 'Story moment',
      title: 'Make the important idea visible.',
      body: 'Choose any image asset from src/data/imageAssets.ts.',
    },
  },
  {
    type: 'image-catalog',
    props: {
      kicker: 'Assets',
      title: 'Available background images',
      images: presentationImageAssets,
    },
    notes: ['Import presentationImageAssets from ../imageAssets to list all available image ids.'],
  },
  {
    type: 'questions',
    props: {
      kicker: 'Q&A',
      title: 'Questions?',
      subtitle: 'Use this ending for discussion or final reflections.',
      contact: 'you@example.com',
    },
  },
]
`

writeFileSync(filePath, deckSource)

console.log(`Created ${filePath}`)
console.log('Import this deck in src/data/deck.ts or replace the sample decks when you are ready.')

function toIdentifier(value) {
  const identifier = value
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, character) => character.toUpperCase())
    .replace(/^[^a-zA-Z_]+/, '')

  return identifier || 'presentation'
}

function escapeText(value) {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")
}
