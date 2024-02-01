export const TABLE_TRACKING_KEYS = {
  tableGrid: 'table_grid',
  tableRow: 'table_row',
  tableColumn: 'table_column',
  tableHeader: 'table_header',
  tableLineItem: 'table_rowitem',
  tableExtractedData: 'table_extracted_data',
  dummyEvent: 'table_edit_start',
};

export const TRACKING_TYPE = {
  tableTracking: 'table_tracking',
  fieldTracking: 'field_tracking',
};

export const TRACKING_HELPER_KEYS = {
  added: 'added',
  deleted: 'deleted',
  updated: 'updated',
  resized: 'resized',
  timeTaken: 'timeTaken',
  lineItem: 'line_item',
  idleTime: 'idle_time',
  clicked: 'clicked',
};

export const FIELD_TRACKING_KEYS = {
  fieldValue: 'field_value',
};

const {
  tableGrid,
  tableRow,
  tableColumn,
  tableHeader,
  tableLineItem,
  tableExtractedData,
} = TABLE_TRACKING_KEYS;

export const VALID_TABLE_KEYS = [
  tableGrid,
  tableRow,
  tableColumn,
  tableHeader,
  tableLineItem,
  tableExtractedData,
];

const { fieldValue } = FIELD_TRACKING_KEYS;

export const VALID_FIELD_KEY = [fieldValue, tableLineItem];

export const GRID_RELATED_KEYS = [
  tableGrid,
  tableRow,
  tableColumn,
  tableHeader,
];

export const EXTRACTED_TABLE_RELATED_KEYS = [tableLineItem, tableExtractedData];

export const SALES_ORIGIN_KEYS = {
  userDropdown: 'User Dropdown',
  salesCard: 'salesCard',
  creditUtilizationNotification: 'Credit Utilization Notification',
  banner: 'banner',
  requestSsoAccess: 'Request SSO Access',
  userSettings: 'User Settings',
};
