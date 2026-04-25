import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadIssueImage(file: File, issueId: string): Promise<string> {
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const imageRef = ref(storage, `issue-images/${issueId}/${fileName}`);
  await uploadBytes(imageRef, file, { contentType: file.type });
  return getDownloadURL(imageRef);
}
