export interface SlideTypeDefinition {
  id: string
  name: string
  component: string
  useFor: string
  props: string[]
}

export const slideTypes: SlideTypeDefinition[] = [
  {
    id: 'title',
    name: 'Front slide',
    component: 'TitleSlide',
    useFor: 'Opening a talk with title, subtitle, presenter and metadata.',
    props: ['kicker', 'title', 'subtitle', 'presenter', 'meta'],
  },
  {
    id: 'introduction',
    name: 'Introduction',
    component: 'IntroductionSlide',
    useFor: 'Introducing the agenda, context or promise of the presentation.',
    props: ['kicker', 'title', 'intro', 'points'],
  },
  {
    id: 'chapter',
    name: 'Chapter',
    component: 'ChapterSlide',
    useFor: 'Separating major sections in a longer talk.',
    props: ['number', 'title', 'subtitle'],
  },
  {
    id: 'big-idea',
    name: 'Big idea',
    component: 'BigIdeaSlide',
    useFor: 'One strong statement or memorable takeaway.',
    props: ['kicker', 'title', 'body'],
  },
  {
    id: 'content',
    name: 'Content',
    component: 'ContentSlide',
    useFor: 'A short explanation with supporting bullets.',
    props: ['kicker', 'title', 'body', 'bullets'],
  },
  {
    id: 'split',
    name: 'Two column',
    component: 'SplitSlide',
    useFor: 'Before/after, problem/solution or two-sided comparisons.',
    props: ['kicker', 'title', 'leftTitle', 'leftBody', 'rightTitle', 'rightBody'],
  },
  {
    id: 'three-column',
    name: 'Three column',
    component: 'ThreeColumnSlide',
    useFor: 'Three principles, phases, choices or parallel tracks.',
    props: ['kicker', 'title', 'columns'],
  },
  {
    id: 'card-grid',
    name: 'Card grid',
    component: 'CardGridSlide',
    useFor: 'Four compact items such as services, lessons or workshop blocks.',
    props: ['kicker', 'title', 'cards'],
  },
  {
    id: 'image-catalog',
    name: 'Image catalog',
    component: 'ImageCatalogSlide',
    useFor: 'Listing available background images with their ids and recommended use.',
    props: ['kicker', 'title', 'images'],
  },
  {
    id: 'image-background',
    name: 'Full image background',
    component: 'ImageBackgroundSlide',
    useFor: 'Atmospheric section openings or story moments with a full-bleed image.',
    props: ['kicker', 'title', 'body', 'imageUrl', 'credit'],
  },
  {
    id: 'speaker',
    name: 'Speaker',
    component: 'SpeakerSlide',
    useFor: 'Introducing the presenter or a guest speaker.',
    props: ['kicker', 'name', 'role', 'bio', 'imageUrl', 'topics'],
  },
  {
    id: 'quote',
    name: 'Quote',
    component: 'QuoteSlide',
    useFor: 'A reflection, quote or guiding principle.',
    props: ['quote', 'source'],
  },
  {
    id: 'closing',
    name: 'Closing',
    component: 'ClosingSlide',
    useFor: 'Summarizing the final message and suggested next steps.',
    props: ['kicker', 'title', 'body', 'nextSteps'],
  },
  {
    id: 'questions',
    name: 'Questions',
    component: 'QuestionsSlide',
    useFor: 'Ending with Q&A and contact details.',
    props: ['kicker', 'title', 'subtitle', 'contact'],
  },
]

export const slideTypeById = Object.fromEntries(
  slideTypes.map((slideType) => [slideType.id, slideType]),
) as Record<string, SlideTypeDefinition>
