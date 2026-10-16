<script lang="ts">
import { defineComponent } from 'vue'
import SlideFrame from '../deck/SlideFrame.vue'

export default defineComponent({
  name: 'BigIdeaSlide',
  components: { SlideFrame },
  props: {
    kicker: { type: String, default: '' },
    title: { type: String, required: true },
    body: { type: String, default: '' },
  },
})
</script>

<template>
  <SlideFrame :kicker="kicker" variant="big-idea">
    <div class="big-idea-slide">
      <h2 class="slide-title">{{ title }}</h2>
      <p v-if="body" class="slide-body">{{ body }}</p>
    </div>
  </SlideFrame>
</template>
