export interface PresentationImageAsset {
  id: string
  name: string
  path: string
  theme: 'dark' | 'light' | 'both'
  useFor: string
}

export const presentationImageAssets: PresentationImageAsset[] = [
  {
    id: 'workshop-lounge',
    name: 'Workshop lounge',
    path: '/presentation/workshop-lounge.jpeg',
    theme: 'dark',
    useFor: 'Warm full-bleed story slides, workshop context and section openers.',
  },
  {
    id: 'workshop-wall',
    name: 'Workshop wall',
    path: '/presentation/workshop-wall.jpeg',
    theme: 'both',
    useFor: 'Speaker slides, workshop context or collaboration stories.',
  },
  {
    id: 'abstract-soft',
    name: 'Abstract soft',
    path: '/presentation/abstract-soft.jpeg',
    theme: 'light',
    useFor: 'Neutral light-mode dividers and calmer content moments.',
  },
  {
    id: 'coral-shape',
    name: 'Coral shape',
    path: '/presentation/coral-shape.jpeg',
    theme: 'light',
    useFor: 'Coral accent slides and bright transition moments.',
  },
  {
    id: 'generated-tech-arc',
    name: 'Generated tech arc',
    path: '/presentation/generated-tech-arc.png',
    theme: 'dark',
    useFor: 'AI, product development, architecture and technical keynote moments.',
  },
  {
    id: 'generated-lounge-workspace',
    name: 'Generated lounge workspace',
    path: '/presentation/generated-lounge-workspace.png',
    theme: 'dark',
    useFor: 'Product stories, workshop intros and reflective talk openings.',
  },
  {
    id: 'generated-light-paper',
    name: 'Generated light paper',
    path: '/presentation/generated-light-paper.png',
    theme: 'light',
    useFor: 'Light-mode title slides, agenda slides and closing slides.',
  },
  {
    id: 'generated-burgundy-shapes',
    name: 'Generated burgundy shapes',
    path: '/presentation/generated-burgundy-shapes.png',
    theme: 'dark',
    useFor: 'Classic dark keynote title slides and chapter dividers.',
  },
]

export const imageAssetById = Object.fromEntries(
  presentationImageAssets.map((asset) => [asset.id, asset]),
) as Record<string, PresentationImageAsset>
