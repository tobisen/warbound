<script lang="ts">
import { defineComponent } from 'vue'
import SlideFrame from '../deck/SlideFrame.vue'

export default defineComponent({
  name: 'QuestionsSlide',
  components: { SlideFrame },
  props: {
    kicker: { type: String, default: '' },
    title: { type: String, default: 'Questions?' },
    subtitle: { type: String, default: '' },
    contact: { type: String, default: '' },
  },
})
</script>

<template>
  <SlideFrame :kicker="kicker" variant="questions">
    <div class="questions-slide">
      <h2 class="slide-title">{{ title }}</h2>
      <p v-if="subtitle" class="slide-body">{{ subtitle }}</p>
      <p v-if="contact" class="questions-slide__contact">{{ contact }}</p>
    </div>
  </SlideFrame>
</template>
