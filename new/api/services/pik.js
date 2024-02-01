import apiClient from 'new/api/apiClient';
import { endpoints } from 'new/api/endpoints';
import { replaceAllWords } from 'new/utils/textUtils';

const pik = endpoints.pik;

export function splitDocument(payload) {
  const url = pik.splitDocument;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function splitClassifyDocument(payload) {
  const url = pik.splitClassifyDocument;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function startReview({ queryParams } = {}) {
  const url = pik.startReview;
  return apiClient.post({
    url,
    queryParams,
  });
}

export function startDocumentReview({ docId, docType } = {}) {
  const url = pik.startDocumentReview.replace('{docId}', docId);
  return apiClient.postJSON({
    url,
    payload: {
      doc_type: docType,
    },
  });
}

export function finishDocumentReview({
  docId,
  docType,
  strict,
  ext_user,
  forced,
} = {}) {
  const url = pik.finishDocumentReview.replace('{docId}', docId);
  return apiClient.postJSON({
    url,
    payload: {
      doc_type: docType,
      ext_user,
    },
    queryParams: {
      strict,
      forced,
    },
  });
}

export function skipDocumentReview({ docId, ext_user } = {}) {
  const url = pik.skipDocumentReview.replace('{docId}', docId);
  return apiClient.postJSON({
    url,
    payload: {
      ext_user,
    },
  });
}

export function getDocumentBboxes({ docId } = {}) {
  const url = pik.getDocumentBboxes.replace('{docId}', docId);
  return apiClient.get({
    url,
  });
}

export function getDocumentAllTableGrids({ docId = '' }) {
  const url = pik.getDocumentAllTableGrids.replace('{docId}', docId);
  return apiClient.get({
    url,
  });
}

export function getDocumentAllTableGridsV1({ docId = '' }) {
  const url = pik.getDocumentAllTableGridsV1.replace('{docId}', docId);
  return apiClient.get({
    url,
  });
}

export function getAllLineitemsGrids({ docId = '' }) {
  const url = pik.getAllLineitemsGrids.replace('{docId}', docId);
  return apiClient.get({
    url,
  });
}

export function getDocumentGrids({ docId, parentId } = {}) {
  const url = replaceAllWords(pik.getDocumentGrids, {
    '{docId}': docId,
    '{parentId}': parentId,
  });
  return apiClient.get({
    url,
    disableCCase: true,
  });
}

export function getDocumentGridsV1({ docId, parentId } = {}) {
  const url = replaceAllWords(pik.getDocumentGridsV1, {
    '{docId}': docId,
    '{parentId}': parentId,
  });
  return apiClient.get({
    url,
    disableCCase: true,
  });
}

export function postDocumentGrids({ docId, parentId, payload } = {}) {
  const url = replaceAllWords(pik.postDocumentGrids, {
    '{docId}': docId,
    '{parentId}': parentId,
  });
  return apiClient.postJSON({
    url,
    payload,
    disableRefetch: true,
    disableCCase: true,
  });
}

export function postDocumentGridsV1({ docId, parentId, payload } = {}) {
  const url = replaceAllWords(pik.postDocumentGridsV1, {
    '{docId}': docId,
    '{parentId}': parentId,
  });
  return apiClient.postJSON({
    url,
    payload,
    disableRefetch: true,
    disableCCase: true,
  });
}

export function extractGridData({ docId, sectionFieldId, payload } = {}) {
  const url = replaceAllWords(pik.extractGridData, {
    '{docId}': docId,
    '{sectionFieldId}': sectionFieldId,
  });
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function extractGridDataV1({ docId, sectionFieldId, payload } = {}) {
  const url = replaceAllWords(pik.extractGridDataV1, {
    '{docId}': docId,
    '{sectionFieldId}': sectionFieldId,
  });
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function addDocumentGrids({ docId, parentId, payload } = {}) {
  const url = replaceAllWords(pik.addDocumentGrids, {
    '{docId}': docId,
    '{parentId}': parentId,
  });
  return apiClient.postJSON({
    url,
    payload,
    disableCCase: true,
  });
}

export function addDocumentGridsV1({ docId, parentId, payload } = {}) {
  const url = replaceAllWords(pik.addDocumentGridsV1, {
    '{docId}': docId,
    '{parentId}': parentId,
  });
  return apiClient.postJSON({
    url,
    payload,
    disableCCase: true,
  });
}

export function tagDocumentGrids({ docId, parentId, payload } = {}) {
  const url = replaceAllWords(pik.tagDocumentGrids, {
    '{docId}': docId,
    '{parentId}': parentId,
  });
  return apiClient.postJSON({
    url,
    payload,
    disableCCase: true,
  });
}

export function deleteDocumentGrids({ docId, parentId, ...payload } = {}) {
  const url = replaceAllWords(pik.deleteDocumentGrids, {
    '{docId}': docId,
    '{parentId}': parentId,
  });
  return apiClient.delete({
    url,
    disableCCase: true,
    payload,
  });
}

export function pasteGrid({ docId, parentId, ...payload } = {}) {
  const url = replaceAllWords(pik.pasteGrid, {
    '{docId}': docId,
    '{parentId}': parentId,
  });
  return apiClient.postJSON({
    url,
    disableCCase: true,
    payload,
  });
}

export function extractSimilarTables({ docId, parentId, payload }) {
  const url = replaceAllWords(pik.extractSimilarTables, {
    '{docId}': docId,
    '{parentId}': parentId,
  });
  return apiClient.postJSON({
    url,
    disableCCase: true,
    payload,
  });
}

export function realTimeUpdateField({ itemId, docId, payload } = {}) {
  const url = replaceAllWords(pik.realTimeUpdateField, {
    '{docId}': docId,
    '{itemId}': itemId,
  });
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function getDocumentSearchBboxes({ docId, queryParams } = {}) {
  const url = pik.getDocumentSearchBboxes.replace('{docId}', docId);
  return apiClient.get({
    url,
    queryParams,
    disableRefetch: true,
  });
}

export function getDocumentData({ docId } = {}) {
  const url = pik.getDocumentData.replace('{docId}', docId);
  return apiClient.get({
    url,
  });
}

export function getDocumentDataV1({ docId } = {}) {
  const url = pik.getDocumentDataV1.replace('{docId}', docId);
  return apiClient.get({
    url,
  });
}

export function getTextFromBbox({
  docId,
  bbox,
  format,
  key,
  update,
  ...rest
} = {}) {
  const url = pik.getTextFromBbox.replace('{docId}', docId);
  return apiClient.postJSON({
    url,
    payload: {
      bbox,
      format,
      key,
      update,
      ...rest,
    },
  });
}

export function updateFieldData({ docId, fieldId, payload } = {}) {
  const url = replaceAllWords(pik.updateFieldData, {
    '{docId}': docId,
    '{fieldId}': fieldId,
  });
  return apiClient.patchJSON({
    url,
    payload,
  });
}

export function reviewAddLine({
  docId,
  sectionFieldId,
  baseItemId,
  gridId,
} = {}) {
  const url = replaceAllWords(pik.reviewAddLine, {
    '{docId}': docId,
    '{sectionFieldId}': sectionFieldId,
  });
  return apiClient.postJSON({
    url,
    payload: {
      grid_id: gridId,
    },
    queryParams: {
      base_item_id: baseItemId,
    },
  });
}

export function reviewAddLineV1({ docId, sectionFieldId, baseItemId } = {}) {
  const url = replaceAllWords(pik.reviewAddLineV1, {
    '{docId}': docId,
    '{sectionFieldId}': sectionFieldId,
  });
  return apiClient.postJSON({
    url,
    queryParams: {
      base_item_id: baseItemId,
    },
  });
}

export function reviewAddSimilarLines({ docId, sectionFieldId } = {}) {
  const url = replaceAllWords(pik.reviewAddSimilarLines, {
    '{docId}': docId,
    '{sectionFieldId}': sectionFieldId,
  });
  return apiClient.postJSON({
    url,
  });
}

export function reviewDeleteLineItemFields({
  docId,
  sectionFieldId,
  fieldIds = [],
  gridIds = [],
} = {}) {
  const url = replaceAllWords(pik.reviewDeleteLineItemFields, {
    '{docId}': docId,
    '{sectionFieldId}': sectionFieldId,
  });

  return apiClient.delete({
    url,
    payload: {
      ids: fieldIds,
      grid_ids: gridIds,
    },
  });
}

export function reviewDeleteLineItemFieldsV1({
  docId,
  sectionFieldId,
  fieldIds = [],
} = {}) {
  const url = replaceAllWords(pik.reviewDeleteLineItemFieldsV1, {
    '{docId}': docId,
    '{sectionFieldId}': sectionFieldId,
  });

  return apiClient.delete({
    url,
    payload: {
      ids: fieldIds,
    },
  });
}

export function addTableMultiplePage({ docId, parentId, payload } = {}) {
  const url = replaceAllWords(pik.addTableMultiplePage, {
    '{docId}': docId,
    '{parentId}': parentId,
  });
  return apiClient.postJSON({
    url,
    payload,
    disableRefetch: true,
    disableCCase: true,
  });
}

export function updateOnClose({ docType, docId, refresh } = {}) {
  const url = pik.updateOnClose.replace('{docId}', docId);
  return apiClient.postJSON({
    url,
    payload: {
      doc_type: docType,
    },
    queryParams: {
      refresh,
    },
  });
}

export function saveSpreadsheetFile(payload) {
  const { doc_id, data, refresh, summary } = payload;
  const url = pik.saveSpreadsheetFile.replace('{docId}', doc_id);
  return apiClient.patchJSON({
    url,
    payload: {
      data,
      summary,
    },
    queryParams: {
      refresh,
    },
  });
}

export function startSpreadsheetReview({ docId, data } = {}) {
  const url = pik.startSpreadsheetReview.replace('{docId}', docId);
  return apiClient.postJSON({
    url,
    payload: {
      data,
    },
  });
}

export function finishSpreadsheetReview({
  docId,
  data,
  strict,
  ext_user,
  summary,
} = {}) {
  const url = pik.finishSpreadsheetReview.replace('{docId}', docId);
  return apiClient.postJSON({
    url,
    payload: {
      data,
      ext_user,
      summary,
    },
    queryParams: {
      strict,
    },
  });
}

export function getSummaryPanelData(payload) {
  const { docId } = payload;
  const url = pik.getSummaryPanelData.replace('{docId}', docId);
  return apiClient.get({
    url,
  });
}

export function saveSpreadsheetSummaryData(payload) {
  const { docId, data } = payload;
  const url = pik.saveSpreadsheetSummaryData.replace('{docId}', docId);

  return apiClient.postJSON({
    url,
    payload: data,
  });
}

/**
 * Enables the chat AI feature.
 *
 * @returns {Promise} - A Promise that resolves to the result of the API call.
 */
export function enableChatAI() {
  const url = pik.enableChatAI;
  return apiClient.postJSON({
    url,
  });
}

/**
 * Requests a chat AI feature.
 *
 * @returns {Promise} - A Promise that resolves to the result of the API call.
 */
export function requestChatAI() {
  const url = pik.requestChatAI;
  return apiClient.postJSON({
    url,
  });
}

/**
 * Asks a question for a document.
 *
 * @param {Object} options - The options for asking a question.
 * @param {string} options.docId - The ID of the document.
 * @param {{question: string}} options.data - The data payload for asking the question.
 * @returns {Promise} - A Promise that resolves to the result of the API call.
 */
export function askQuestion({ docId, data }) {
  const url = pik.askQuestion.replace('{docId}', docId);

  return apiClient.postJSON({
    url,
    payload: data,
  });
}

/**
 * Fetches the chat AI history for a document.
 *
 * @param {Object} options - The options for fetching the chat AI history.
 * @param {string} options.docId - The ID of the document.
 * @returns {Promise} - A Promise that resolves to the chat AI history.
 */
export function fetchChatAIHistory({ docId }) {
  const url = pik.chatAIHistory.replace('{docId}', docId);

  return apiClient.get({ url });
}

/**
 * Retries a question in a chat.
 *
 * @param {Object} options - The options for retrying a question.
 * @param {string} options.docId - The ID of the document.
 * @param {string} options.chatId - The ID of the chat.
 * @param {{question: string}} options.data - The data payload for retrying the question.
 * @returns {Promise} - A Promise that resolves to the result of the API call.
 */
export function retryQuestion({ docId, chatId }) {
  const url = pik.retryQuestion
    .replace('{docId}', docId)
    .replace('{chatId}', chatId);

  return apiClient.postJSON({ url });
}

/**
 * Likes or unlikes a answer in a chat.
 *
 * @param {Object} options - The options for liking/unliking a message.
 * @param {string} options.docId - The ID of the document.
 * @param {string} options.chatId - The ID of the chat.
 * @param {{ise_useful: boolean}} options.data - The data payload for liking/unliking the message.
 * @returns {Promise}- A Promise that resolves to the result of the API call.
 */
export function likeUnlikeAnswer({ docId, chatId, data }) {
  const url = pik.likeUnlikeMessage
    .replace('{docId}', docId)
    .replace('{chatId}', chatId);

  return apiClient.postJSON({ url, payload: data });
}
