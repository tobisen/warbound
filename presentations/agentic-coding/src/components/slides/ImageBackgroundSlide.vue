<script lang="ts">
import { defineComponent } from 'vue'
import SlideFrame from '../deck/SlideFrame.vue'

export default defineComponent({
  name: 'ImageBackgroundSlide',
  components: { SlideFrame },
  props: {
    kicker: { type: String, default: '' },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    credit: { type: String, default: '' },
  },
  computed: {
    backgroundStyle(): Record<string, string> {
      if (!this.imageUrl) {
        return {}
      }

      return {
        backgroundImage: `linear-gradient(90deg, rgba(42, 17, 24, 0.86), rgba(42, 17, 24, 0.34)), url("${this.imageUrl}")`,
      }
    },
  },
})
</script>

<template>
  <SlideFrame :kicker="kicker" variant="image-background">
    <div class="image-background-slide" :style="backgroundStyle">
      <div class="image-background-slide__copy">
        <h2 class="slide-title">{{ title }}</h2>
        <p v-if="body" class="slide-body">{{ body }}</p>
      </div>
      <span v-if="credit" class="image-background-slide__credit">{{ credit }}</span>
    </div>
  </SlideFrame>
</template>
