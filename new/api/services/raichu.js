import apiClient from 'new/api/apiClient';
import { endpoints } from 'new/api/endpoints';
import { replaceAllWords } from 'new/utils/textUtils';

const raichu = endpoints.raichu;

export function updateCSVTitle({ payload }) {
  const { docId, title } = payload;
  const url = raichu.updateCSVTitle.replace('{docId}', docId);
  return apiClient.postJSON({
    url,
    payload: {
      title: title,
    },
  });
}

export function deleteCsv(payload) {
  const url = raichu.deleteCsv;
  return apiClient.delete({
    url,
    payload,
  });
}

export function deleteCsvRow(payload) {
  const { ids, ddId } = payload;
  const url = raichu.deleteCsvRow.replace('{ddId}', ddId);
  return apiClient.delete({
    url,
    payload: {
      ids,
    },
  });
}

export function addCsvRowLine(payload) {
  const { ddId } = payload;
  const url = raichu.addCsvRowLine.replace('{ddId}', ddId);
  return apiClient.postJSON({
    url,
  });
}

export function downloadCsv(payload) {
  const { dd_ids, type } = payload;
  const url = raichu.downloadCsv;
  return apiClient.postJSON({
    url,
    payload: {
      dd_ids,
    },
    queryParams: {
      type,
    },
  });
}

export function uploadCsvDocument({ payload, cancelToken, onUploadProgress }) {
  const url = raichu.uploadCsvDocument;
  return apiClient.post({
    url,
    payload,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    cancelToken,
    onUploadProgress,
  });
}

export function updateCsvDocument(payload) {
  const { files, ddId } = payload;
  const url = raichu.updateCsvDocument.replace('{ddId}', ddId);
  return apiClient.patch({
    url,
    payload: {
      files,
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function updateCsvField(payload) {
  const { id, header, value, ddId } = payload;
  const url = raichu.updateCsvField.replace('{ddId}', ddId);
  return apiClient.patchJSON({
    url,
    payload: {
      id,
      header,
      value,
    },
  });
}

export function getTableViewData({ ddId, queryParams } = {}) {
  const url = raichu.getTableViewData.replace('{ddId}', ddId);
  return apiClient.get({
    url,
    queryParams,
    disableCCase: true,
  });
}

export function getDocumentDDMValues({ itemId, docType, docId } = {}) {
  const url = replaceAllWords(raichu.getDocumentDDMValues, {
    '{docType}': docType,
    '{docId}': docId,
    '{itemId}': itemId,
  });
  return apiClient.get({
    url,
  });
}

export function getDocumentSettingFilterList({ doc_type, title }) {
  const url = raichu.getDocumentSettingFilterList;
  return apiClient.postJSON({
    url,
    payload: {
      doc_type,
      title,
    },
  });
}

export function getDocTypeSetting({ doc_type, title }) {
  const url = raichu.getDocTypeSetting.replace('{docType}', doc_type);
  return apiClient.postJSON({
    url,
    payload: {
      title,
    },
  });
}

export function getDocTypeViewChanges({ doc_type }) {
  const url = raichu.getDocTypeViewChanges.replace('{docType}', doc_type);
  return apiClient.get({
    url,
  });
}

export function changeDocTypeSetting({ doc_type, id, filterId, value }) {
  const url = raichu.changeDocTypeSetting.replace('{docType}', doc_type);
  return apiClient.postJSON({
    url,
    payload: {
      id: id,
      filter_id: filterId,
      value: value,
    },
  });
}

export function getTempToken({ docId } = {}) {
  const url = raichu.getTempToken.replace('{docId}', docId);
  return apiClient.post({
    url,
  });
}

export function getLogInfo({ queryParams } = {}) {
  const url = raichu.getLogInfo;
  return apiClient.get({
    url,
    queryParams,
  });
}

export function getActivity({ queryParams } = {}) {
  const url = raichu.getActivity;
  return apiClient.get({
    url,
    queryParams,
    disableRefetch: true,
  });
}

export function getAllActivity({ queryParams } = {}) {
  return getActivity({
    queryParams,
  });
}

export function getDocumentActivity({ queryParams } = {}) {
  return getActivity({
    queryParams: {
      ...queryParams,
      type: ['document_action'],
    },
  });
}

export function getUserActivity({ queryParams } = {}) {
  return getActivity({
    queryParams: {
      ...queryParams,
      type: ['user_action'],
    },
  });
}

export function getCreditActivity({ queryParams } = {}) {
  return getActivity({
    queryParams: {
      ...queryParams,
      type: ['admin_action'],
    },
  });
}

export function getWebhookActivity({ queryParams } = {}) {
  return getActivity({
    queryParams: {
      ...queryParams,
      type: ['webhook_action'],
    },
  });
}

export function getModeActivity({ queryParams } = {}) {
  return getActivity({
    queryParams: {
      ...queryParams,
      type: ['mode_action'],
    },
  });
}

export function getActivityCounts({ queryParams } = {}) {
  const url = raichu.getActivityCounts;
  return apiClient.get({
    url,
    queryParams,
  });
}

export function getCSVHeader({ dropDownId } = {}) {
  const url = raichu.getCSVHeader.replace('{dropDownId}', dropDownId);
  return apiClient.get({
    url,
  });
}

export function getCSVList({ queryParams }) {
  const url = raichu.getCSVList;
  return apiClient.get({
    url,
    queryParams,
  });
}

export function getModelDDList({ id, type = '' }) {
  const url = raichu.getModelDDList.replace('{id}', id);
  return apiClient.get({
    url,
    queryParams: {
      type,
    },
  });
}

export function getNotificationPreference() {
  const url = raichu.getNotificationPreference;
  return apiClient.get({
    url,
  });
}

export function updateNotificationPreference({ payload }) {
  const url = raichu.updateNotificationPreference;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function getLookupData({ type = '' }) {
  const url = raichu.getLookupData;
  return apiClient.get({
    url,
    queryParams: {
      type,
    },
    disableCCase: true,
  });
}

export function resetCustomCode(payload) {
  const { docType, id } = payload;
  const url = raichu.resetCustomCode.replace('{docType}', docType);

  return apiClient.postJSON({
    url,
    payload: {
      id,
    },
  });
}

export function getFilterDataList() {
  const url = raichu.getFilterDataList;
  return apiClient.get({
    url,
  });
}

export function postTrackingData(payload) {
  const url = raichu.postTrackingData;
  return apiClient.postJSON({
    url,
    payload,
  });
}
