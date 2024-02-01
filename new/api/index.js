import apiClient from './apiClient';

/**
 * specific to excel file download on spreadsheet review page
 */
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

/**
 * endpoints acc. to types ['eevee', 'mew', 'pik', 'raichu']
 */

export * from './services/eevee';
export * from './services/mew';
export * from './services/pik';
export * from './services/raichu';
export { apiClient };
