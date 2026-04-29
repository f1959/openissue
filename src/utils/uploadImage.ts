import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, storageEnabled } from '../firebase';

const MAX_INLINE_IMAGE_BYTES = 700 * 1024;

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to read image data.'));
    };
    reader.onerror = () => reject(new Error('Failed to read image data.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadIssueImage(file: File, issueId: string): Promise<string> {
  if (!storageEnabled || !storage) {
    if (file.size > MAX_INLINE_IMAGE_BYTES) {
      throw new Error('Storage OFF mode: image is too large. Use image under 700KB.');
    }
    return fileToDataUrl(file);
  }

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const imageRef = ref(storage, `issue-images/${issueId}/${fileName}`);
  await uploadBytes(imageRef, file, { contentType: file.type });
  return getDownloadURL(imageRef);
}
