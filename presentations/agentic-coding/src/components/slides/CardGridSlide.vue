<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import SlideFrame from '../deck/SlideFrame.vue'

interface SlideCard {
  label: string
  title: string
  text: string
}

export default defineComponent({
  name: 'CardGridSlide',
  components: { SlideFrame },
  props: {
    kicker: { type: String, default: '' },
    title: { type: String, required: true },
    cards: { type: Array as PropType<SlideCard[]>, default: () => [] },
  },
})
</script>

<template>
  <SlideFrame :kicker="kicker" variant="cards">
    <div class="card-grid-slide">
      <h2 class="slide-title slide-title--medium">{{ title }}</h2>
      <div class="card-grid">
        <article v-for="card in cards" :key="`${card.label}-${card.title}`" class="presentation-card">
          <span>{{ card.label }}</span>
          <h3>{{ card.title }}</h3>
          <p>{{ card.text }}</p>
        </article>
      </div>
    </div>
  </SlideFrame>
</template>
