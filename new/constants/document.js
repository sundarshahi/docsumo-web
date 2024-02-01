import { camelCase } from 'new/utils';

const STATUSES = {
  NEW: 'new',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  REVIEW_REQUIRED: 'review_required',
  REVIEWING: 'reviewing',
  REVIEW_SKIPPED: 'review_skipped',
  ERRED: 'erred',
  DELETED: 'deleted',
  ERROR: 'error',
};

const STATUSES_CAMELIZED = camelCase(STATUSES);

const ACTIONS = {
  VIEW: 'view',
  REVIEW: 'review',
  DELETE: 'delete',
  EDIT_FIELDS: 'editFields',
  UPLOAD: 'upload',
  DUPLICATE: 'duplicate',
  DOWNLOAD: 'download',
  EDIT: 'edit',
  MAIL: 'mail',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  MORE_SETTINGS: 'more-settings',
  PUSH_TO_PRODUCTION: 'push_to_production',
};

const SORT_KEYS = {
  CREATED_DATE: 'created_date',
  MODIFIED_DATE: 'modified_date',
};

const FIELD_TYPES = {
  NUMBER: 'number',
  PERCENT: 'percent',
  DATE: 'date',
  STRING: 'string',
  LINE_ITEM: 'line_item',
};

const REGION_PADDING_BOX = {
  WIDTH: 8,
  HEIGHT: 8,
  LEFT: 4,
  TOP: 4,
};

const DOC_PADDING = 8;

const ROOT_FOLDER_ID = '';

export const DOCUMENT_ZOOM_VALUE = { BASE: 94, MIN: 20, MAX: 160 };

export const FIELD_CONFIDENCE = { HIGH: 'high', LOW: 'low', ERROR: 'error' };

export {
  ACTIONS,
  DOC_PADDING,
  FIELD_TYPES,
  REGION_PADDING_BOX,
  ROOT_FOLDER_ID,
  SORT_KEYS,
  STATUSES,
  STATUSES_CAMELIZED,
};
