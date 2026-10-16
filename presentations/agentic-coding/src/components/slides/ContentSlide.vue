<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import SlideFrame from '../deck/SlideFrame.vue'

export default defineComponent({
  name: 'ContentSlide',
  components: { SlideFrame },
  props: {
    kicker: { type: String, default: '' },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    bullets: { type: Array as PropType<string[]>, default: () => [] },
  },
})
</script>

<template>
  <SlideFrame :kicker="kicker" variant="content">
    <div class="content-slide">
      <div>
        <h2 class="slide-title slide-title--medium">{{ title }}</h2>
        <p v-if="body" class="slide-body">{{ body }}</p>
      </div>
      <ul v-if="bullets.length" class="bullet-list">
        <li v-for="bullet in bullets" :key="bullet">{{ bullet }}</li>
      </ul>
    </div>
  </SlideFrame>
</template>
