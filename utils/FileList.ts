export const addFileToFileList = (existingFileList: FileList, newFile: File): FileList => {
    const dataTransfer = new DataTransfer();

    Array.from(existingFileList).forEach(file => {
        dataTransfer.items.add(file);
    });

    dataTransfer.items.add(newFile);

    return dataTransfer.files;
};


export const removeFileFromList = (fileList: FileList, indexToRemove: number): FileList => {
    const dataTransfer = new DataTransfer();

    Array.from(fileList).forEach((file, index) => {
        if (index !== indexToRemove) {
            dataTransfer.items.add(file);
        }
    });

    return dataTransfer.files;
}