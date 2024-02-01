import apiClient from 'new/api/apiClient';
import { endpoints } from 'new/api/endpoints';
import { replaceAllWords } from 'new/utils/textUtils';

const mew = endpoints.mew;

export function getUserFlow() {
  const url = mew.getUserFlow;
  return apiClient.get({
    url,
  });
}

export function getAllDocumentsTypes({ queryParams } = {}) {
  const url = mew.getAllDocumentsTypes;
  return apiClient.get({
    url,
    queryParams,
  });
}

export function createDocumentType({ title } = {}) {
  const url = mew.createDocumentType;
  return apiClient.postJSON({
    url,
    payload: {
      title: title,
    },
  });
}

export function createNewFolder({ payload }) {
  const url = mew.createNewFolder;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function editNewFolder({ payload }) {
  const url = mew.editNewFolder;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function getFolderDetail(payload) {
  const { folder_id } = payload;
  const url = mew.getFolderDetail.replace('{folderId}', folder_id);
  return apiClient.get({
    url,
  });
}

export function duplicateDocumentType({ doc_type, title_old, title }) {
  const url = mew.duplicateDocumentType;
  return apiClient.postJSON({
    url,
    payload: {
      doc_type: doc_type,
      title_old: title_old,
      title: title,
    },
  });
}

export function updateDocumentTypeTitle({ payload }) {
  const { docId, title, doc_type } = payload;
  const url = mew.updateDocumentTypeTitle.replace('{docId}', docId);
  return apiClient.postJSON({
    url,
    payload: {
      title: title,
      doc_type,
    },
  });
}

export function retryDocuments(payload) {
  const url = mew.retryDocuments;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function changeDocType(payload) {
  const url = mew.changeDocType;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function changeUserType(payload) {
  const url = mew.changeUserType;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function deleteDocAndFolder(payload) {
  const url = mew.deleteDocAndFolder;
  return apiClient.delete({
    url,
    payload,
  });
}

export const pullDocFromProd = (payload) => {
  const url = mew.pullDocFromProd;
  const { docType } = payload;
  return apiClient.postJSON({
    url,
    payload: {
      doc_types: [docType],
    },
  });
};

export const pushDocFromProd = (payload) => {
  const url = mew.pushDocFromProd;
  return apiClient.postJSON({
    url,
    payload,
  });
};

export function downlaodMultiDocs(payload) {
  const url = mew.downlaodMultiDocs;
  const { type } = payload;
  return apiClient.postJSON({
    url,
    payload,
    queryParams: {
      type: type,
    },
  });
}

export function replaceModel(modelId, model_type, doc_types, override) {
  const url = replaceAllWords(mew.replaceModel, {
    '{modelId}': modelId,
    '{override}': override,
  });
  const body = {
    model_type,
    doc_types,
  };
  return apiClient.postJSON({
    url,
    payload: body,
  });
}

export function downloadAllDocs({ queryParams } = {}) {
  const url = mew.downloadAllDocs;
  return apiClient.postJSON({
    url,
    queryParams,
  });
}

export function deleteDocumentType({ docId, doc_type }) {
  const url = mew.deleteDocumentType.replace('{docId}', docId);
  return apiClient.delete({
    url,
    payload: {
      doc_type,
    },
  });
}
export function resetDocumentType({ doc_type, excel_type }) {
  const url = mew.resetDocumentType.replace('{docType}', doc_type);
  return apiClient.postJSON({
    url,
    payload: {
      excel_type,
    },
  });
}

export function editFieldReview({ doc_type, queryParams } = {}) {
  const url = mew.editFieldReview.replace('{docType}', doc_type);
  return apiClient.post({
    url,
    queryParams,
  });
}

export function updateFieldAndSection({
  docType,
  docId,
  itemId,
  payload,
} = {}) {
  const url = replaceAllWords(mew.updateFieldAndSection, {
    '{docType}': docType,
    '{docId}': docId,
    '{itemId}': itemId,
  });
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function saveAndCloseData({ docTypeId, type, docId, doc_type } = {}) {
  const url = mew.saveAndCloseData.replace('{docTypeId}', docTypeId);
  return apiClient.postJSON({
    url,
    payload: { type, doc_id: docId, doc_type },
  });
}

export function getDocumentDDValues({ itemId, type, label, pType } = {}) {
  const url = mew.getDocumentDDValues.replace('{itemId}', itemId);
  return apiClient.postJSON({
    url,
    payload: {
      doc_type: type,
      label,
      item_type: pType,
    },
  });
}

export function getDocumentDDOptions({
  id,
  type,
  queryParams,
  itemType,
  label,
} = {}) {
  const url = mew.getDocumentDDOptions.replace('{id}', id);
  return apiClient.postJSON({
    url,
    payload: {
      doc_type: type,
      item_type: itemType,
      label,
    },
    queryParams,
    disableRefetch: true,
  });
}

export function getEditFieldDocumentBboxes(payload) {
  const { doc_type, docId } = payload;
  const url = replaceAllWords(mew.getEditFieldDocumentBboxes, {
    '{docType}': doc_type,
    '{docId}': docId,
  });
  return apiClient.get({
    url,
  });
}

export function getEditFieldDocumentData(payload) {
  const { doc_type, docId } = payload;
  const url = replaceAllWords(mew.getEditFieldDocumentData, {
    '{docType}': doc_type,
    '{docId}': docId,
  });
  return apiClient.get({
    url,
  });
}

export function editFieldAddFooterColumn({
  sectionFieldId,
  docType,
  type,
  label,
} = {}) {
  const url = replaceAllWords(mew.editFieldAddFooterColumn, {
    '{docType}': docType,
    '{parentId}': sectionFieldId,
  });
  return apiClient.postJSON({
    url,
    payload: {
      p_type: type,
      label,
    },
  });
}

export function addNewSectionTable({ docType, sectionType } = {}) {
  const url = replaceAllWords(mew.addNewSectionTable, {
    '{docType}': docType,
    '{sectionType}': sectionType,
  });
  return apiClient.postJSON({
    url,
  });
}

export function updateSectionTitle({ payload }) {
  const { p_title, doc_type, id } = payload;
  const url = replaceAllWords(mew.updateSectionTitle, {
    '{docType}': doc_type,
    '{id}': id,
  });
  return apiClient.postJSON({
    url,
    payload: {
      p_title,
    },
  });
}

export function deleteSection(payload) {
  const { docType, id } = payload;
  const url = replaceAllWords(mew.deleteSection, {
    '{docType}': docType,
    '{id}': id,
  });
  return apiClient.delete({
    url,
  });
}

export function addSectionField({ payload }) {
  const { docType, id, label } = payload;
  const url = replaceAllWords(mew.addSectionField, {
    '{docType}': docType,
    '{parentId}': id,
  });
  return apiClient.postJSON({
    url,
    payload: {
      label,
    },
  });
}

export function updateSectionField({ fieldId, payload, docType } = {}) {
  const url = replaceAllWords(mew.updateSectionField, {
    '{docType}': docType,
    '{fieldId}': fieldId,
  });
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function deleteSectionField({ payload }) {
  const { docType, fieldId, type = '', subPType = '' } = payload;
  const url = replaceAllWords(mew.deleteSectionField, {
    '{docType}': docType,
    '{fieldId}': fieldId,
  });
  return apiClient.delete({
    url,
    payload: {
      type: type,
      sub_p_type: subPType || '',
    },
  });
}

export function filterSectionField({ payload }) {
  const { fieldId, docType, idAutoExtract, pType, subPType = '' } = payload;
  const url = replaceAllWords(mew.filterSectionField, {
    '{docType}': docType,
    '{fieldId}': fieldId || idAutoExtract,
  });
  return apiClient.get({
    url,
    queryParams: {
      type: subPType || pType,
    },
  });
}

export function getFilterList({ doc_type }) {
  const url = mew.getFilterList;
  return apiClient.postJSON({
    url,
    payload: {
      doc_type,
    },
  });
}

export function additionalFilter({ payload }) {
  const {
    docType,
    docId,
    fieldId,
    uiValue,
    pType = '',
    subPType = '',
  } = payload;
  const url = replaceAllWords(mew.additionalFilter, {
    '{docType}': docType,
    '{docId}': docId,
    '{fieldId}': fieldId,
  });
  return apiClient.postJSON({
    url,
    payload: {
      data_type: uiValue,
      type: uiValue,
      section_type: subPType || pType,
    },
  });
}

export function changeFilter({ payload }) {
  const {
    docType,
    fieldId,
    id,
    filterId,
    value,
    valueId,
    label,
    pType,
    subPType = '',
  } = payload;
  const url = replaceAllWords(mew.changeFilter, {
    '{docType}': docType,
    '{fieldId}': fieldId,
  });
  return apiClient.postJSON({
    url,
    payload: {
      id: id,
      filter_id: filterId,
      value: value,
      value_id: valueId,
      label: label,
      type: subPType || pType,
    },
  });
}

export function saveAndCloseFilter({ docType, id, docId }) {
  const url = replaceAllWords(mew.saveAndCloseFilter, {
    '{docType}': docType,
    '{id}': id,
  });
  return apiClient.postJSON({
    url,
    payload: {
      doc_id: docId,
    },
  });
}

export function getServices(queryParams = {}) {
  const url = mew.getServices;
  return apiClient.get({
    url,
    queryParams,
  });
}

export function updateStatusServices({
  serviceId,
  status,
  uploadSample,
  title,
}) {
  const url = mew.updateStatusServices.replace('{service}', serviceId);
  return apiClient.postJSON({
    url,
    payload: {
      can_upload: status,
      upload_sample: uploadSample,
      title: title,
    },
  });
}

export function uploadDummyDocOfServices(service) {
  const url = mew.uploadDummyDocOfServices.replace('{service}', service);
  return apiClient.postJSON({
    url,
  });
}

export function getFilterDataType() {
  const url = mew.getFilterDataType;
  return apiClient.get({
    url,
  });
}

export function getCustomFilterData(payload) {
  const { doc_type, title } = payload;
  const url = mew.getCustomFilterData.replace('{docType}', doc_type);
  return apiClient.postJSON({
    url,
    payload: {
      title,
    },
  });
}

export function updateCustomFilterData(payload) {
  const { id, value, doc_type } = payload;
  const url = mew.updateCustomFilterData.replace('{docType}', doc_type);
  return apiClient.postJSON({
    url,
    payload: {
      id,
      value,
    },
  });
}

export function getValidation({ docId, parentId, payload, docType } = {}) {
  const url = replaceAllWords(mew.getValidation, {
    '{parentId}': parentId,
    '{docId}': docId,
    '{docType}': docType,
  });
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function customValidation({ docType, payload } = {}) {
  const url = mew.customValidation.replace('{docType}', docType);
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function getGeneralAnalytics({ docType, queryParams } = {}) {
  const url = mew.getGeneralAnalytics.replace('{docType}', docType);
  return apiClient.get({
    url,
    queryParams,
  });
}

export function getAccuracyAnalytics({ docType, queryParams } = {}) {
  const url = mew.getAccuracyAnalytics.replace('{docType}', docType);
  return apiClient.get({
    url,
    queryParams,
  });
}

export function nlpTraining({ doc_type } = {}) {
  const url = mew.nlpTraining;
  return apiClient.postJSON({
    url,
    queryParams: {
      doc_type,
    },
  });
}

export function downloadTextDocument(payload) {
  const { doc_id } = payload;
  const url = mew.downloadTextDocument.replace('{docId}', doc_id);
  return apiClient.postJSON({
    url,
  });
}

export function getTrainVersion({ docType } = {}) {
  const url = mew.getTrainVersion.replace('{docType}', docType);
  return apiClient.get({
    url,
  });
}

export function getCurrentVersion() {
  const url = mew.getCurrentVersion;
  return apiClient.get({
    url,
  });
}

export function getSelectedDocumentTypes({ key }) {
  const url = mew.getSelectedDocumentTypes;
  return apiClient.get({
    url,
    queryParams: {
      version: key,
    },
  });
}

export function getTrainableStatus(payload) {
  const url = mew.getTrainableStatus;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function startAutoClassify(payload) {
  const url = mew.startAutoClassify;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function updateClassificationVersion(payload) {
  const { version } = payload;
  const url = mew.updateClassificationVersion.replace('{version}', version);
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function getAutoClassifyVersion() {
  const url = mew.getAutoClassifyVersion;
  return apiClient.get({
    url,
    disableCCase: true,
  });
}

export function getMODELList({ queryParams } = {}) {
  const url = mew.getMODELList;
  return apiClient.get({
    url,
    queryParams,
  });
}

export function trainCurrentModel({ payload }) {
  const url = mew.trainCurrentModel;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function getModelSingleViewData({ mId }) {
  const url = mew.getModelSingleViewData.replace('{mId}', mId);
  return apiClient.get({
    url,
  });
}

export function deleteModel(payload) {
  const url = mew.deleteModel;
  return apiClient.delete({
    url,
    payload,
  });
}

export function renameModel(payload) {
  const url = mew.renameModel;
  return apiClient.patchJSON({
    url,
    payload,
  });
}

export function getComparision({ queryParams } = {}) {
  const url = mew.getComparision;
  return apiClient.get({
    url,
    queryParams,
  });
}

export function getDownloadReport(payload) {
  const { type, docType, from, to } = payload;
  const url = mew.getDownloadReport.replace('{docType}', docType);
  return apiClient.get({
    url,
    queryParams: {
      type,
      from,
      to,
    },
  });
}

export function downloadSpreadsheetFile(payload) {
  const { doc_id } = payload;
  const url = mew.downloadSpreadsheetFile.replace('{docId}', doc_id);
  return apiClient.postJSON({
    url,
  });
}

export function getModelTypes() {
  const url = mew.getModelTypes;
  return apiClient.get({
    url,
  });
}

export function editFileOrFolderName(payload) {
  const url = mew.editFileOrFolderName;
  const { queryParams, name } = payload;
  return apiClient.postJSON({
    url,
    payload: { name },
    queryParams,
  });
}

export function getDocumentModelConfig() {
  const url = mew.getDocumentModelConfig;
  return apiClient.get({
    url,
  });
}

export function downloadFolderDocs(payload) {
  const url = mew.downloadFolderDocs;
  const { type } = payload;
  return apiClient.postJSON({
    url,
    payload,
    queryParams: {
      type: type,
    },
  });
}

export function validateDocumentTitle(payload) {
  const url = mew.validateDocumentTitle;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function getDocumentTypeAccess(payload) {
  const { docType } = payload;
  const url = mew.getDocumentTypeAccess.replace('{docType}', docType);

  return apiClient.get({
    url,
  });
}

/**
 * Change the order of a field in a document.
 *
 * @param {Object} payload - The payload containing information about the change.
 * @param {string} payload.docType - The type of the document.
 * @param {Object} payload.data - The data for the field reorder operation.
 * @returns {Promise<Object>} A Promise that resolves to the API response.
 */
export function changeFieldOrder(payload) {
  const { docType, data } = payload;
  const url = mew.changeFieldOrder.replace('{docType}', docType);

  return apiClient.postJSON({
    url,
    payload: data,
  });
}

/**
 * Change the data type of a field in a document.
 *
 * @param {Object} payload - The payload containing information about the change.
 * @param {string} payload.docType - The type of the document.
 * @param {string} payload.fieldId - The ID of the field to be reordered.
 * @param {Object} payload.data - The data for the field reorder operation.
 * @returns {Promise<Object>} A Promise that resolves to the API response.
 */
export function changeFieldType(payload) {
  const { docType, fieldId, data } = payload;
  const url = mew.changeFieldType
    .replace('{docType}', docType)
    .replace('{fieldId}', fieldId);

  return apiClient.postJSON({
    url,
    payload: data,
  });
}

export function cancelSavedChanges({ docType } = {}) {
  const url = mew.cancelSavedChanges;
  return apiClient.postJSON({
    url,
    payload: {
      doc_type: docType,
    },
  });
}

export function changeFieldVisiblity(payload) {
  const { docType, fieldId, is_hidden } = payload;
  const url = mew.changeFieldVisibility
    .replace('{docType}', docType)
    .replace('{fieldId}', fieldId);
  return apiClient.postJSON({
    url,
    payload: {
      is_hidden,
    },
  });
}

export function triggerCreditNotification({
  queryParams,
  number_of_credits,
  additional_comments,
}) {
  const url = mew.triggerCreditNotification;

  return apiClient.postJSON({
    url,
    queryParams,
    payload: {
      number_of_credits,
      additional_comments,
    },
  });
}
