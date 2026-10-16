<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { languageLabels, type DeckLanguage, type SlideDefinition } from '../../data/deck'
import { imageAssetById } from '../../data/imageAssets'
import type { PresentationConfig } from '../../data/presentationConfig'
import { presentationConfig } from '../../data/presentationConfig'
import { slideComponentByType } from '../../data/slideRegistry'

export default defineComponent({
  name: 'PresentationDeck',
  props: {
    decks: {
      type: Object as PropType<Record<DeckLanguage, SlideDefinition[]>>,
      required: true,
    },
    config: {
      type: Object as PropType<PresentationConfig>,
      default: () => presentationConfig,
    },
  },
  data() {
    return {
      currentIndex: 0,
      currentLanguage: this.config.defaults.language,
      currentTheme: this.config.defaults.theme,
      currentTransition: this.config.defaults.transition,
      navigationDirection: 'forward' as 'forward' | 'backward',
      isFullscreen: false,
      isNotesOpen: false,
      thumbnailScale: 0.12,
      thumbnailObserver: null as ResizeObserver | null,
    }
  },
  computed: {
    languageLabels(): Record<DeckLanguage, string> {
      return languageLabels
    },
    features(): PresentationConfig['features'] {
      return this.config.features
    },
    languages(): DeckLanguage[] {
      return Object.keys(this.decks) as DeckLanguage[]
    },
    activeLanguage(): DeckLanguage {
      return this.decks[this.currentLanguage] ? this.currentLanguage : this.languages[0]
    },
    slides(): SlideDefinition[] {
      return this.decks[this.activeLanguage]
    },
    currentSlide(): SlideDefinition {
      return this.slides[this.currentIndex]
    },
    currentSlideComponent(): object {
      return slideComponentByType[this.currentSlide.type]
    },
    currentSlideProps(): Record<string, unknown> {
      return this.getSlideProps(this.currentSlide)
    },
    currentSlideTitle(): string {
      return this.getSlideTitle(this.currentSlide)
    },
    currentSlideNotes(): string[] {
      return this.currentSlide.notes || []
    },
    currentSlideNumber(): string {
      return String(this.currentIndex + 1).padStart(2, '0')
    },
    totalSlides(): string {
      return String(this.slides.length).padStart(2, '0')
    },
    progressStyle(): Record<string, string> {
      return {
        transform: `scaleX(${(this.currentIndex + 1) / this.slides.length})`,
      }
    },
    transitionName(): string {
      return `slide-${this.currentTransition}`
    },
    transitionLabel(): string {
      return this.currentTransition
    },
    slideKey(): string {
      return `${this.activeLanguage}-${this.currentIndex}-${this.currentTransition}`
    },
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
    document.addEventListener('fullscreenchange', this.handleFullscreenChange)
    this.$nextTick(this.setupThumbnailObserver)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange)
    this.thumbnailObserver?.disconnect()
  },
  methods: {
    nextSlide() {
      this.navigationDirection = 'forward'
      this.currentIndex = Math.min(this.currentIndex + 1, this.slides.length - 1)
    },
    previousSlide() {
      this.navigationDirection = 'backward'
      this.currentIndex = Math.max(this.currentIndex - 1, 0)
    },
    setLanguage(language: DeckLanguage) {
      if (!this.features.languageSwitch) {
        return
      }

      this.currentLanguage = language
      this.currentIndex = Math.min(this.currentIndex, this.slides.length - 1)
    },
    toggleLanguage() {
      if (!this.features.languageSwitch) {
        return
      }

      const currentLanguageIndex = this.languages.indexOf(this.currentLanguage)
      const nextLanguage = this.languages[(currentLanguageIndex + 1) % this.languages.length]
      this.setLanguage(nextLanguage)
    },
    toggleTheme() {
      if (!this.features.themeSwitch) {
        return
      }

      this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
    },
    toggleOverview() {
      if (!this.features.overview) {
        return
      }
    },
    toggleNotes() {
      if (!this.features.speakerNotes) {
        return
      }

      this.isNotesOpen = !this.isNotesOpen
    },
    goToSlide(index: number) {
      this.navigationDirection = index > this.currentIndex ? 'forward' : 'backward'
      this.currentIndex = index
    },
    setupThumbnailObserver() {
      const sidebar = this.$refs.slideSidebar as HTMLElement | undefined

      if (!sidebar) {
        return
      }

      this.thumbnailObserver?.disconnect()
      this.thumbnailObserver = new ResizeObserver(() => {
        this.updateThumbnailScale()
      })
      this.thumbnailObserver.observe(sidebar)
      this.updateThumbnailScale()
    },
    updateThumbnailScale() {
      const sidebar = this.$refs.slideSidebar as HTMLElement | undefined
      const thumbnail = sidebar?.querySelector('.slide-sidebar__thumbnail') as HTMLElement | null

      if (!thumbnail) {
        return
      }

      this.thumbnailScale = thumbnail.clientWidth / 1280
    },
    cycleTransition() {
      if (!this.features.transitionSwitch) {
        return
      }

      const currentTransitionIndex = this.config.availableTransitions.indexOf(this.currentTransition)
      this.currentTransition = this.config.availableTransitions[(currentTransitionIndex + 1) % this.config.availableTransitions.length]
    },
    async toggleFullscreen() {
      if (!this.features.fullscreen) {
        return
      }

      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen()
          return
        }

        await document.documentElement.requestFullscreen()
      } catch (error) {
        console.warn('Fullscreen request was not completed.', error)
      }
    },
    handleFullscreenChange() {
      this.isFullscreen = Boolean(document.fullscreenElement)
    },
    handleKeydown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isTypingElement = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '') || target?.isContentEditable

      if (isTypingElement) {
        return
      }

      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(event.key)) {
        event.preventDefault()
        this.nextSlide()
      }

      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
        event.preventDefault()
        this.previousSlide()
      }

      if (event.key.toLowerCase() === 'f') {
        event.preventDefault()
        this.toggleFullscreen()
      }

      if (event.key.toLowerCase() === 'l') {
        event.preventDefault()
        this.toggleLanguage()
      }

      if (event.key.toLowerCase() === 't') {
        event.preventDefault()
        this.toggleTheme()
      }

      if (event.key.toLowerCase() === 'm') {
        event.preventDefault()
        this.cycleTransition()
      }

      if (event.key.toLowerCase() === 'o') {
        event.preventDefault()
        this.toggleOverview()
      }

      if (event.key.toLowerCase() === 'n') {
        event.preventDefault()
        this.toggleNotes()
      }

      if (event.key === 'Escape') {
        this.isNotesOpen = false
      }
    },
    getSlideComponent(slide: SlideDefinition): object {
      return slideComponentByType[slide.type]
    },
    getSlideProps(slide: SlideDefinition): Record<string, unknown> {
      const props: Record<string, unknown> = {
        ...slide.props,
        templateId: slide.type,
      }

      if (Array.isArray(props.images)) {
        props.images = props.images.map((image) => {
          if (!isImageCatalogItem(image)) {
            return image
          }

          return {
            ...image,
            path: this.withBasePath(image.path),
          }
        })
      }

      if (!slide.imageAsset) {
        return props
      }

      const imageAsset = imageAssetById[slide.imageAsset]

      if (!imageAsset) {
        return props
      }

      return {
        ...props,
        imageUrl: this.withBasePath(imageAsset.path),
      }
    },
    getSlideTitle(slide: SlideDefinition): string {
      const title = slide.props.title || slide.props.name || slide.props.quote
      return typeof title === 'string' ? title : slide.type
    },
    withBasePath(path: string): string {
      const basePath = this.config.deployment.basePath

      if (!basePath || basePath === '/' || /^https?:\/\//.test(path)) {
        return path
      }

      return `${basePath.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
    },
  },
})

function isImageCatalogItem(value: unknown): value is { path: string } {
  return Boolean(value && typeof value === 'object' && 'path' in value && typeof value.path === 'string')
}
</script>

<template>
  <main
    class="presentation-shell"
    :data-theme="currentTheme"
    :data-direction="navigationDirection"
    :data-sidebar="features.overview && !isFullscreen"
    aria-live="polite"
  >
    <aside
      v-if="features.overview && !isFullscreen"
      ref="slideSidebar"
      class="slide-sidebar"
      :style="{ '--thumbnail-scale': thumbnailScale }"
      aria-label="Slides"
    >
      <header>
        <p>{{ config.meta.title }}</p>
        <span>{{ currentSlideNumber }} / {{ totalSlides }}</span>
      </header>
      <div class="slide-sidebar__list">
        <button
          v-for="(slide, index) in slides"
          :key="`${slide.type}-${index}`"
          type="button"
          :class="{ 'is-active': index === currentIndex }"
          :aria-label="`Go to slide ${index + 1}: ${getSlideTitle(slide)}`"
          @click="goToSlide(index)"
        >
          <span class="slide-sidebar__number">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="slide-sidebar__thumbnail" aria-hidden="true">
            <component :is="getSlideComponent(slide)" v-bind="getSlideProps(slide)" />
          </span>
          <span class="slide-sidebar__title">{{ getSlideTitle(slide) }}</span>
        </button>
      </div>
    </aside>

    <div class="deck-stage">
      <Transition :name="transitionName" mode="out-in">
        <component :is="currentSlideComponent" :key="slideKey" v-bind="currentSlideProps" />
      </Transition>
    </div>

    <div class="deck-toolbar" aria-label="Presentation settings">
      <div v-if="features.languageSwitch" class="language-switch" aria-label="Language">
        <button
          v-for="language in languages"
          :key="language"
          type="button"
          :class="{ 'is-active': currentLanguage === language }"
          :aria-pressed="currentLanguage === language"
          @click="setLanguage(language)"
        >
          {{ languageLabels[language] }}
        </button>
      </div>
      <button v-if="features.fullscreen" type="button" class="fullscreen-button" :aria-pressed="isFullscreen" @click="toggleFullscreen">
        {{ isFullscreen ? 'Exit F' : 'Full F' }}
      </button>
      <button v-if="features.themeSwitch" type="button" class="theme-button" :aria-pressed="currentTheme === 'light'" @click="toggleTheme">
        {{ currentTheme === 'dark' ? 'Light T' : 'Dark T' }}
      </button>
      <button v-if="features.transitionSwitch" type="button" class="transition-button" @click="cycleTransition">
        {{ transitionLabel }} M
      </button>
      <button v-if="features.speakerNotes" type="button" class="notes-button" :aria-pressed="isNotesOpen" @click="toggleNotes">
        Notes N
      </button>
    </div>

    <aside v-if="isNotesOpen" class="deck-overlay deck-notes" aria-label="Speaker notes">
      <header>
        <p class="overlay-kicker">{{ currentSlideNumber }} / {{ totalSlides }}</p>
        <h2>{{ currentSlideTitle }}</h2>
      </header>
      <ul v-if="currentSlideNotes.length">
        <li v-for="note in currentSlideNotes" :key="note">{{ note }}</li>
      </ul>
      <p v-else>No speaker notes for this slide.</p>
    </aside>

    <div v-if="features.controls" class="deck-controls" aria-label="Presentation controls">
      <button type="button" class="deck-button" :disabled="currentIndex === 0" aria-label="Previous slide" @click="previousSlide">
        <span aria-hidden="true">‹</span>
      </button>
      <span class="deck-count">{{ currentSlideNumber }} / {{ totalSlides }}</span>
      <button type="button" class="deck-button" :disabled="currentIndex === slides.length - 1" aria-label="Next slide" @click="nextSlide">
        <span aria-hidden="true">›</span>
      </button>
    </div>

    <div v-if="features.progress" class="deck-progress" aria-hidden="true">
      <span :style="progressStyle" />
    </div>
  </main>
</template>
