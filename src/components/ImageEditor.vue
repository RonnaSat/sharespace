<template>
  <div class="editor-container">
    <div class="toolbar">
      <input type="file" ref="imageInput" accept="image/*" @change="onFileSelected" style="display: none" />
      <button @click="$refs.imageInput.click()">Load Image</button>
      <button @click="applyFilter('grayscale')">Grayscale</button>
      <button @click="onEmboss">Emboss</button>
      <button @click="onReverseEmboss">Reverse Emboss</button>
      <button @click="resetImage">Reset</button>
    </div>
    <img :src="processedImageData" alt="Edited Image" v-if="processedImageData" style="max-width: 50%; margin-top: 10px;" />
    <div ref="imageEditorDiv"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import ImageEditor from 'tui-image-editor';
import VConsole from 'vconsole';
import { applyEmboss } from '@/tools/emboss.js';
import { addObjectUrl, removeObjectUrl, cleanupAllObjectUrls } from '@/tools/objectUrlStore';

const imageEditorDiv = ref(null);
const imageEditor = ref(null);
const imageInput = ref(null);
const processedImageData = ref('');
const originalImageData = ref('');
const vConsole = new VConsole();

const onFileSelected = async () => {
  initOriginalImage();
};

const initOriginalImage = () => {
  const file = imageInput.value.files[0];
  if (file) {
    if (originalImageData.value) {
      removeObjectUrl(originalImageData.value);
    }
    originalImageData.value = addObjectUrl(URL.createObjectURL(file));
    processedImageData.value = originalImageData.value;
  }
};

const applyFilter = async (type) => {
  const time1 = performance.now();
  const file = imageInput.value.files[0];
  await imageEditor.value.loadImageFromFile(file, file.name);
  imageEditor.value.applyFilter(type)
  .then(() => {
    processedImageData.value = imageEditor.value.toDataURL({format: 'jpeg', quality: 0.95});
  });
  const time2 = performance.now();
  console.log(`Time taken to apply filter: ${time2 - time1}ms`);
};

const resetImage = () => {
  processedImageData.value = originalImageData.value;
}

const onEmboss = async () => {
  processedImageData.value = await applyEmboss(imageInput.value.files[0]);
};

const onReverseEmboss = async () => {
  processedImageData.value = await applyEmboss(imageInput.value.files[0], 'reverse');
};

onMounted(() => {
  console.log(imageEditorDiv.value);
  imageEditor.value = new ImageEditor(imageEditorDiv.value);
  console.dir(imageEditor.value);
});

onBeforeUnmount(() => {
  if (imageEditor.value) {
    imageEditor.value.destroy();
    imageEditor.value = null;
  }
  cleanupAllObjectUrls();
  vConsole.destroy();
});


</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100%;
}

.toolbar {
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
  background: #f5f5f5;
}

button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

button:hover {
  background: #eee;
}

#tui-image-editor {
  flex: 1;
  margin: 0 auto;
}
</style>