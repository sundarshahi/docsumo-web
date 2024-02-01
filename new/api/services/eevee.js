import apiClient from 'new/api/apiClient';
import { endpoints } from 'new/api/endpoints';
import * as documentConstants from 'new/constants/document';

const eevee = endpoints.eevee;

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
  otherDocs,
  noOfFile,
  referrer,
  utm_source,
  utm_channel,
  utm_campaign,
  utm_term,
  google_account_id,
  type,
  idToken,
  providerId,
  utm_medium,
  firstPageSeen,
  lastPageSeen,
  originalSource,
  utm_content,
}) {
  const url = eevee.signupUser;

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
      // document_type: documentType,
      selected_document_types: documentType,
      other_documents: otherDocs,
      no_of_file: noOfFile,
      approved_terms: approvedTerms,
      ref: referrer,
      id_token: idToken || '',
      idp: providerId || '',
      google_account_id,
      utm_source,
      utm_channel,
      utm_campaign,
      utm_term,
      utm_medium,
      firstPageSeen,
      lastPageSeen,
      originalSource,
      utm_content,
    },
    queryParams: {
      type,
    },
  });
}

export function validateSignupUser({ email, type, idToken, ...params }) {
  const url = eevee.validateSignupUser;
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

export function verifyHubspotSignup({ email }) {
  const url = eevee.verifyHubspotSignup;
  return apiClient.postJSON({
    url,
    payload: {
      email,
    },
  });
}

export function getDocumentTypesList() {
  const url = eevee.documentTypesList;

  return apiClient.get({ url });
}

export function loginAppUser({ email, mfa_code = '', ...params }) {
  const url = eevee.loginAppUser;
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
  const url = eevee.logoutUser;
  return apiClient.post({
    url,
  });
}

export function getUser() {
  const url = eevee.getUser;
  return apiClient.get({
    url,
  });
}

export function addMember({ payload }) {
  const url = eevee.addMember;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function getMembers({ queryParams }) {
  const url = eevee.getMembers;
  return apiClient.get({
    url,
    queryParams,
  });
}

export function editMember({ payload }) {
  const url = eevee.editMember;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function deleteMember({ payload }) {
  const url = eevee.deleteMember;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function sendFeedback({ payload }) {
  const url = eevee.sendFeedback;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function getConfig() {
  const url = eevee.getConfig;
  return apiClient.get({
    url,
  });
}

export function getDocTypeConfig() {
  const url = eevee.getDocTypeConfig;
  return apiClient.get({
    url,
  });
}

export function updateConfigFlags({ payload } = {}) {
  const url = eevee.updateConfigFlags;
  return apiClient.patchJSON({
    url,
    payload,
  });
}

export function updateUserSettings({ payload } = {}) {
  const url = eevee.updateUserSettings;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function forgetUserPassword({ email }) {
  const url = eevee.forgetUserPassword;
  return apiClient.postJSON({
    url,
    payload: {
      email,
    },
  });
}

export function validateToken({ token }) {
  const url = eevee.validateToken;
  return apiClient.postJSON({
    url,
    payload: {
      token,
    },
  });
}

export function resetUserPassword({ password, token }) {
  const url = eevee.resetUserPassword;
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
  const url = eevee.changeUserPassword;
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
  const url = eevee.updateDocumentDeleteAfter;
  return apiClient.postJSON({
    url,
    payload: {
      del_doc_after: delDocAfter,
    },
  });
}

export function setTempTokenDuration({ tempTokenDuration }) {
  const url = eevee.setTempTokenDuration;
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
  const url = eevee.updateStraightThroughProcessingFlags;
  return apiClient.patchJSON({
    url,
    payload: {
      straight_through_processing: straightThroughProcessing,
    },
  });
}

export function updateUserSettingsWebhookUrl({ payload } = {}) {
  const url = eevee.updateUserSettingsWebhookUrl;
  return apiClient.postJSON({
    url,
    payload: {
      webhook_url: payload,
    },
  });
}

export function refreshUserDocsumoApiKey() {
  const url = eevee.refreshUserDocsumoApiKey;
  return apiClient.post({
    url,
  });
}

export function getDocumentCounts({ queryParams } = {}) {
  const url = eevee.getDocumentCounts;
  return apiClient.get({
    url,
    queryParams,
  });
}

export function getDocuments({ queryParams } = {}) {
  const url = eevee.getDocuments;
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
  const url = eevee.downloadProcessedDocuments;
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

export function downloadDocumentByFormat(payload) {
  const url = eevee.downloadDocumentByFormat;
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
  const url = eevee.uploadDocument;
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

export function deleteDocument({ docId }) {
  const url = eevee.deleteDocument.replace('{docId}', docId);
  return apiClient.delete({
    url,
  });
}

export function viewUserDocsumoApiKey() {
  const url = eevee.viewUserDocsumoApiKey;
  return apiClient.get({
    url,
  });
}

export function getWebhookData() {
  const url = eevee.getWebhookData;
  return apiClient.get({
    url,
  });
}

export function previewOriginalDocument({ docId = '' }) {
  const url = eevee.previewOriginalDocument.replace('{docId}', docId);
  return apiClient.get({
    url,
  });
}

export function validateLogin({ type, payload } = {}) {
  const url = eevee.validateLogin;
  return apiClient.postJSON({
    url,
    payload,
    queryParams: {
      type,
    },
  });
}

export function linkAccountWithSocial({ payload }) {
  const url = eevee.linkAccountWithSocial;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function setupMFAFlow({ scope } = {}) {
  const url = eevee.setupMFAFlow;
  return apiClient.get({
    url,
    queryParams: {
      scope,
    },
  });
}

export function enableMFA({ scope, payload } = {}) {
  const url = eevee.enableMFA;
  return apiClient.postJSON({
    url,
    payload,
    queryParams: {
      scope,
    },
  });
}

export function disableMFA({ scope, payload } = {}) {
  const url = eevee.disableMFA;
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
  const url = eevee.fetchSsoSettings;
  return apiClient.get({
    url,
  });
}

export function requestSsoSetup() {
  const url = eevee.requestSsoSetup;
  return apiClient.post({
    url,
  });
}

export function testSsoSetup({ payload } = {}) {
  const url = eevee.testSsoSetup;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function validateSsoIdToken({ payload } = {}) {
  const url = eevee.validateSsoIdToken;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function enableOrDisableSso({ payload } = {}) {
  const url = eevee.enableOrDisableSso;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function deleteSsoSetup() {
  const url = eevee.deleteSsoSetup;
  return apiClient.delete({
    url,
  });
}
/** SSO Setup apis end */

export function getSsoProvider({ payload } = {}) {
  const url = eevee.getSsoProvider;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function enableSingleMFA({ payload } = {}) {
  const url = eevee.enableSingleMFA;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function resetMFARecovery({ payload } = {}) {
  const url = eevee.resetMFARecovery;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function resetMFARecoveryFromAuth({ payload } = {}) {
  const url = eevee.resetMFARecoveryFromAuth;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function resetRequest({ payload } = {}) {
  const url = eevee.resetRequest;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function resetRequestFromAuth({ payload } = {}) {
  const url = eevee.resetRequestFromAuth;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function resetMfaOfUser({ payload } = {}) {
  const url = eevee.resetMfaOfUser;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function switchAccountMode(payload) {
  const url = eevee.switchAccountMode;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function sendTokenOnReviewUrl({ payload }) {
  const url = eevee.sendTokenOnReviewUrl;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function switchUser(payload) {
  const url = eevee.switchUser;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function moveFiles(payload) {
  const url = eevee.moveFiles;
  return apiClient.postJSON({
    url,
    payload,
  });
}

export function savePubnubLogs(payload) {
  const url = eevee.pubnubLogs;

  return apiClient.postJSON({
    url,
    payload,
  });
}

export function requestDocumentTypeAccess(payload) {
  const url = eevee.requestDocTypeAccess;

  return apiClient.postJSON({
    url,
    payload,
  });
}

export function hubSpotToken() {
  const url = eevee.hubspotIdentificationToken;

  return apiClient.get({
    url,
  });
}
