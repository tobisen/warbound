import WarboundSlide from '../components/slides/WarboundSlide.vue'
import BigIdeaSlide from '../components/slides/BigIdeaSlide.vue'
import CardGridSlide from '../components/slides/CardGridSlide.vue'
import ChapterSlide from '../components/slides/ChapterSlide.vue'
import ClosingSlide from '../components/slides/ClosingSlide.vue'
import ContentSlide from '../components/slides/ContentSlide.vue'
import ImageCatalogSlide from '../components/slides/ImageCatalogSlide.vue'
import ImageBackgroundSlide from '../components/slides/ImageBackgroundSlide.vue'
import IntroductionSlide from '../components/slides/IntroductionSlide.vue'
import QuoteSlide from '../components/slides/QuoteSlide.vue'
import QuestionsSlide from '../components/slides/QuestionsSlide.vue'
import SpeakerSlide from '../components/slides/SpeakerSlide.vue'
import SplitSlide from '../components/slides/SplitSlide.vue'
import ThreeColumnSlide from '../components/slides/ThreeColumnSlide.vue'
import TitleSlide from '../components/slides/TitleSlide.vue'

export const slideComponentByType = {
  warbound: WarboundSlide,
  title: TitleSlide,
  introduction: IntroductionSlide,
  speaker: SpeakerSlide,
  'big-idea': BigIdeaSlide,
  chapter: ChapterSlide,
  content: ContentSlide,
  'image-catalog': ImageCatalogSlide,
  'image-background': ImageBackgroundSlide,
  split: SplitSlide,
  'three-column': ThreeColumnSlide,
  'card-grid': CardGridSlide,
  quote: QuoteSlide,
  closing: ClosingSlide,
  questions: QuestionsSlide,
}

export type SlideTypeId = keyof typeof slideComponentByType
