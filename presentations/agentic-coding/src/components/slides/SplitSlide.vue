<script lang="ts">
import { defineComponent } from 'vue'
import SlideFrame from '../deck/SlideFrame.vue'

export default defineComponent({
  name: 'SplitSlide',
  components: { SlideFrame },
  props: {
    kicker: { type: String, default: '' },
    title: { type: String, required: true },
    leftTitle: { type: String, required: true },
    leftBody: { type: String, required: true },
    rightTitle: { type: String, required: true },
    rightBody: { type: String, required: true },
  },
})
</script>

<template>
  <SlideFrame :kicker="kicker" variant="split">
    <div class="split-slide">
      <h2 class="slide-title slide-title--medium">{{ title }}</h2>
      <div class="split-slide__grid">
        <article>
          <span class="panel-label">A</span>
          <h3>{{ leftTitle }}</h3>
          <p>{{ leftBody }}</p>
        </article>
        <article>
          <span class="panel-label">B</span>
          <h3>{{ rightTitle }}</h3>
          <p>{{ rightBody }}</p>
        </article>
      </div>
    </div>
  </SlideFrame>
</template>
