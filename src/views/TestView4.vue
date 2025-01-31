// imageEdit.vue
<template>
  <div style="width: 100dvw; display: flex; justify-content: center">
    <div class="editor-container">
      <div class="toolbar">
        <button @click="addRectangle" :class="{ active: drawingMode === 'rectangle' }" :disabled="isDrawing">
          Add Rectangle
        </button>
        <button @click="addCircle" :class="{ active: drawingMode === 'circle' }" :disabled="isDrawing">
          Add Circle
        </button>
        <button @click="toggleDrawing">Toggle Drawing</button>
        <input type="color" v-model="currentColor" />
        <button @click="exportImage">Export Image</button>
        <div class="filter-buttons">
          <button @click="applyFilter('grayscale')">Grayscale</button>
          <button @click="applyFilter('emboss')">Emboss</button>
          <button @click="applyFilter('reverseEmboss')">Reverse Emboss</button>
          <button @click="resetImage">Reset Image</button>
        </div>

        <button @click="zoomIn">+</button>
        <span class="zoom-level">{{ formatZoomLevel }}%</span>
        <button @click="zoomOut">-</button>
        <button @click="resetZoom">Reset</button>
        <div class="tool-controls">
          <button :class="{ active: currentTool === 'HAND' }" @click="setTool('HAND')">
            ✋
          </button>
          <button :class="{ active: currentTool === 'NONE' }" @click="setTool('NONE')">
            NONE
          </button>

        </div>
      </div>
      <Zoom :container-width="containerWidth" :container-height="containerHeight" :content-width="contentWidth"
        :content-height="contentHeight" ref="zoomRef">
        <template #default="{ zoomLevel, panX, panY, cursor }">
          <div ref="canvasContainerRef" class="canvas-container"
            :style="[{ containerStyle }, { transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`, cursor: cursor }]">
            <img :src="backgroundImage" alt="background" class="background-image" @load="handleImageLoad"
              ref="imageRef" />
            <canvas id="editor-canvas"></canvas>
          </div>
        </template>
      </Zoom>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import * as fabric from "fabric";
import defaultImageSrc from "../assets/image_test.jpg";
import { applyGrayScale, applyEmboss } from "../tools/filter";

import Zoom from '@/components/TestZoom.vue'

const zoomRef = ref(null);
const MAX_WIDTH = 1024;

let canvas = null;
const currentColor = ref("#FF0000");
const isDrawingMode = ref(false);
const originalImageUrl = ref(defaultImageSrc);
const backgroundImage = ref(defaultImageSrc);

const imageRef = ref(null);
const canvasSize = ref({ width: 800, height: 600 });
const canvasContainerRef = ref(null); // Ref for canvas container
const contentWidth = ref(0); // Track content width
const contentHeight = ref(0); // Track content height
const containerWidth = ref(0); // Track container width
const containerHeight = ref(0); // Track container height


const containerStyle = computed(() => ({
  width: `${canvasSize.value.width}px`,
  height: `${canvasSize.value.height}px`,
}));

const handleImageLoad = async () => {
  if (!imageRef.value) return;

  const { naturalWidth, naturalHeight } = imageRef.value;

  const aspectRatio = naturalHeight / naturalWidth;
  const scaledWidth = MAX_WIDTH;
  const scaledHeight = Math.round(MAX_WIDTH * aspectRatio);

  canvasSize.value = {
    width: scaledWidth,
    height: scaledHeight,
  };
  contentWidth.value = scaledWidth; // Set content width after image load
  contentHeight.value = scaledHeight; // Set content height after image load

  if (canvas) {
    canvas.setDimensions({
      width: scaledWidth,
      height: scaledHeight,
    });
    canvas.setZoom(scaledWidth / naturalWidth);
    canvas.requestRenderAll();
  }
  updateContainerDimensions(); // Update container dimensions after image load
};

const drawingMode = ref("none");
const isDrawing = ref(false);
const startPoint = ref({ x: 0, y: 0 });
let currentShape = null;

const initCanvas = () => {
  canvas = new fabric.Canvas("editor-canvas", {
    width: canvasSize.value.width,
    height: canvasSize.value.height,
    backgroundColor: "transparent",
    isDrawingMode: false,
    selection: true,
    preserveObjectStacking: true,
    uniformScaling: false,
  });

  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  canvas.freeDrawingBrush.width = 5;
  canvas.freeDrawingBrush.color = currentColor.value;

  canvas.on("mouse:down", startDrawing);
  canvas.on("mouse:move", drawing);
  canvas.on("mouse:up", endDrawing);
};

const startDrawing = (opt) => {
  if (drawingMode.value === "none") return;

  const pointer = canvas.getPointer(opt.e);
  isDrawing.value = true;
  startPoint.value = pointer;

  if (drawingMode.value === "rectangle") {
    currentShape = new fabric.Rect({
      left: pointer.x,
      top: pointer.y,
      width: 0,
      height: 0,
      fill: "transparent",
      stroke: currentColor.value,
      strokeWidth: 16,
      selectable: true,
    });
    canvas.add(currentShape);
  } else if (drawingMode.value === "circle") {
    currentShape = new fabric.Circle({
      left: pointer.x,
      top: pointer.y,
      radius: 0,
      fill: "transparent",
      stroke: currentColor.value,
      strokeWidth: 16,
      selectable: true,
    });
    canvas.add(currentShape);
  }
};

const drawing = (opt) => {
  if (!isDrawing.value || !currentShape) return;

  const pointer = canvas.getPointer(opt.e);

  if (drawingMode.value === "rectangle") {
    const width = pointer.x - startPoint.value.x;
    const height = pointer.y - startPoint.value.y;

    currentShape.set({
      width: Math.abs(width),
      height: Math.abs(height),
      left: width > 0 ? startPoint.value.x : pointer.x,
      top: height > 0 ? startPoint.value.y : pointer.y,
    });
  } else if (drawingMode.value === "circle") {
    const radius =
      Math.sqrt(
        Math.pow(pointer.x - startPoint.value.x, 2) +
        Math.pow(pointer.y - startPoint.value.y, 2)
      ) / 2;
    const center = {
      x: (pointer.x + startPoint.value.x) / 2,
      y: (pointer.y + startPoint.value.y) / 2,
    };

    currentShape.set({
      radius: radius,
      left: center.x - radius,
      top: center.y - radius,
    });
  }

  canvas.requestRenderAll();
};

const endDrawing = () => {
  if (isDrawing.value && currentShape) {
    drawingMode.value = "none";
    canvas.isDrawingMode = false;
    isDrawingMode.value = false;
  }

  isDrawing.value = false;
  currentShape = null;
  canvas.requestRenderAll();
};

const addRectangle = () => {
  drawingMode.value = drawingMode.value === "rectangle" ? "none" : "rectangle";
  canvas.isDrawingMode = false;
  isDrawingMode.value = false;
};

const addCircle = () => {
  drawingMode.value = drawingMode.value === "circle" ? "none" : "circle";
  canvas.isDrawingMode = false;
  isDrawingMode.value = false;
};

const toggleDrawing = () => {
  drawingMode.value = "none";
  isDrawingMode.value = !isDrawingMode.value;
  canvas.isDrawingMode = isDrawingMode.value;

  if (isDrawingMode.value) {
    canvas.freeDrawingBrush.color = currentColor.value;
    canvas.freeDrawingBrush.width = 5;
  }
};

const exportImage = () => {
  const container = document.querySelector(".canvas-container");

  const { naturalWidth, naturalHeight } = imageRef.value;

  const mergedCanvas = document.createElement("canvas");
  mergedCanvas.width = naturalWidth;
  mergedCanvas.height = naturalHeight;
  const ctx = mergedCanvas.getContext("2d");

  const bgImage = container.querySelector(".background-image");
  ctx.drawImage(bgImage, 0, 0, naturalWidth, naturalHeight);

  const scale = naturalWidth / MAX_WIDTH;
  ctx.scale(scale, scale);
  ctx.drawImage(canvas.getElement(), 0, 0);

  const link = document.createElement("a");
  link.download = "edited-image.png";
  link.href = mergedCanvas.toDataURL("image/png");
  link.click();
};

const handleKeyDown = (e) => {
  if (e.key === "Delete" || e.key === "Backspace") {
    const activeObjects = canvas?.getActiveObjects();
    if (!activeObjects || !activeObjects.length) return;

    if (activeObjects.some((obj) => !obj.evented)) return;

    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        canvas.remove(obj);
      });
    }

    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }
};

const applyFilter = async (filterType) => {
  try {
    const response = await fetch(originalImageUrl.value);
    const blob = await response.blob();
    const file = new File([blob], "image.jpg", { type: "image/jpeg" });

    let result;
    switch (filterType) {
      case "grayscale":
        result = await applyGrayScale(file);
        break;
      case "emboss":
        result = await applyEmboss(file, "normal");
        break;
      case "reverseEmboss":
        result = await applyEmboss(file, "reverse");
        break;
      default:
        backgroundImage.value = originalImageUrl.value;
        return;
    }

    if (result) {
      backgroundImage.value = result;
    }
  } catch (error) {
    console.error("Error applying filter:", error);
    backgroundImage.value = originalImageUrl.value;
  }
};

const resetImage = () => {
  backgroundImage.value = originalImageUrl.value;
};

const updateContainerDimensions = () => {
  if (canvasContainerRef.value) {
    containerWidth.value = canvasContainerRef.value.offsetWidth;
    containerHeight.value = canvasContainerRef.value.offsetHeight;
  console.log('containerWidth', containerWidth.value);
  console.log('containerHeight', containerHeight.value);
  
  }
};

const formatZoomLevel = computed(() => {
  return zoomRef.value?.formatZoomLevel ?? 100;
});

const zoomIn = () => {
  zoomRef.value.zoomIn();
};

const zoomOut = () => {
  zoomRef.value.zoomOut();
};

const resetZoom = () => {
  zoomRef.value.resetZoom();
};

const setTool = (tool) => {
  zoomRef.value.setTool(tool);
};

onMounted(() => {
  initCanvas();
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener('resize', updateContainerDimensions);
  updateContainerDimensions(); // Initial dimensions on mount
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener('resize', updateContainerDimensions);
});

watch(currentColor, (newColor) => {
  if (canvas?.freeDrawingBrush) {
    canvas.freeDrawingBrush.color = newColor;
  }
});


</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.canvas-container {
  position: relative;
  margin: 0;
  max-width: 1024px;
  width: 100%;
  overflow: hidden;
  /* Important: to contain scaled content */
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid #ccc;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.filter-buttons button {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
}

.filter-buttons button:hover {
  background-color: #45a049;
}

.active {
  background-color: #45a049;
  color: white;
}
</style>