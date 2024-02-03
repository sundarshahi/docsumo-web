import * as pdfjsLib from 'pdfjs-dist/build/pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export const imageLoader = async (file) => {
  try {
    if (!file || !file.arrayBuffer) {
      return;
    }

    const arrayBuffer = await file.arrayBuffer();

    if (!arrayBuffer) {
      return;
    }

    let allImageData = [];

    // Check if the file is a PDF
    if (file.type === 'application/pdf') {
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      if (!pdfDoc) {
        return;
      }

      const totalPages = pdfDoc.numPages;

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport })
          .promise;

        const imageData = canvas.toDataURL('image/jpeg');

        const imageDataObject = {
          id: pageNumber,
          image: {
            height: canvas.height,
            width: canvas.width,
            url: imageData,
          },
        };

        allImageData.push(imageDataObject);
      }
    } else if (['image/jpeg', 'image/png'].includes(file.type)) {
      const imageData = arrayBufferToBase64(arrayBuffer);

      const imageDataObject = {
        id: 1,
        image: {
          height: 0,
          width: 0,
          url: `data:${file.type};base64,${imageData}`,
        },
      };

      allImageData.push(imageDataObject);
    } else if (file.type === 'image/tiff') {
      const imageData = await transformTiffFile(file);

      allImageData.push(imageData);
    } else {
      console.log('no condition match', file);
    }

    return {
      pages: [...allImageData],
      docId: crypto.randomUUID(),
      status: 'reviewing',
      title: 'Custom Document',
      typeTitle: 'Train Document',
    };
  } catch (error) {
    //console.error('Error processing file:', error);
  }
};

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

async function transformTiffFile(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();

    reader.onload = function (e) {
      // eslint-disable-next-line no-undef
      var tiff = new Tiff({ buffer: e.target.result });
      var canvas = tiff.toCanvas();

      // Convert canvas to data URI
      var dataURI = canvas.toDataURL('image/png');

      const imageDataObject = {
        id: 1,
        image: {
          height: 0,
          width: 0,
          url: dataURI,
        },
      };

      reader.onerror = (error) => {
        reject(error);
      };

      resolve(imageDataObject);
    };

    reader.readAsArrayBuffer(file);
  });
}
