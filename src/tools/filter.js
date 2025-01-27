import { addObjectUrl } from './objectUrlStore';

const embossKernelRef = [
    [0, 0, -4],
    [0, 0, 0],
    [4, 0, 0],
];

const reverseEmbossKernelRef = [
    [0, 0, 4],
    [0, 0, 0],
    [-4, 0, 0],
];

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

export const applyGrayScale = async (file, resize = false) => {
    if (!file || !(file instanceof File)) return;
    const time1 = performance.now();
    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(
        resize ? Math.min(bitmap.width, 1024) : bitmap.width,
        resize ? Math.round((Math.min(bitmap.width, 1024) / bitmap.width) * bitmap.height) : bitmap.height
    );
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }

    ctx.putImageData(imageData, 0, 0);

    const grayScaleImageUrl = await canvasToImage(canvas);

    const time2 = performance.now();
    console.log("Time taken:", time2 - time1);

    return grayScaleImageUrl;
};

export const applyEmboss = async (file, embossType = 'normal', resize = false) => {
    if (!file || !(file instanceof File)) return;
    const time1 = performance.now();

    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(
        resize ? Math.min(bitmap.width, 1024) : bitmap.width,
        resize ? Math.round((Math.min(bitmap.width, 1024) / bitmap.width) * bitmap.height) : bitmap.height
    );
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const height = canvas.height;
    const width = canvas.width;

    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }
    console.log(imageData);
    
    ctx.putImageData(imageData, 0, 0);
    const grayscaleImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const grayscaleData = grayscaleImageData.data;

    const kernel = embossType === 'reverse' ? reverseEmbossKernelRef : embossKernelRef;

    const outputImageData = ctx.createImageData(width, height);
    const outputData = outputImageData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let graySum = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixelX = x + kx;
                    const pixelY = y + ky;

                    if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
                        const pixelIndex = (pixelY * width + pixelX) * 4;
                        const kernelValue = kernel[ky + 1][kx + 1];

                        graySum += grayscaleData[pixelIndex] * kernelValue;
                    }
                }
            }

            const outputIndex = (y * width + x) * 4;
            let grayOutput = graySum + 128;

            outputData[outputIndex] = Math.min(255, Math.max(0, grayOutput));
            outputData[outputIndex + 1] = Math.min(255, Math.max(0, grayOutput));
            outputData[outputIndex + 2] = Math.min(255, Math.max(0, grayOutput));
            outputData[outputIndex + 3] = 255;
        }
    }

    ctx.putImageData(outputImageData, 0, 0);

    const embossImageUrl = await canvasToImage(canvas);

    const time2 = performance.now();
    console.log("Time taken (canvas emboss):", time2 - time1);
    return embossImageUrl;
};
