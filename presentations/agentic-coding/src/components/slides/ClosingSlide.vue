<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import SlideFrame from '../deck/SlideFrame.vue'

export default defineComponent({
  name: 'ClosingSlide',
  components: { SlideFrame },
  props: {
    kicker: { type: String, default: '' },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    nextSteps: { type: Array as PropType<string[]>, default: () => [] },
  },
})
</script>

<template>
  <SlideFrame :kicker="kicker" variant="closing">
    <div class="closing-slide">
      <div>
        <h2 class="slide-title">{{ title }}</h2>
        <p v-if="body" class="slide-body">{{ body }}</p>
      </div>
      <ul v-if="nextSteps.length" class="closing-slide__steps">
        <li v-for="step in nextSteps" :key="step">{{ step }}</li>
      </ul>
    </div>
  </SlideFrame>
</template>
