<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import SlideFrame from '../deck/SlideFrame.vue'

export default defineComponent({
  name: 'IntroductionSlide',
  components: { SlideFrame },
  props: {
    kicker: { type: String, default: '' },
    title: { type: String, required: true },
    intro: { type: String, default: '' },
    points: { type: Array as PropType<string[]>, default: () => [] },
  },
})
</script>

<template>
  <SlideFrame :kicker="kicker" variant="introduction">
    <div class="introduction-slide">
      <div class="introduction-slide__copy">
        <h2 class="slide-title slide-title--medium">{{ title }}</h2>
        <p v-if="intro" class="slide-body">{{ intro }}</p>
      </div>
      <ol v-if="points.length" class="number-list">
        <li v-for="(point, index) in points" :key="point">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          {{ point }}
        </li>
      </ol>
    </div>
  </SlideFrame>
</template>
