import * as documentConstants from 'client/constants/document';

import apiClient from './client';

export { apiClient };

export function signupUser({
  fullName,
  email,
  connectedFrom,
  password,
  region,
  jobRole,
  company,
  phoneNumber,
  approvedTerms,
  documentType,
  noOfFile,
  referrer,
  utm_source,
  utm_channel,
  utm_campaign,
  utm_term,
  type,
  idToken,
  providerId,
}) {
  const url = '/api/v1/eevee/signup/';
  return apiClient.postJSON({
    url,
    payload: {
      full_name: fullName,
      company_name: company,
      email,
      connected_from: connectedFrom,
      password,
      region,
      job_role: jobRole,
      phone_number: phoneNumber,
      document_type: documentType,
      no_of_file: noOfFile,
      approved_terms: approvedTerms,
      ref: referrer,
      id_token: idToken || '',
      idp: providerId || '',
    },
    queryParams: {
      utm_source,
      utm_channel,
      utm_campaign,
      utm_term,
      type,
    },
  });
}

export function validateSignupUser({ email, type, idToken, ...params }) {
  const url = '/api/v1/eevee/signup/validate/';
  return apiClient.postJSON({
    url,
    payload: {
      email,
      id_token: idToken,
      ...params,
    },
    queryParams: {
      type,
    },
  });
}

export function loginAppUser({ email, mfa_code = '', ...params }) {
  const url = '/api/v1/eevee/login/';
  return apiClient.postJSON({
    url,
    payload: {
      email,
      mfa_code,
      ...params,
    },
  });
}

export function logoutUser() {
  const url = '/api/v1/eevee/logout/';
  return apiClient.post({
    url,
  });
}

export function getUser() {
  const url = '/api/v1/eevee/user/';
  return apiClient.get({
    url,
  });
}

export function addMember({ payload }) {
  const url = '/api/v1/eevee/signup/users/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function getMembers() {
  const url = '/api/v1/eevee/users/member/list/';
  return apiClient.get({
    url,
  });
}

export function editMember({ payload }) {
  const url = '/api/v1/eevee/users/member/edit/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function deleteMember({ payload }) {
  const url = '/api/v1/eevee/delete/users/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function sendFeedback({ payload }) {
  const url = '/api/v1/eevee/users/feedback/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function getConfig() {
  const url = '/api/v1/eevee/config/';
  return apiClient.get({
    url,
  });
}
export function getDocTypeConfig() {
  const url = '/api/v1/eevee/config/doc_types/';
  return apiClient.get({
    url,
  });
}

export function updateConfigFlags({ payload } = {}) {
  const url = '/api/v1/eevee/config/flag/';
  return apiClient.patchJSON({
    url,
    payload,
  });
}

export function getUserFlow() {
  const url = '/api/v1/mew/users/tooltip/';
  return apiClient.get({
    url,
  });
}

export function updateUserSettings({ payload } = {}) {
  const url = '/api/v1/eevee/users/settings/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function forgetUserPassword({ email }) {
  const url = '/api/v1/eevee/forget_password/new_token/';
  return apiClient.postJSON({
    url,
    payload: {
      email,
    },
  });
}

export function validateToken({ token }) {
  const url = '/api/v1/eevee/validate/fp_token/';
  return apiClient.postJSON({
    url,
    payload: {
      token,
    },
  });
}

export function resetUserPassword({ password, token }) {
  const url = '/api/v1/eevee/forget_password/change_password/';
  return apiClient.postJSON({
    url,
    payload: {
      password_new: password,
      token,
    },
  });
}

export function changeUserPassword({
  oldPassword,
  newPassword,
  setCookie,
} = {}) {
  const url = '/api/v1/eevee/users/settings/password/';
  return apiClient.postJSON({
    url,
    payload: {
      password_old: oldPassword,
      password_new: newPassword,
    },
    queryParams: {
      set_cookie: setCookie,
    },
  });
}

export function updateDocumentDeleteAfter({ delDocAfter }) {
  const url = '/api/v1/eevee/config/del_doc_after/';
  return apiClient.postJSON({
    url,
    payload: {
      del_doc_after: delDocAfter,
    },
  });
}
export function setTempTokenDuration({ tempTokenDuration }) {
  const url = '/api/v1/eevee/config/temp_token_duration/';
  return apiClient.postJSON({
    url,
    payload: {
      temp_token_duration: tempTokenDuration,
    },
  });
}

export function updateStraightThroughProcessingFlags({
  straightThroughProcessing,
} = {}) {
  const url = '/api/v1/eevee/config/flag/';
  return apiClient.patchJSON({
    url,
    payload: {
      straight_through_processing: straightThroughProcessing,
    },
  });
}

export function updateUserSettingsWebhookUrl({ payload } = {}) {
  const url = '/api/v1/eevee/config/webhook/';
  return apiClient.postJSON({
    url,
    payload: {
      webhook_url: payload,
    },
  });
}

export function refreshUserDocsumoApiKey() {
  const url = '/api/v1/eevee/apikey/refresh/';
  return apiClient.post({
    url,
  });
}

export function getDocumentCounts({ queryParams } = {}) {
  const url = '/api/v1/eevee/documents/count/';
  return apiClient.get({
    url,
    queryParams,
  });
}

export function getDocuments({ queryParams } = {}) {
  const url = '/api/v1/eevee/documents/';
  return apiClient.get({
    url,
    queryParams,
    disableRefetch: true,
  });
}

export function getAllDocuments({ queryParams } = {}) {
  return getDocuments({
    queryParams,
  });
}

export function getAllDocumentsTypes({ queryParams } = {}) {
  const url = '/api/v1/mew/documents/types/';
  return apiClient.get({
    url,
    queryParams,
  });
}

export function createDocumentType({ queryParams } = {}) {
  const url = '/api/v1/mew/documents/types/new/';
  return apiClient.post({
    url,
    queryParams,
  });
}

export function createNewFolder({ payload }) {
  const url = '/api/v1/mew/folder/add/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function editNewFolder({ payload }) {
  const url = '/api/v1/mew/folder/edit/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function getFolderDetail(payload) {
  const { folder_id } = payload;
  const url = `/api/v1/mew/folders/detail/${folder_id}/`;
  return apiClient.get({
    url,
  });
}

export function duplicateDocumentTypeFetch({ doc_type, title_old }) {
  const url = '/api/v1/mew/documents/types/duplicate/';
  return apiClient.postJSON({
    url,
    payload: {
      doc_type: doc_type,
      title_old: title_old,
    },
  });
}
export function updateDocumentTypeTitle({ payload }) {
  const { docId, title, doc_type } = payload;
  const url = `/api/v1/mew/documents/types/${docId}/`;
  return apiClient.postJSON({
    url,
    payload: {
      title: title,
      doc_type,
    },
  });
}
export function updateCSVTitle({ payload }) {
  const { docId, title } = payload;
  const url = `/api/v1/raichu/drop_down/db/rename/${docId}/`;
  return apiClient.postJSON({
    url,
    payload: {
      title: title,
    },
  });
}

export function getReviewDocuments({ queryParams } = {}) {
  return getDocuments({
    queryParams: {
      ...queryParams,
      status: [
        documentConstants.STATUSES.REVIEW_REQUIRED,
        documentConstants.STATUSES.REVIEWING,
      ],
    },
  });
}

export function getSkippedDocuments({ queryParams } = {}) {
  return getDocuments({
    queryParams: {
      ...queryParams,
      status: [documentConstants.STATUSES.REVIEW_SKIPPED],
    },
  });
}

export function getProcessedDocuments({ queryParams } = {}) {
  return getDocuments({
    queryParams: {
      ...queryParams,
      status: [documentConstants.STATUSES.PROCESSED],
    },
  });
}

export function downloadProcessedDocuments(payload) {
  const url = '/api/v1/eevee/documents/download/';
  const { type, queryParams, doc_type } = payload;
  return apiClient.post({
    url,
    queryParams: {
      ...queryParams,
      format: type,
      doc_type: doc_type,
      status: [documentConstants.STATUSES.PROCESSED],
    },
  });
}

export function retryDocuments(payload) {
  const url = '/api/v1/mew/documents/retry/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function changeDocType(payload) {
  const url = '/api/v1/mew/documents/change_type/';
  return apiClient.postJSON({
    url,
    payload,
  });
}
export function changeUserType(payload) {
  const url = '/api/v1/mew/documents/change_user/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function deleteDocAndFolder(payload) {
  const url = '/api/v1/mew/folder/delete/';
  return apiClient.delete({
    url,
    payload,
  });
}

export function deleteCsv(payload) {
  const url = '/api/v1/raichu/drop_down/db/delete/';
  return apiClient.delete({
    url,
    payload,
  });
}

export const pullDocFromProd = (payload) => {
  const url = '/api/v1/mew/documents/types/pull/';
  const { docType } = payload;
  return apiClient.postJSON({
    url,
    payload: {
      doc_types: [docType],
    },
  });
};

export const pushDocFromProd = (payload) => {
  const url = '/api/v1/mew/documents/types/push/';
  return apiClient.postJSON({
    url,
    payload,
  });
};

export function deleteCsvRow(payload) {
  const { ids, ddId } = payload;
  const url = `/api/v1/raichu/drop_down/db/update/${ddId}/`;
  return apiClient.delete({
    url,
    payload: {
      ids,
    },
  });
}

export function downlaodMultiDocs(payload) {
  const url = '/api/v1/mew/documents/download/';
  const { type } = payload;
  return apiClient.postJSON({
    url,
    payload,
    queryParams: {
      type: type,
    },
  });
}

export function addCsvRowLine(payload) {
  const { ddId } = payload;
  const url = `/api/v1/raichu/drop_down/db/addrow/${ddId}/`;
  return apiClient.postJSON({
    url,
  });
}

export function downloadCsv(payload) {
  const { dd_ids, type } = payload;
  const url = '/api/v1/raichu/drop_down/db/download/';
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

export function downloadAllDocs({ queryParams } = {}) {
  const url = '/api/v1/mew/documents/download_all/';
  return apiClient.postJSON({
    url,
    queryParams,
  });
}

export function downloadDocumentByFormat(payload) {
  const url = '/api/v1/eevee/documents/download/single/';
  const { type, queryParams, doc_id } = payload;
  return apiClient.post({
    url,
    queryParams: {
      ...queryParams,
      format: type,
      doc_id: doc_id,
    },
  });
}

export function uploadDocument({ payload, cancelToken, onUploadProgress }) {
  const url = '/api/v1/eevee/documents/upload/';
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
export function uploadCsvDocument({ payload, cancelToken, onUploadProgress }) {
  const url = '/api/v1/raichu/drop_down/db/add/';
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
  const url = `/api/v1/raichu/drop_down/db/update/${ddId}/`;
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
  const url = `/api/v1/raichu/drop_down/db/update/single/${ddId}/`;
  return apiClient.patchJSON({
    url,
    payload: {
      id,
      header,
      value,
    },
  });
}

export function deleteDocument({ docId }) {
  const url = `/api/v1/eevee/documents/${docId}/`;
  return apiClient.delete({
    url,
  });
}

export function splitDocument(payload) {
  const url = '/api/v1/pik/documents/split/';
  return apiClient.postJSON({
    url,
    payload,
  });
}
export function splitClassifyDocument(payload) {
  const url = '/api/v1/pik/documents/split_v2/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function deleteDocumentType({ docId, doc_type }) {
  const url = `/api/v1/mew/documents/types/${docId}/`;
  return apiClient.delete({
    url,
    payload: {
      doc_type,
    },
  });
}
export function resetDocumentType({ doc_type, excel_type }) {
  const url = `/api/v1/mew/documents/reset/${doc_type}/`;
  return apiClient.postJSON({
    url,
    payload: {
      excel_type,
    },
  });
}

export function startReview({ queryParams } = {}) {
  const url = '/api/v1/pik/review/start/';
  return apiClient.post({
    url,
    queryParams,
  });
}
export function editFieldReview({ doc_type } = {}) {
  const url = `/api/v1/mew/filters/edit/start/${doc_type}/`;
  return apiClient.post({
    url,
  });
}

export function updateFieldAndSection({
  docType,
  docId,
  itemId,
  payload,
} = {}) {
  const url = `/api/v1/mew/filters/move/item/${docType}/${docId}/${itemId}/`;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function saveAndCloseData({ docTypeId, type, docId } = {}) {
  const url = `/api/v1/mew/documents/types/save/${docTypeId}/`;
  return apiClient.postJSON({
    url,
    payload: { type, doc_id: docId },
  });
}

export function startDocumentReview({ docId, docType } = {}) {
  const url = `/api/v1/pik/review/${docId}/start/`;
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
  const url = `/api/v1/pik/review/${docId}/end/`;
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
  const url = `/api/v1/pik/review/${docId}/skip/`;
  return apiClient.postJSON({
    url,
    payload: {
      ext_user,
    },
  });
}

export function getDocumentBboxes({ docId } = {}) {
  const url = `/api/v1/pik/documents/${docId}/bboxes/`;
  return apiClient.get({
    url,
  });
}

export function getTableViewData({ ddId, queryParams } = {}) {
  const url = `/api/v1/raichu/drop_down/db/get/${ddId}/`;
  return apiClient.get({
    url,
    queryParams,
    disableCCase: true,
  });
}

export function getDocumentAllTableGrids({ docId = '' }) {
  const url = `/api/v1/pik/tablegrid/${docId}/`;
  return apiClient.get({
    url,
  });
}

export function getDocumentGrids({ docId, parentId } = {}) {
  const url = `/api/v1/pik/tablegrid/${docId}/${parentId}/`;
  return apiClient.get({
    url,
    disableCCase: true,
  });
}

export function postDocumentGrids({ docId, parentId, payload } = {}) {
  const url = `/api/v1/pik/tablegrid/${docId}/${parentId}/`;
  return apiClient.postJSON({
    url,
    payload,
    disableRefetch: true,
    disableCCase: true,
  });
}

export function extractGridData({ docId, sectionFieldId, payload } = {}) {
  const url = `/api/v1/pik/tablegrid/extract/${docId}/${sectionFieldId}/`;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function addDocumentGrids({ docId, parentId, payload } = {}) {
  const url = `/api/v1/pik/tablegrid/add/new/${docId}/${parentId}/`;
  return apiClient.postJSON({
    url,
    payload,
    disableCCase: true,
  });
}

export function tagDocumentGrids({ docId, parentId, payload } = {}) {
  const url = `/api/v1/pik/tablegrid/add/${docId}/${parentId}/`;
  return apiClient.postJSON({
    url,
    payload,
    disableCCase: true,
  });
}

export function deleteDocumentGrids({ docId, parentId, ...payload } = {}) {
  const url = `/api/v1/pik/tablegrid/${docId}/${parentId}/`;
  return apiClient.delete({
    url,
    disableCCase: true,
    payload,
  });
}

export function pasteGrid({ docId, parentId, ...payload } = {}) {
  const url = `/api/v1/pik/tablegrid/copy/paste/${docId}/${parentId}/`;
  return apiClient.postJSON({
    url,
    disableCCase: true,
    payload,
  });
}

export function getDocumentDDValues({ itemId, type, label, pType } = {}) {
  const url = `/api/v1/mew/drop_down/detail/${itemId}/`;
  return apiClient.postJSON({
    url,
    payload: {
      doc_type: type,
      label,
      item_type: pType,
    },
  });
}

export function realTimeUpdateField({ itemId, docId, payload } = {}) {
  const url = `/api/v1/pik/documents/${docId}/update/field/multiple/${itemId}/`;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function getDocumentDDMValues({ itemId, docType, docId } = {}) {
  const url = `/api/v1/raichu/drop_down/db/detail/${docType}/${docId}/${itemId}/`;
  return apiClient.get({
    url,
  });
}

// export function getDocumentDDOptions({ drop_down_id, queryParams }={}) {
//     const url = `/api/v1/mew/drop_down/get/${drop_down_id}/`;
//     return apiClient.get({
//         url,
//         queryParams,
//         disableRefetch: true
//     });
// }
export function getDocumentDDOptions({
  id,
  type,
  queryParams,
  itemType,
  label,
} = {}) {
  const url = `/api/v1/mew/drop_down/detail/${id}/`;
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

export function getDocumentSearchBboxes({ docId, queryParams } = {}) {
  const url = `/api/v1/pik/documents/${docId}/search/text/review/`;
  return apiClient.get({
    url,
    queryParams,
    disableRefetch: true,
  });
}

export function getDocumentData({ docId } = {}) {
  const url = `/api/v1/pik/documents/${docId}/data/`;
  return apiClient.get({
    url,
  });
}
export function getEditFieldDocumentBboxes(payload) {
  const { doc_type, docId } = payload;
  const url = `/api/v1/mew/filters/edit/bbox/${doc_type}/${docId}/`;
  return apiClient.get({
    url,
  });
}

export function getEditFieldDocumentData(payload) {
  const { doc_type, docId } = payload;
  const url = `/api/v1/mew/filters/edit/data/${doc_type}/${docId}/`;
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
  const url = `/api/v1/pik/documents/${docId}/search/text/`;
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
  const url = `/api/v1/pik/documents/${docId}/update/field/${fieldId}/`;
  return apiClient.patchJSON({
    url,
    payload,
  });
}

export function reviewAddLine({ docId, sectionFieldId, baseItemId } = {}) {
  const url = `/api/v1/pik/documents/${docId}/line-items/${sectionFieldId}/add-line/`;
  return apiClient.postJSON({
    url,
    queryParams: {
      base_item_id: baseItemId,
    },
  });
}

export function editFieldAddFooterColumn({
  docId,
  sectionFieldId,
  docType,
  type,
} = {}) {
  const url = `/api/v1/mew/filters/add/key/${docType}/${docId}/${sectionFieldId}/`;
  return apiClient.postJSON({
    url,
    payload: {
      p_type: type,
    },
  });
}

export function addNewSectionTable({ docId, docType, sectionType } = {}) {
  const url = `/api/v1/mew/filters/add/section/${docType}/${docId}/${sectionType}/`;
  return apiClient.postJSON({
    url,
  });
}
export function updateSectionTitle({ payload }) {
  const { docId, p_title, doc_type, id } = payload;
  const url = `/api/v1/mew/filters/edit/section/${doc_type}/${docId}/${id}/`;
  return apiClient.postJSON({
    url,
    payload: {
      p_title,
    },
  });
}
export function deleteSection(payload) {
  const { docId, docType, id } = payload;
  const url = `/api/v1/mew/filters/delete/section/${docType}/${docId}/${id}/`;
  return apiClient.delete({
    url,
  });
}
export function addSectionField({ payload }) {
  const { docType, id, docId, type, format } = payload;
  const url = `/api/v1/mew/filters/add/key/${docType}/${docId}/${id}/`;
  return apiClient.postJSON({
    url,
    payload: {
      type,
      format,
    },
  });
}
export function deleteSectionField({ payload }) {
  const { docType, fieldId, docId, type, subPType } = payload;
  const url = `/api/v1/mew/filters/delete/key/${docType}/${docId}/${fieldId}/`;
  return apiClient.delete({
    url,
    payload: {
      type: type,
      sub_p_type: subPType,
    },
  });
}
// export function filterSectionField({payload}) {
//     const { docTypeId }=payload;
//     const url = `/api/v1/mew/filters/default/${docTypeId}/`;
//     return apiClient.get({
//         url,
//     });
// }
export function filterSectionField({ payload }) {
  const { fieldId, docType, idAutoExtract, pType, subPType = '' } = payload;
  const url = `/api/v1/mew/filter/${docType}/${fieldId || idAutoExtract}/`;
  return apiClient.get({
    url,
    queryParams: {
      type: subPType || pType,
    },
  });
}

export function getFilterList({ doc_type }) {
  const url = '/api/v1/mew/filter/list/';
  return apiClient.postJSON({
    url,
    payload: {
      doc_type,
    },
  });
}
// export function additionalFilter({payload}) {
//     const { docType,docId,id,value,filters }=payload;
//     const url = `/api/v1/mew/filters/update/filter/${docType}/${docId}/${id}/`;
//     return apiClient.postJSON({
//         url,
//         payload:{
//             filters,
//             value,
//         }
//     });
// }
export function additionalFilter({ payload }) {
  //const { docType,docId,idAutoExtract,uiValue}=payload;
  const {
    docType,
    docId,
    fieldId,
    uiValue,
    pType = '',
    subPType = '',
  } = payload;
  //const url = `/api/v1/mew/filter/change/data_type/${docType}/${docId}/${idAutoExtract}/`;
  const url = `/api/v1/mew/filter/change/data_type/${docType}/${docId}/${fieldId}/`;
  return apiClient.postJSON({
    url,
    payload: {
      type: uiValue,
      section_type: subPType || pType,
    },
  });
}
export function changeFilter({ payload }) {
  //const { docType,docId,idAutoExtract,id, filterId, value, valueId, label}=payload;
  const {
    docType,
    docId,
    fieldId,
    id,
    filterId,
    value,
    valueId,
    label,
    pType,
    subPType = '',
  } = payload;
  //const url = `/api/v1/mew/filter/update/${docType}/${docId}/${idAutoExtract}/`;
  const url = `/api/v1/mew/filter/update/${docType}/${docId}/${fieldId}/`;
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
  const url = `/api/v1/mew/filter/save/${docType}/${id}/`;
  return apiClient.postJSON({
    url,
    payload: {
      doc_id: docId,
    },
  });
}
export function reviewAddSimilarLines({ docId, sectionFieldId } = {}) {
  const url = `/api/v1/pik/documents/${docId}/line-items/${sectionFieldId}/add-similar-lines/`;
  return apiClient.postJSON({
    url,
  });
}
export function updateEditFieldData({ docId, fieldId, payload, docType } = {}) {
  const url = `/api/v1/mew/filters/edit/key/${docType}/${docId}/${fieldId}/`;
  return apiClient.postJSON({
    url,
    payload,
  });
}
export function updateEditFieldLabel({
  docId,
  fieldId,
  payload,
  docType,
} = {}) {
  const url = `/api/v1/mew/filters/edit/key/${docType}/${docId}/${fieldId}/`;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function reviewDeleteLineItemFields({
  docId,
  sectionFieldId,
  fieldIds = [],
} = {}) {
  const url = `/api/v1/pik/documents/${docId}/line-items/${sectionFieldId}/`;
  return apiClient.delete({
    url,
    payload: {
      ids: fieldIds,
    },
  });
}

export function getServices(queryParams = {}) {
  const url = '/api/v1/mew/documents/types/api/list/';
  return apiClient.get({
    url,
    queryParams,
  });
}

export function updateStatusServices(service, status) {
  const url = `/api/v1/mew/documents/types/api/update/${service}/`;
  return apiClient.postJSON({
    url,
    payload: {
      can_upload: status,
    },
  });
}

export function uploadDummyDocOfServices(service) {
  const url = `/api/v1/mew/documents/types/api/upload/${service}/`;
  return apiClient.postJSON({
    url,
  });
}

export function addTableMultiplePage({ docId, parentId, payload } = {}) {
  const url = `/api/v1/pik/documents/${docId}/line-items/${parentId}/add-similar-lines/`;
  return apiClient.postJSON({
    url,
    payload,
    disableRefetch: true,
    disableCCase: true,
  });
}
export function getFilterDataType() {
  const url = '/api/v1/mew/filters/datatype/';
  return apiClient.get({
    url,
  });
}

export function getCustomFilterData(payload) {
  const { doc_type, title } = payload;
  const url = `/api/v1/mew/dt/setting/fetch/${doc_type}/`;
  return apiClient.postJSON({
    url,
    payload: {
      title,
    },
  });
}
export function updateCustomFilterData(payload) {
  const { id, value, doc_type } = payload;
  const url = `/api/v1/mew/dt/setting/update/${doc_type}/`;
  return apiClient.postJSON({
    url,
    payload: {
      id,
      value,
    },
  });
}
export function getValidation({ docId, parentId, payload, docType } = {}) {
  const url = `/api/v1/mew/validate/key/${docType}/${docId}/${parentId}/`;
  return apiClient.postJSON({
    url,
    payload,
  });
}
export function customValidation({ docType, payload } = {}) {
  const url = `/api/v1/mew/validate/dt/custom_processing/${docType}/`;
  return apiClient.postJSON({
    url,
    payload,
  });
}
export function getGeneralAnalytics({ docType, type } = {}) {
  const url = `/api/v1/mew/analytics/general/${docType}/`;
  return apiClient.get({
    url,
    queryParams: {
      type,
    },
  });
}
export function getAccuracyAnalytics({ docType, type } = {}) {
  const url = `/api/v1/mew/analytics/accuracy/${docType}/`;
  return apiClient.get({
    url,
    queryParams: {
      type,
    },
  });
}

export function getDocumentSettingFilterList({ doc_type, title }) {
  const url = '/api/v1/raichu/dt/setting/fetch/list/';
  return apiClient.postJSON({
    url,
    payload: {
      doc_type,
      title,
    },
  });
}

export function getDocTypeSetting({ doc_type, title }) {
  const url = `/api/v1/raichu/dt/setting/fetch/${doc_type}/`;
  return apiClient.postJSON({
    url,
    payload: {
      title,
    },
  });
}

export function changeDocTypeSetting({ doc_type, id, filterId, value }) {
  const url = `/api/v1/raichu/dt/setting/update/${doc_type}/`;
  return apiClient.postJSON({
    url,
    payload: {
      id: id,
      filter_id: filterId,
      value: value,
    },
  });
}
export function updateOnClose({ docType, docId, refresh } = {}) {
  const url = `/api/v1/pik/review/${docId}/close/`;
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

export function nlpTraining({ doc_type } = {}) {
  const url = '/api/v1/mew/ml/nlp/train/';
  return apiClient.postJSON({
    url,
    queryParams: {
      doc_type,
    },
  });
}

export function getTempToken({ docId } = {}) {
  const url = `/api/v1/raichu/temp_token/create/${docId}/`;
  return apiClient.post({
    url,
  });
}

export function downloadTextDocument(payload) {
  const { doc_id } = payload;
  const url = `/api/v1/mew/documents/download/text/${doc_id}/`;
  return apiClient.postJSON({
    url,
  });
}

export function getTrainVersion({ docType } = {}) {
  const url = `/api/v1/mew/ml/nlp/list/${docType}/`;
  return apiClient.get({
    url,
  });
}

export function getLogInfo({ queryParams } = {}) {
  const url = '/api/v1/raichu/log/get/';
  return apiClient.get({
    url,
    queryParams,
  });
}

export function viewUserDocsumoApiKey() {
  const url = '/api/v1/eevee/config/apikey/';
  return apiClient.get({
    url,
  });
}
export function getActivity({ queryParams } = {}) {
  const url = '/api/v1/raichu/log/get/';
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
  const url = '/api/v1/raichu/log/count/';
  return apiClient.get({
    url,
    queryParams,
  });
}
export function getWebhookData() {
  const url = '/api/v1/eevee/config/get/webhook/';
  return apiClient.get({
    url,
  });
}
export function getCurrentVersion() {
  const url = '/api/v1/mew/ml/dc/get/version/';
  return apiClient.get({
    url,
  });
}
export function getSelectedDocumentTypes({ key }) {
  const url = '/api/v1/mew/ml/dc/get/docs/';
  return apiClient.get({
    url,
    queryParams: {
      version: key,
    },
  });
}

export function getTrainableStatus(payload) {
  const url = '/api/v1/mew/ml/dc/get/status/';
  return apiClient.postJSON({
    url,
    payload,
  });
}
export function startAutoClassify(payload) {
  const url = '/api/v1/mew/ml/dc/train/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function updateClassificationVersion(payload) {
  const { version } = payload;
  const url = `/api/v1/mew/ml/dc/update/${version}/`;
  return apiClient.postJSON({
    url,
  });
}

export function getAutoClassifyVersion() {
  const url = '/api/v1/mew/ml/dc/list/';
  return apiClient.get({
    url,
    disableCCase: true,
  });
}

export function getCSVHeader({ dropDownId } = {}) {
  const url = `/api/v1/raichu/drop_down/headers/${dropDownId}/`;
  return apiClient.get({
    url,
  });
}

export function getCSVList() {
  const url = '/api/v1/raichu/drop_down/db/list/';
  return apiClient.get({
    url,
  });
}
export function getMODELList({ queryParams } = {}) {
  const url = '/api/v1/mew/ml/generic/models/';
  return apiClient.get({
    url,
    queryParams,
  });
}

export function trainCurrentModel({ payload }) {
  const url = '/api/v1/mew/ml/generic/train/';
  return apiClient.postJSON({
    url,
    payload,
  });
}
export function getModelSingleViewData({ mId }) {
  const url = `/api/v1/mew/ml/generic/models/${mId}/`;
  return apiClient.get({
    url,
  });
}

export function deleteModel(payload) {
  const url = '/api/v1/mew/ml/generic/models/';
  return apiClient.delete({
    url,
    payload,
  });
}
export function getComparision({ queryParams } = {}) {
  const url = '/api/v1/mew/ml/generic/models/compare/';
  return apiClient.get({
    url,
    queryParams,
  });
}
export function getModelDDList({ id, type = '' }) {
  const url = `api/v1/raichu/dt/setting/ml/${id}/`;
  return apiClient.get({
    url,
    queryParams: {
      type,
    },
  });
}

export function getNotificationPreference() {
  const url = '/api/v1/raichu/notification/get/';
  return apiClient.get({
    url,
  });
}

export function updateNotificationPreference({ payload }) {
  const url = '/api/v1/raichu/notification/update/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function getDownloadReport(payload) {
  const { type, docType } = payload;
  const url = `/api/v1/mew/analytics/report/${docType}/`;
  return apiClient.get({
    url,
    queryParams: {
      type: type,
    },
  });
}

export function downloadSpreadsheetFile(payload) {
  const { doc_id } = payload;
  const url = `/api/v1/mew/documents/download/excel/${doc_id}/`;
  return apiClient.postJSON({
    url,
  });
}

export function saveSpreadsheetFile(payload) {
  const { doc_id, data, refresh, summary } = payload;
  const url = `/api/v1/pik/review/excel/${doc_id}/close/`;
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
  const url = `/api/v1/pik/review/excel/${docId}/start/`;
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
  const url = `/api/v1/pik/review/excel/${docId}/end/`;
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
export function downloadExcel({
  docId,
  userId,
  orgId,
  dUrl,
  file_name,
  excel_data,
  summary_data,
  temporaryDownloadToken,
} = {}) {
  const url = `${dUrl}`;
  return apiClient.postJSON({
    url,
    payload: {
      excel_data,
      file_name,
      doc_id: docId,
      user_id: userId,
      org_id: orgId,
      summary_data,
    },
    headers: {
      'X-API-KEY': 1234,
      token: temporaryDownloadToken,
    },
  });
}

export function getSummaryPanelData(payload) {
  const { docId } = payload;
  const url = `/api/v1/pik/documents/${docId}/static/data/`;
  return apiClient.get({
    url,
  });
}

export function previewOriginalDocument({ docId = '' }) {
  const url = `/api/v1/eevee/preview/document/${docId}/`;
  return apiClient.get({
    url,
  });
}
export function getModelTypes() {
  const url = '/api/v1/mew/ml/generic/models/list/';
  return apiClient.get({
    url,
  });
}

export function getLookupData({ type = '' }) {
  const url = '/api/v1/raichu/drop_down/db/get/lookup/coa_classification/';
  return apiClient.get({
    url,
    queryParams: {
      type,
    },
    disableCCase: true,
  });
}

export function editFileOrFolderName(payload) {
  const url = '/api/v1/mew/documents/rename/';

  const { queryParams, name } = payload;

  return apiClient.postJSON({
    url,
    payload: { name },
    queryParams,
  });
}

export function saveSpreadsheetSummaryData(payload) {
  const { docId, data } = payload;
  const url = `/api/v1/pik/documents/${docId}/static/data/add/`;

  return apiClient.postJSON({
    url,
    payload: data,
  });
}

export function getDocumentModelConfig() {
  const url = '/api/v1/mew/ml/generic/models/config/';
  return apiClient.get({
    url,
  });
}

export function resetCustomCode(payload) {
  const { docType, id } = payload;
  const url = `/api/v1/raichu/dt/setting/reset/${docType}/`;

  return apiClient.postJSON({
    url,
    payload: {
      id,
    },
  });
}

export function getFilterDataList() {
  const url = '/api/v1/raichu/log/filters/';
  return apiClient.get({
    url,
  });
}

export function validateLogin({ type, payload } = {}) {
  const url = '/api/v1/eevee/validate/login/';
  return apiClient.postJSON({
    url,
    payload,
    queryParams: {
      type,
    },
  });
}

export function linkAccountWithSocial({ payload }) {
  const url = '/api/v1/eevee/link/social/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function setupMFAFlow({ scope } = {}) {
  const url = '/api/v1/eevee/setup/mfa/';
  return apiClient.get({
    url,
    queryParams: {
      scope,
    },
  });
}

export function enableMFA({ scope, payload } = {}) {
  const url = '/api/v1/eevee/enable/mfa/';
  return apiClient.postJSON({
    url,
    payload,
    queryParams: {
      scope,
    },
  });
}

export function disableMFA({ scope, payload } = {}) {
  const url = '/api/v1/eevee/disable/mfa/';
  return apiClient.postJSON({
    url,
    payload,
    queryParams: {
      scope,
    },
  });
}

/** SSO Setup apis start */
export function fetchSsoSettings() {
  const url = '/api/v1/eevee/fetch/sso/details/';
  return apiClient.get({
    url,
  });
}

export function requestSsoSetup() {
  const url = '/api/v1/eevee/request/sso/';
  return apiClient.post({
    url,
  });
}

export function testSsoSetup({ payload } = {}) {
  const url = '/api/v1/eevee/test/sso/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function validateSsoIdToken({ payload } = {}) {
  const url = '/api/v1/eevee/test/sso/status/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function enableOrDisableSso({ payload } = {}) {
  const url = '/api/v1/eevee/update/sso/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function deleteSsoSetup() {
  const url = '/api/v1/eevee/update/sso/';
  return apiClient.delete({
    url,
  });
}
/** SSO Setup apis end */

export function getSsoProvider({ payload } = {}) {
  const url = '/api/v1/eevee/validate/sso/status/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function enableSingleMFA({ payload } = {}) {
  const url = '/api/v1/eevee/enable/mfa/single/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function resetMFARecovery({ payload } = {}) {
  const url = '/api/v1/eevee/reset/mfa/recovery/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function resetMFARecoveryFromAuth({ payload } = {}) {
  const url = '/api/v1/eevee/reset/mfa/recovery/single/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function resetRequest({ payload } = {}) {
  const url = '/api/v1/eevee/reset/mfa/request/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function resetRequestFromAuth({ payload } = {}) {
  const url = '/api/v1/eevee/reset/mfa/request/single/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function resetMfaOfUser({ payload } = {}) {
  const url = '/api/v1/eevee/reset/mfa/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function downloadFolderDocs(payload) {
  const url = '/api/v1/mew/folders/download/';
  const { type } = payload;
  return apiClient.postJSON({
    url,
    payload,
    queryParams: {
      type: type,
    },
  });
}

export function switchAccountMode(payload) {
  const url = '/api/v1/eevee/mode/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function sendTokenOnReviewUrl({ payload }) {
  const url = '/api/v1/eevee/config/review_url_token/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function switchUser(payload) {
  const url = '/api/v1/eevee/ui/mode/';
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function savePubnubLogs(payload) {
  const url = '/api/v1/eevee/logs/pubsub/';

  return apiClient.postJSON({
    url,
    payload,
  });
}
