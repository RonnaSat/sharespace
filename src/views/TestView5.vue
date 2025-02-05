<template>
    <div id="app">
      <canvas id="fabricCanvas"></canvas>
      <button @click="exportCanvas">Export to Image</button>
    </div>
  </template>
  
  <script>
  import { Canvas, Rect, Text } from 'fabric';
  
  export default {
    name: 'App',
    mounted() {
      this.setupCanvas();
    },
    methods: {
      setupCanvas() {
        // Initialize the Fabric.js canvas with a drawing resolution of 800×600 pixels
        this.canvas = new Canvas('fabricCanvas', {
          width: 800,
          height: 600,
        });
  
        // Add a rectangle to the canvas
        const rect = new Rect({
          left: 100,
          top: 100,
          fill: 'blue',
          width: 200,
          height: 200,
        });
  
        // Add text to the canvas
        const text = new Text('Hello Fabric.js', {
          left: 150,
          top: 150,
          fontSize: 30,
          fill: 'white',
        });
  
        // Add objects to the canvas
        this.canvas.add(rect, text);
  
        // Adjust the display size of the canvas to 400×300 pixels
        this.canvas.setDimensions(
          {
            width: '400px',
            height: '300px',
          },
          {
            cssOnly: true,
          }
        );
      },
      async exportCanvas() {
        // Export the canvas to an image (returns a Promise in Fabric.js v6)
        const dataURL = await this.canvas.toDataURL({
          format: 'png',
        });
  
        // Create a link to download the image
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'fabric-canvas-image.png';
        link.click();
      },
    },
  };
  </script>
  
  <style>
  #app {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  
  canvas {
    border: 1px solid black;
    margin-bottom: 20px;
  }
  </style>
  