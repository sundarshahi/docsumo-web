const STATES = {
  NEW: 'new',
  UPLOADING: 'uploading',
  UPLOAD_FINISHED: 'upload_finished',
  UPLOAD_CANCELLED: 'upload_cancelled',
  ERROR: 'error',
};

const ERRORS = {
  UNSUPPORTED: 'unsupported',
  EXCEEDS_SIZE: 'exceeds_size',
  ZERO_SIZE: 'zero_size',
  READ_ABORTED: 'read_aborted',
  READ_ERRORED: 'read_errored',
  UPLOAD_FAILED: 'upload_failed',
};

const SUPPORTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/tiff',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/wps-office.xlsx',
  'application/x-excel',
  'application/wps-office.xls',
  'application/x-msi',
];
const SUPPORTED_CSV_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'image/png',
  'image/jpeg',
  'image/tiff',
  'application/pdf',
];

const MAXIMUM_FILE_SIZE = 35 * 1024 * 1024; // 35 MB
const MAXIMUM_FILE_SIZE_USBS = 75 * 1024 * 1024; // 75 MB
const MINIMUM_FILE_SIZE = 0;

export {
  ERRORS,
  MAXIMUM_FILE_SIZE,
  MAXIMUM_FILE_SIZE_USBS,
  MINIMUM_FILE_SIZE,
  STATES,
  SUPPORTED_CSV_MIME_TYPES,
  SUPPORTED_MIME_TYPES,
};
