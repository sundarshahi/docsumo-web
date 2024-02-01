const constants = {
  // ID constants for 'document types' related screens.
  TT_DOC_TYPE_EDIT_DOC_ITEM: 'tt-doc_type-edit_doc_item',
  TT_DOC_TYPE_UPLOAD_DOC_ITEM: 'tt-doc_type-upload_doc_item',
  TT_DOC_TYPE_MAIL_UPLOAD_DOC_ITEM: 'tt-doc_type-mail_upload_doc_item',
  TT_DOC_TYPE_REVIEW_DOC_ITEM: 'tt-doc_type-review_doc_item',
  TT_DOC_TYPE_CREATE_DOC_ITEM: 'tt-doc_type-create_doc_item',

  // ID constants for 'all documents' related screens.
  TT_ALL_DOC_REVIEWING_ALL: 'tt-start_reviewing_all_doc',

  // ID constants for 'approved documents' realted screens.
  TT_APPROVED_DOWNLOAD_ALL: 'tt-approved_download_all_doc',

  // ID constants for 'edit document field' related screens.
  TT_EDIT_FIELD_KEY_LABLE_VALUE: 'tt_edit_field-key_lable_value',
  TT_EDIT_FIELD_LINE_ITEM_SECTION: 'tt_edit_field-line_item_section',
  TT_EDIT_FIELD_ADD_LINE_ITEM: 'tt_edit_field-add-line-item',
  TT_EDIT_FIELD_ADD_COLUMN_LINE_ITEM: 'tt_edit_field-add_column_line_item',
  TT_EDIT_FIELD_SAVE_CLOSE_BTN: 'tt_edit_field-save_close_btn',

  // ID constants for 'Review' related scrrens.
  TT_REVIEW_SCRREN_LABLE_VALUE: 'tt_review_screen-lable_value',
  TT_REVIEW_SCRREN_LINE_ITEM_SECTION: 'tt_review_screen-line_item_section',
  TT_REVIEW_SCRREN_LINE_ITEM_GRID_BUTTON:
    'tt_review_screen-line_item-grid_button',
  TT_REVIEW_SCRREN_GRID_STRETCHING: 'tt_review_screen-line_grid-stretching',
  TT_REVIEW_SCRREN_GRID_ADD_COLUMN: 'tt_review_screen-line_grid-add_column',
  TT_REVIEW_SCRREN_GRID_ADD_ROW: 'tt_review_screen-line_grid-add_row',
  TT_REVIEW_SCRREN_GRID_IGNORE_ROW_DATA:
    'tt_review_screen-line_grid-ignore_row_data',
  TT_REVIEW_SCRREN_GRID_HEADER_OF_COLUMN:
    'tt_review_screen-line_grid-header_of_column',
  TT_REVIEW_SCRREN_GRID_EXTRACT_DATA: 'tt_review_screen-line_grid-extract_data',
  TT_REVIEW_SCRREN_GRID_APPROVE_DOC: 'tt_review_screen-line_approve-doc',
  TT_REVIEW_SCRREN_DOWNLOAD_FORMAT: 'tt_review_screen_download_format',
  TT_REVIEW_SCRREN_AUTO_EXTRACT_TABLE: 'tt_review_screen-auto_extract_table',

  // ID constants for 'Global' app related elements
  TT_HEADER_INFO_ICON: 'tt-header-info-icon',

  // ID constants for 'Settings' related screens.
  TT_SETTINGS_UPLOAD_API_KEY: 'tt-settings-upload-api-key',
};

const routes = {
  ROOT: '/',
  ALL_DOCS: '/all',
  REVIEW: '/review/',
  SKIPPED: '/skipped/',
  PROCESSED: '/processed/',
  REVIEW_DOCUMENT: '/review-document/',
  EDIT_FIELD: '/edit-fields/',
  SETTINGS: '/settings/',
};

export const tooltipFlow = [
  {
    sequence: 1,
    title: 'Upload Document',
    childrens: [
      {
        id: constants.TT_DOC_TYPE_UPLOAD_DOC_ITEM,
        sequence: 1,
        description: 'Upload your document as per type of document.',
        route: routes.ROOT,
        position: 'left',
        img: null,
      },
      {
        id: constants.TT_DOC_TYPE_MAIL_UPLOAD_DOC_ITEM,
        sequence: 2,
        description:
          'Upload your document through mail as per type of document.',
        route: routes.ROOT,
        position: 'left',
        img: null,
      },
      {
        id: constants.TT_SETTINGS_UPLOAD_API_KEY,
        sequence: 3,
        description: 'Upload your document through provided api key.',
        route: routes.SETTINGS,
        position: 'left',
        img: null,
      },
    ],
  },
  {
    sequence: 2,
    title: 'Edit Document Fields',
    childrens: [
      {
        id: constants.TT_DOC_TYPE_EDIT_DOC_ITEM,
        sequence: 1,
        description:
          'Edit any predefined document type as per your requirement.',
        route: routes.ROOT,
        position: 'left',
      },
      {
        id: constants.TT_EDIT_FIELD_KEY_LABLE_VALUE,
        description:
          'Edit any fields key or value by input or selecting region from document.',
        route: routes.EDIT_FIELD,
        position: 'right',
        sequence: 2,
        img: null,
      },
      {
        id: constants.TT_EDIT_FIELD_ADD_LINE_ITEM,
        description:
          'Create new field for this document in any particular section.',
        position: 'right',
        sequence: 3,
        route: routes.EDIT_FIELD,
      },
      {
        id: constants.TT_EDIT_FIELD_LINE_ITEM_SECTION,
        sequence: 4,
        description: 'Modify table column and rows values.',
        route: routes.EDIT_FIELD,
        position: 'right',
      },
      {
        id: constants.TT_EDIT_FIELD_ADD_COLUMN_LINE_ITEM,
        sequence: 5,
        description: 'Add new column to table.',
        route: routes.EDIT_FIELD,
        position: 'top',
      },
      {
        id: constants.TT_EDIT_FIELD_SAVE_CLOSE_BTN,
        sequence: 6,
        description: 'Save you changes and exit from edit field screen.',
        route: routes.EDIT_FIELD,
        position: 'top',
      },
    ],
  },
  {
    title: 'Review Document',
    sequence: 3,
    childrens: [
      {
        id: constants.TT_ALL_DOC_REVIEWING_ALL,
        sequence: 1,
        description:
          'Start review all document at once, click here and get all document reviewed.',
        route: routes.ALL_DOCS,
        position: 'left',
      },
      {
        id: constants.TT_REVIEW_SCRREN_LABLE_VALUE,
        sequence: 2,
        description:
          'Edit any fields value by input or selecting region from document.',
        route: routes.REVIEW_DOCUMENT,
        position: 'right',
      },
      {
        id: constants.TT_REVIEW_SCRREN_LINE_ITEM_SECTION,
        sequence: 3,
        description:
          'Review table of document, by using of auto fetching table grid functionality',
        route: routes.REVIEW_DOCUMENT,
        position: 'right',
      },
      {
        id: constants.TT_REVIEW_SCRREN_LINE_ITEM_GRID_BUTTON,
        sequence: 4,
        description: 'Extract table data by fetching table grid.',
        route: routes.REVIEW_DOCUMENT,
        position: 'top',
      },
      {
        id: constants.TT_REVIEW_SCRREN_GRID_STRETCHING,
        sequence: 5,
        description: 'Stretch your grid as per table of document.',
        route: routes.REVIEW_DOCUMENT,
        position: undefined,
      },
      {
        id: constants.TT_REVIEW_SCRREN_GRID_ADD_COLUMN,
        sequence: 6,
        description: 'Add new columns by cilck on this selector.',
        route: routes.REVIEW_DOCUMENT,
        position: 'top',
      },
      {
        id: constants.TT_REVIEW_SCRREN_GRID_ADD_ROW,
        sequence: 7,
        description: 'Add new rows by cilck on this selector.',
        route: routes.REVIEW_DOCUMENT,
        position: 'left',
      },
      {
        id: constants.TT_REVIEW_SCRREN_GRID_IGNORE_ROW_DATA,
        sequence: 8,
        description:
          'Hover over row and Ignore any row data while extracting out from grid.',
        route: routes.REVIEW_DOCUMENT,
        position: 'bottom',
      },
      {
        id: constants.TT_REVIEW_SCRREN_GRID_HEADER_OF_COLUMN,
        sequence: 9,
        description: 'Assign any header to particular column.',
        route: routes.REVIEW_DOCUMENT,
        position: 'top',
      },
      {
        id: constants.TT_REVIEW_SCRREN_GRID_EXTRACT_DATA,
        sequence: 10,
        description: 'Extract grid data from table.',
        route: routes.REVIEW_DOCUMENT,
        position: 'top',
      },
      {
        id: constants.TT_REVIEW_SCRREN_GRID_APPROVE_DOC,
        sequence: 11,
        description:
          'When you approve it trains the system to extract data how it was extracted previously',
        route: routes.REVIEW_DOCUMENT,
        position: 'right',
      },
    ],
  },
  {
    title: 'Download Document',
    sequence: 4,
    childrens: [
      {
        id: constants.TT_APPROVED_DOWNLOAD_ALL,
        sequence: 1,
        description: 'Download all processed document with your desire format.',
        route: routes.PROCESSED,
        position: 'left',
      },
    ],
  },
  {
    title: 'Create Document Type',
    sequence: 5,
    childrens: [
      {
        id: constants.TT_DOC_TYPE_CREATE_DOC_ITEM,
        sequence: 1,
        description: 'Create your own document type.',
        route: routes.ROOT,
        position: null,
        img: null,
      },
    ],
  },
  {
    title: 'Get Help',
    sequence: 6,
    childrens: [
      {
        id: constants.TT_HEADER_INFO_ICON,
        sequence: 1,
        description:
          'If you ever need help, this is where to go for tutorials.',
        route: [
          routes.ROOT,
          routes.ALL_DOCS,
          routes.REVIEW,
          routes.SKIPPED,
          routes.SETTINGS,
          routes.PROCESSED,
        ],
        position: 'bottom',
      },
    ],
  },
  /* {
        id: constants.TT_DOC_TYPE_UPLOAD_DOC_ITEM,
        sequence: 0,
        description: 'Upload your document as per type of document.',
        route: routes.ROOT,
        title: 'Upload Document',
        position: 'left',
        img: null
    },
    {
        id: constants.TT_DOC_TYPE_CREATE_DOC_ITEM,
        sequence: 1,
        description: null,
        route: routes.ROOT,
        title: 'Create Document Type',
        position: null,
        img: null
    },
    {
        id: constants.TT_DOC_TYPE_EDIT_DOC_ITEM,
        sequence: 2,
        description: 'Edit any predefined document type as per your requirement.',
        route: routes.ROOT,
        title: 'Edit Document',
        position: 'left'
    }, 
    {
        id: constants.TT_EDIT_FIELD_KEY_LABLE_VALUE,
        sequence: 3,
        description: 'Edit any fields key or value by input or selecting region from document.',
        route: routes.EDIT_FIELD,
        title: 'Edit Document Fields',
        position: 'right',
    },
    {
        id: constants.TT_EDIT_FIELD_LINE_ITEM_SECTION,
        sequence: 4,
        description: 'Edit any fields key or value by input or selecting region from document.',
        route: routes.EDIT_FIELD,
        title: 'Edit Document Table',
        position: 'right',
    },
    {
        id: constants.TT_ALL_DOC_REVIEWING_ALL,
        sequence: 4,
        description: 'Start review all document at once, click here and get all document reviewed.',
        route: routes.ALL_DOCS,
        title: 'Review all Document',
        position: 'left'
    },
    {
        id: constants.TT_DOC_TYPE_REVIEW_DOC_ITEM,
        sequence: 5,
        description: 'Review all uploaded and processed documents of individual type.',
        route: routes.ROOT,
        title: 'Start Review Document',
        position: 'left', 
    }, 
    {
        id: constants.TT_REVIEW_SCRREN_LABLE_VALUE,
        sequence: 6,
        description: 'Edit any fields value by input or selecting region from document.',
        route: routes.REVIEW,
        title: 'Update/Review Doc Fields',
        position: 'right',
    },
    {
        id: constants.TT_APPROVED_DOWNLOAD_ALL,
        sequence: 7,
        description: 'Download all processed document with your desire format.',
        route: routes.PROCESSED,
        title: 'Download Document',
        position: 'left'
    },
    {
        id: constants.TT_HEADER_INFO_ICON,
        sequence: 8,
        description: 'If you ever need help, this is where to go for tutorials.',
        route: [routes.ROOT, routes.ALL_DOCS, routes.REVIEW, routes.SKIPPED, routes.SETTINGS, routes.PROCESSED],
        title: 'Get Help',
        position: 'bottom'
    }, */
];

export default constants;
