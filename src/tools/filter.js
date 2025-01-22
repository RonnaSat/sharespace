import { addObjectUrl } from './objectUrlStore'; // Assuming this is correctly implemented elsewhere

const embossKernelRef = [
    [0, 0, -3],
    [0, 0, 0],
    [3, 0, 0],
];

const reverseEmbossKernelRef = [
    [0, 0, 3],
    [0, 0, 0],
    [-3, 0, 0],
];

const resizeImageCanvas = (canvas) => {
    if (canvas.width <= 1024) return canvas;

    const aspectRatio = canvas.height / canvas.width;
    const newWidth = 1024;
    const newHeight = Math.round(newWidth * aspectRatio);

    const resizedCanvas = new OffscreenCanvas(newWidth, newHeight);
    const resizedCtx = resizedCanvas.getContext('2d', { willReadFrequently: true });
    resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
    return resizedCanvas;
};


const applyEmbossFilterCanvas = (canvas, embossType, strength = 2) => { // Added strength parameter with default value 2 (increased)
    const t1 = performance.now();
    // Setting willReadFrequently to true to optimize for multiple getImageData calls
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const height = canvas.height;
    const width = canvas.width;

    // **1. Convert to Grayscale First**
    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        data[i] = gray;     // Red
        data[i + 1] = gray; // Green
        data[i + 2] = gray; // Blue
        // Alpha channel (data[i + 3]) remains unchanged
    }
    ctx.putImageData(imageData, 0, 0); // Update canvas with grayscale image
    const grayscaleImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Get grayscale data
    const grayscaleData = grayscaleImageData.data;


    const kernel = embossType === 'reverse' ? reverseEmbossKernelRef : embossKernelRef;

    const outputImageData = ctx.createImageData(width, height);
    const outputData = outputImageData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let graySum = 0; // Now we are working with grayscale, so only one sum is needed

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixelX = x + kx;
                    const pixelY = y + ky;

                    if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
                        const pixelIndex = (pixelY * width + pixelX) * 4;
                        const kernelValue = kernel[ky + 1][kx + 1];

                        graySum += grayscaleData[pixelIndex] * kernelValue; // Use grayscaleData
                    }
                }
            }

            const outputIndex = (y * width + x) * 4;
            let grayOutput = (graySum * strength) + 128; // Calculate single grayscale output

            outputData[outputIndex] = Math.min(255, Math.max(0, grayOutput));   // Red (Grayscale)
            outputData[outputIndex + 1] = Math.min(255, Math.max(0, grayOutput)); // Green (Grayscale)
            outputData[outputIndex + 2] = Math.min(255, Math.max(0, grayOutput)); // Blue (Grayscale)
            outputData[outputIndex + 3] = 255; // Alpha (opaque)
        }
    }

    ctx.putImageData(outputImageData, 0, 0);

    const t2 = performance.now();
    console.log("Time taken to apply emboss filter (canvas):", t2 - t1);
    return canvas;
};


const canvasToImage = async (canvas) => {
    const t1 = performance.now();
    const blob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality: 0.9
    });
    const dataUrl =  addObjectUrl(URL.createObjectURL(blob));
    const t2 = performance.now();
    console.log("Time taken to convert canvas to image:", t2 - t1);
    return dataUrl;
};


export const applyEmboss = async (file, embossType = 'normal', resize = false, strength = 2) => { // Added strength parameter to applyEmboss and pass it down
    if (!file || !(file instanceof File)) return;
    const time1 = performance.now();

    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    // Resize if needed
    let processedCanvas = canvas;
    if (resize) {
        processedCanvas = resizeImageCanvas(canvas);
    }

    const embossedCanvas = applyEmbossFilterCanvas(processedCanvas, embossType, strength); // Pass strength to filter function
    const embossImageUrl = await canvasToImage(embossedCanvas);


    const time2 = performance.now();
    console.log("Time taken (canvas emboss):", time2 - time1);
    return embossImageUrl;
};


export const applyGrayScale = async (file, resize = false) => {
    if (!file || !(file instanceof File)) return;
    const time1 = performance.now();
    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(
        resize ? Math.min(bitmap.width, 1024) : bitmap.width,
        resize ? Math.round((Math.min(bitmap.width, 1024) / bitmap.width) * bitmap.height) : bitmap.height
    );
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Draw and resize image if needed
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    // Get image data and apply grayscale
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        data[i] = gray;     // Red
        data[i + 1] = gray; // Green
        data[i + 2] = gray; // Blue
        // Alpha channel (data[i + 3]) remains unchanged
    }

    ctx.putImageData(imageData, 0, 0);

    const blob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality: 0.9
    });

    const time2 = performance.now();
    console.log("Time taken:", time2 - time1);

    return addObjectUrl(URL.createObjectURL(blob));
};