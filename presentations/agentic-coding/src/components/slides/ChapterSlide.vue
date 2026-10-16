<script lang="ts">
import { defineComponent } from 'vue'
import SlideFrame from '../deck/SlideFrame.vue'

export default defineComponent({
  name: 'ChapterSlide',
  components: { SlideFrame },
  props: {
    number: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
  },
})
</script>

<template>
  <SlideFrame variant="chapter">
    <div class="chapter-slide">
      <span class="chapter-slide__number">{{ number }}</span>
      <div class="accent-line" />
      <h2 class="slide-title">{{ title }}</h2>
      <p v-if="subtitle" class="slide-body">{{ subtitle }}</p>
    </div>
  </SlideFrame>
</template>
