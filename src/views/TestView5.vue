<template>
  <div class="editor-container">
    <div class="toolbar">
      <button @click="enableDrawing">Draw</button>
      <button @click="addRectangle">Rectangle</button>
      <button @click="addCircle">Circle</button>
      <input type="color" v-model="currentColor" @change="updateColor" />
      <input
        type="range"
        v-model="brushSize"
        min="1"
        max="20"
        @change="updateBrushSize"
      />
    </div>
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
import { Canvas, Rect, Circle } from "fabric";

export default {
  data() {
    return {
      canvas: null,
      currentColor: "#000000",
      brushSize: 5,
      isDrawing: false,
    };
  },
  mounted() {
    this.initCanvas();
  },
  methods: {
    initCanvas() {
      this.canvas = new Canvas("canvas", {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
      });
    },
    enableDrawing() {
      this.canvas.isDrawingMode = !this.canvas.isDrawingMode;
      if (this.canvas.isDrawingMode) {
        this.canvas.freeDrawingBrush.width = this.brushSize;
        this.canvas.freeDrawingBrush.color = this.currentColor;
      }
    },
    addRectangle() {
      const rect = new Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: this.currentColor,
        selectable: true, // Make the rectangle selectable
      });
      this.canvas.add(rect);
    },
    addCircle() {
      const circle = new Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: this.currentColor,
        selectable: true, // Make the circle selectable
      });
      this.canvas.add(circle);
    },
    updateColor() {
      if (this.canvas.isDrawingMode) {
        this.canvas.freeDrawingBrush.color = this.currentColor;
      }
    },
    updateBrushSize() {
      if (this.canvas.isDrawingMode) {
        this.canvas.freeDrawingBrush.width = parseInt(this.brushSize);
      }
    },
  },
};
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
  gap: 1rem;
  align-items: center;
}

canvas {
  border: 1px solid #ccc;
}
</style>
