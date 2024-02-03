const COPY = 'Copy';

/**
 * Generates a duplicate name for a selected document based on existing documents.
 * @param {Array<object>} documents - The array of existing documents.
 * @param {object} selectedDoc - The selected document to generate a duplicate name for.
 * @returns {number} The generated duplicate name number.
 */
export function generateDuplicateName(documents, selectedDoc) {
  let counter = 1;
  let documentName = selectedDoc?.title;

  if (documents.length) {
    while (counter <= documents.length) {
      documentName = `${documentName} ${COPY}`;

      const isDocumentNamePresent = documents.find(
        (document) => document?.title === documentName
      );

      if (isDocumentNamePresent) {
        counter++;
      } else {
        break;
      }
    }
  }

  return documentName;
}
