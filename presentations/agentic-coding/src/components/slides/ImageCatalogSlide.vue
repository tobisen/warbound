<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import SlideFrame from '../deck/SlideFrame.vue'

interface ImageCatalogItem {
  id: string
  name: string
  path: string
  theme: string
  useFor: string
}

export default defineComponent({
  name: 'ImageCatalogSlide',
  components: { SlideFrame },
  props: {
    kicker: { type: String, default: '' },
    title: { type: String, required: true },
    images: { type: Array as PropType<ImageCatalogItem[]>, default: () => [] },
    templateId: { type: String, default: '' },
  },
})
</script>

<template>
  <SlideFrame :kicker="kicker" :template-id="templateId" variant="image-catalog">
    <div class="image-catalog-slide">
      <h2 class="slide-title slide-title--medium">{{ title }}</h2>
      <div class="image-catalog-grid">
        <article v-for="image in images" :key="image.id">
          <img :src="image.path" :alt="image.name" />
          <div>
            <span>{{ image.id }}</span>
            <h3>{{ image.name }}</h3>
            <p>{{ image.theme }} · {{ image.useFor }}</p>
          </div>
        </article>
      </div>
    </div>
  </SlideFrame>
</template>
