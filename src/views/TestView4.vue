<template>
  <div style="width: 100dvw; display: flex; justify-content: center">
    <div class="editor-container">
      <div class="toolbar">
        <button
          @click="addRectangle"
          :class="{ active: drawingMode === 'rectangle' }"
          :disabled="isDrawing"
        >
          Add Rectangle
        </button>
        <button
          @click="addCircle"
          :class="{ active: drawingMode === 'circle' }"
          :disabled="isDrawing"
        >
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
      </div>
      <div class="canvas-container" :style="containerStyle">
        <img
          :src="backgroundImageUrl"
          alt="background"
          class="background-image"
          @load="handleImageLoad"
          ref="imageRef"
        />
        <canvas id="canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import * as fabric from "fabric";
import defaultImageSrc from "../assets/image_test.jpg";
import { applyGrayScale, applyEmboss } from "../tools/filter";

const MAX_WIDTH = 1024; // Add this constant

const canvas = ref(null);
const currentColor = ref("#FF0000"); // Change default color to red
const isDrawingMode = ref(false);
const originalImageUrl = ref(defaultImageSrc);
const backgroundImageUrl = ref(defaultImageSrc);

const imageRef = ref(null);
const canvasSize = ref({ width: 800, height: 600 }); // default size

// Add computed style for container
const containerStyle = computed(() => ({
  width: `${canvasSize.value.width}px`,
  height: `${canvasSize.value.height}px`,
}));

const handleImageLoad = async () => {
  if (!imageRef.value) return;

  // Get natural image dimensions
  const { naturalWidth, naturalHeight } = imageRef.value;

  // Calculate scaled dimensions
  const aspectRatio = naturalHeight / naturalWidth;
  const scaledWidth = MAX_WIDTH;
  const scaledHeight = Math.round(MAX_WIDTH * aspectRatio);

  // Update canvas size with scaled dimensions
  canvasSize.value = {
    width: scaledWidth,
    height: scaledHeight,
  };

  // Update canvas with new fabric.dimensions
  if (canvas.value) {
    canvas.value.setDimensions({
      width: scaledWidth,
      height: scaledHeight,
    });
    canvas.value.setZoom(scaledWidth / naturalWidth); // Scale objects proportionally
    canvas.value.requestRenderAll();
  }
};

const drawingMode = ref("none"); // Add this ref for tracking current drawing mode
const isDrawing = ref(false);
const startPoint = ref({ x: 0, y: 0 });
let currentShape = null;

const initCanvas = () => {
  canvas.value = new fabric.Canvas("canvas", {
    width: canvasSize.value.width,
    height: canvasSize.value.height,
    backgroundColor: "transparent",
    isDrawingMode: false,
    selection: true, // Enable selection here
    preserveObjectStacking: true,
    uniformScaling: false,
  });

  // Initialize the brush
  canvas.value.freeDrawingBrush = new fabric.PencilBrush(canvas.value);
  canvas.value.freeDrawingBrush.width = 5;
  canvas.value.freeDrawingBrush.color = currentColor.value;

  // Add mouse event listeners
  canvas.value.on("mouse:down", startDrawing);
  canvas.value.on("mouse:move", drawing);
  canvas.value.on("mouse:up", endDrawing);
};

const startDrawing = (opt) => {
  if (drawingMode.value === "none") return;

  const pointer = canvas.value.getPointer(opt.e);
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
    canvas.value.add(currentShape);
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
    canvas.value.add(currentShape);
  }
};

const drawing = (opt) => {
  if (!isDrawing.value || !currentShape) return;

  const pointer = canvas.value.getPointer(opt.e);

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

  canvas.value.requestRenderAll();
};

const endDrawing = () => {
  if (isDrawing.value && currentShape) {
    // Only exit drawing mode if we actually drew something
    drawingMode.value = "none";

    // Update button states
    canvas.value.isDrawingMode = false;
    isDrawingMode.value = false;
  }

  isDrawing.value = false;
  currentShape = null;
  canvas.value.requestRenderAll();
};

const addRectangle = () => {
  drawingMode.value = drawingMode.value === "rectangle" ? "none" : "rectangle";
  canvas.value.isDrawingMode = false;
  isDrawingMode.value = false;
};

const addCircle = () => {
  drawingMode.value = drawingMode.value === "circle" ? "none" : "circle";
  canvas.value.isDrawingMode = false;
  isDrawingMode.value = false;
};

const toggleDrawing = () => {
  drawingMode.value = "none";
  isDrawingMode.value = !isDrawingMode.value;
  canvas.value.isDrawingMode = isDrawingMode.value;

  // Ensure brush is properly configured when drawing is enabled
  if (isDrawingMode.value) {
    canvas.value.freeDrawingBrush.color = currentColor.value;
    canvas.value.freeDrawingBrush.width = 5;
  }
};

const exportImage = () => {
  const container = document.querySelector(".canvas-container");

  // Get original image dimensions
  const { naturalWidth, naturalHeight } = imageRef.value;

  const mergedCanvas = document.createElement("canvas");
  mergedCanvas.width = naturalWidth;
  mergedCanvas.height = naturalHeight;
  const ctx = mergedCanvas.getContext("2d");

  // Draw background image at original size
  const bgImage = container.querySelector(".background-image");
  ctx.drawImage(bgImage, 0, 0, naturalWidth, naturalHeight);

  // Scale up canvas content to match original size
  const scale = naturalWidth / MAX_WIDTH;
  ctx.scale(scale, scale);
  ctx.drawImage(canvas.value.getElement(), 0, 0);

  // Create download link
  const link = document.createElement("a");
  link.download = "edited-image.png";
  link.href = mergedCanvas.toDataURL("image/png");
  link.click();
};

const handleKeyDown = (e) => {
  if (e.key === "Delete" || e.key === "Backspace") {
    const activeObjects = canvas.value?.getActiveObjects();
    if (!activeObjects || !activeObjects.length) return;

    // Check if we're trying to delete background or non-deleteable elements
    if (activeObjects.some((obj) => !obj.evented)) return;

    // If it's a group or multiple objects
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        canvas.value.remove(obj);
      });
    }

    // Clear selection and re-render
    canvas.value.discardActiveObject();
    canvas.value.requestRenderAll();
  }
};

const applyFilter = async (filterType) => {
  try {
    // Always use original image for filter application
    const response = await fetch(originalImageUrl.value);
    const blob = await response.blob();
    const file = new fabric.File([blob], "image.jpg", { type: "image/jpeg" });

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
        // Reset to original image if no filter selected
        backgroundImageUrl.value = originalImageUrl.value;
        return;
    }

    if (result) {
      backgroundImageUrl.value = result;
    }
  } catch (error) {
    console.error("Error applying filter:", error);
    // On error, reset to original image
    backgroundImageUrl.value = originalImageUrl.value;
  }
};

// Add reset function if needed
const resetImage = () => {
  backgroundImageUrl.value = originalImageUrl.value;
};

onMounted(() => {
  initCanvas();
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

watch(currentColor, (newColor) => {
  if (canvas.value?.freeDrawingBrush) {
    canvas.value.freeDrawingBrush.color = newColor;
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
  margin: 0 auto;
  max-width: 1024px; /* Add max-width constraint */
  width: 100%;
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
