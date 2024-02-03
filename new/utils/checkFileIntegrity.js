import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// Use the default worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export default async function checkFileIntegrity(file) {
  try {
    if (!file || !file.arrayBuffer) {
      return false;
    }

    const arrayBuffer = await file.arrayBuffer();

    if (!arrayBuffer) {
      return false;
    }

    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    if (!pdfDoc) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}
