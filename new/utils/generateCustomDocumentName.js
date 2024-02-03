/**
 * The base document name.
 * @type {string}
 */
const DOCUMENT = 'Document';

/**
 * The key for the custom category.
 * @type {string}
 */
const CUSTOM_APIS_KEY = 'Custom APIs';

/**
 * The value key for others.
 * @type {string}
 */
const OTHERS = 'others';

/**
 * Generates a custom document name based on the existing documents.
 * @param {object[]} documents - The array of existing documents.
 * @param {string} [customCategory='Custom APIs'] - The custom category key.
 * @param {string} [othersValueKey='others'] - The value key for others.
 * @returns {string} The generated custom document name.
 */
export function generateCustomDocumentName(
  documents = [],
  customCategory = CUSTOM_APIS_KEY,
  othersValueKey = OTHERS
) {
  let counter = 1;
  let documentName = DOCUMENT;

  if (documents.length) {
    const othersDocumentTypes = documents.filter((document) => {
      return (
        document.category === customCategory &&
        document?.value.includes(othersValueKey)
      );
    });

    while (counter <= othersDocumentTypes.length) {
      documentName = `${documentName} ${counter}`;

      const isDocumentNamePresent = othersDocumentTypes.find(
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
