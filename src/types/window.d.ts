interface Window {
  uploadToGoogleDrive: (imageUrl: string, imageElement: HTMLImageElement) => Promise<void>;
}