const objectUrlStore = new Set();

export const addObjectUrl = (url) => {
    objectUrlStore.add(url);
    return url;
};

export const removeObjectUrl = (url) => {
    if (objectUrlStore.has(url)) {
        URL.revokeObjectURL(url);
        objectUrlStore.delete(url);
    }
};

export const cleanupAllObjectUrls = () => {
    objectUrlStore.forEach(url => {
        URL.revokeObjectURL(url);
    });
    objectUrlStore.clear();
};
