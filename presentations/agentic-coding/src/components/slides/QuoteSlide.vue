<script lang="ts">
import { defineComponent } from 'vue'
import SlideFrame from '../deck/SlideFrame.vue'

export default defineComponent({
  name: 'QuoteSlide',
  components: { SlideFrame },
  props: {
    quote: { type: String, required: true },
    source: { type: String, default: '' },
  },
})
</script>

<template>
  <SlideFrame variant="quote">
    <figure class="quote-slide">
      <blockquote>{{ quote }}</blockquote>
      <figcaption v-if="source">{{ source }}</figcaption>
    </figure>
  </SlideFrame>
</template>
