import mixpanel from 'mixpanel-browser';

const {
  REACT_APP_MIXPANEL_TOKEN_TESTING,
  REACT_APP_MIXPANEL_TOKEN_PRODUCTION,
} = process.env;
export const MIXPANEL_EVENTS = {
  // Signup flow events
  signup_start: 'signup_start',
  signup_step_1: 'signup_step_1',
  signup_step_2: 'signup_step_2',
  signup_step_3: 'signup_step_3',
  signup_step_4: 'signup_step_4',
  signup_step_5: 'signup_step_5',
  signup_step_back: 'signup_step_back',
  signup_failed: 'signup_failed',
  signup_step1_failed: 'signup_step1_failed',
  signup_step1_failed_public_email: 'signup_step1_failed_public_email',
  signup_complete: 'signup_complete',
  demo_call_complete: 'demo_call_complete',
  demo_call_cancel: 'demo_call_cancel',
  start_tour_nav: 'start_tour_nav',
  login_email: 'login_email',

  // Login
  login_start: 'login_start',
  login_complete: 'login_complete',
  login_failed: 'login_failed',

  //switch_to_versions
  switch_to_old_version: 'switch_to_old_version',

  // social signon
  social_signon_email_link_complete: 'social_signon_link_complete',
  social_signon_email_link_failed: 'social_signon_link_failed',

  app_landing: 'app_landing', // Called every time a page is reloaded, in Shell component

  // Document type events
  document_type: 'document_type',
  edit_document_type: 'edit_document_type',
  edit_field: 'edit_field',
  save_close_field: 'save_close_field',
  close_edit_field: 'close_edit_field',
  watch_tutorial: 'watch_tutorial',
  upload_document_type: 'upload_document_type',
  review_document_type: 'review_document_type',
  approve_document: 'approve_document',
  approve_error_document: 'approve_error_document',
  play_video: 'play_video',
  email_document_type: 'email_document_type',
  settings_document_type: 'settings_document_type',

  // Document Type Setting events
  doc_setting_update: 'doc_setting_update',

  // My Documents events
  my_documents: 'my_documents',
  view_document: 'view_document',
  assign_mydoc: 'assign_mydoc',
  start_review_doc: 'start_review_doc',
  rerun_validation: 'rerun_validation',
  close_review: 'close_review',
  prev_page: 'prev_page',
  next_page: 'next_page',
  delete_mydoc: 'delete_mydoc',
  delete_doc: 'delete_doc',
  view_documents_doc_processing: 'view_documents_doc_processing',
  documents_tab_click_review: 'documents_tab_click_review',
  documents_tab_click_skipped: 'documents_tab_click_skipped',
  documents_tab_click_processed: 'documents_tab_click_processed',
  documents_tab_click_all: 'documents_tab_click_all',
  documents_tab_click_processed_filter_error:
    'documents_tab_click_processed_filter_error',
  documents_tab_click_processed_download:
    'documents_tab_click_processed_download',
  persist_selection_download_json: 'persist_selection_download_json',
  persist_selection_download_csv: 'persist_selection_download_csv',
  persist_selection_assign: 'persist_selection_assign',
  persist_selection_change_doctype: 'persist_selection_change_doctype',
  persist_selection_delete: 'persist_selection_delete',
  persist_selection_move: 'persist_selection_move',
  persist_selection_retry: 'persist_selection_retry',
  persist_selection_rename: 'persist_selection_rename',
  persist_selection_clearall: 'persist_selection_clearall',
  persist_selection_selection_tag: 'persist_selection_selection_tag',
  documents_search: 'documents_search',

  // Models & training events
  view_model_training: 'view_model_training',
  add_new_model: 'add_new_model',
  train_model: 'train_model',
  cancel_model: 'cancel_model',
  compare_model: 'compare_model',

  // AI Model Hub
  view_ai_model_hub: 'view_ai_model_hub',
  use_doc_type: 'use_doc_type',
  select_filter_tag: 'select_filter_tag',

  click_api: 'click_api',
  contact_sales_start: 'contact_sales_start',
  contact_sales_complete: 'contact_sales_complete',
  contact_sales_close: 'contact_sales_close',
  open_auto_classify_modal: 'open_auto_classify_modal',
  setup_auto_classify: 'setup_auto_classify',
  train_auto_classify: 'train_auto_classify',

  // Spreadsheet view
  view_original_file: 'view_original_file',
  open_new_window: 'open_new_window',
  split_view: 'split_view',
  toggle_split_view: 'toggle_split_view',
  confirm_delete_doc: 'confirm_delete_doc',
  close_delete_doc: 'confirm_delete_doc',
  copy_shareable_link_client: 'copy_shareable_link_client',
  copy_shareable_link: 'copy_shareable_link',
  force_approve_document: 'force_approve_document',
  save_file: 'save_file',
  toggle_sidebar: 'toggle_sidebar',

  // Review screen
  view_doc_review: 'view_doc_review', // This is for when user reaches review screen (document or excel)
  table_edit_grid_btn: 'table_edit_grid_btn',
  draw_boxes: 'draw_boxes',
  column_mapper_click: 'column_mapper_click',

  // Document download
  document_download: 'document_download',

  //manual_classification_screen
  click_manual_review: 'click_manual_review',
  delete_manual_doc: 'delete_manual_doc',
  confirm_delete_manual_doc: 'confirm_delete_manual_doc',
  cancel_delete_manual_doc: 'cancel_delete_manual_doc',
  download_manual_doc: 'download_manual_doc',
  dropdown_value_manual_doc: 'dropdown_value_manual_doc',
  close_manual_doc: 'close_manual_doc',
  next_manual_doc: 'next_manual_doc',
  previous_manual_doc: 'previous_manual_doc',
  split_document: 'split_document',
  approve_manual_doc: 'approve_manual_doc',

  //split_screen
  split_edit_title: 'split_edit_title',
  split_edit_title_save: 'split_edit_title_save',
  split_edit_title_discard: 'split_edit_title_discard',
  split_icon_click: 'split_icon_click',
  merge_icon_click: 'merge_icon_click',
  split_dropdown_value: 'split_dropdown_value',
  split_approve: 'split_approve',
  split_delete_part: 'split_delete_part',
  split_restore_part: 'split_restore_part',
  split_screen_close: 'split_screen_close',

  //all activity
  view_all_activity: 'view_all_activity',
  all_activity_document_click: 'all_activity_document_click',
  all_activity_user_click: 'all_activity_user_click',
  all_activity_credit_click: 'all_activity_credit_click',
  all_activity_webhook_click: 'all_activity_webhook_click',
  all_activity_click: 'all_activity_click',
  all_activity_date_filter_select: 'all_activity_date_filter_select',
  all_activity_user_filter_select: 'all_activity_user_filter_select',
  search_value: 'search_value',

  // Security Settings
  security_settings: 'security_settings',
  org_wide_mfa_click: 'org_wide_mfa_click',
  org_wide_mfa_toggle: 'org_wide_mfa_toggle',
  request_sso_access: 'request_sso_access',
  test_sso: 'test_sso',
  test_sso_error: 'test_sso_error',
  enable_sso: 'enable_sso',
  disable_sso: 'disable_sso',

  // Account Settings
  account_mfa_click: 'account_mfa_click',
  account_mfa_toggle: 'account_mfa_toggle',

  // User settings
  reset_user_mfa: 'reset_user_mfa',

  // MFA
  setup_mfa: 'setup_mfa',
  setup_mfa_error: 'setup_mfa_error',
  authorize_mfa: 'authorize_mfa',
  authorize_mfa_error: 'authorize_mfa_error',
  reset_mfa_click: 'reset_mfa_click',
  reset_mfa: 'reset_mfa',
  reset_mfa_error: 'reset_mfa_error',
  request_mfa_reset: 'request_mfa_reset',

  // table tagging
  view_line_item: 'view_line_item',
  add_grid: 'add_grid',
  draw_grid: 'draw_grid',
  edit_grid: 'edit_grid',
  drag_grid: 'drag_grid',
  resize_grid: 'resize_grid',
  copy_grid: 'copy_grid',
  paste_grid: 'paste_grid',
  remove_grid: 'remove_grid',
  remove_all_grid: 'remove_all_grid',
  copy_columns_to_all_grids: 'copy_columns_to_all_grids',
  extract_similar_tables: 'extract_similar_tables',
  resize_line_item_footer: 'resize_line_item_footer',
  table_up_down_btns: 'table_up_down_btns',
  add_line_btn: 'add_line_btn',
  add_header_btn: 'add_header_btn',
  delete_column_btn: 'delete_column_btn',
  delete_row_btn: 'delete_row_btn',
  close_bbox: 'close_bbox',
  tick_bbox: 'tick_bbox',
  table_click_cell: 'table_click_cell',
  delete_column: 'delete_column',
  click_line_item: 'click_line_item',
  table_align_btn_click: 'table_align_btn_click',
  table_wrap_btn_click: 'table_wrap_btn_click',
  show_hide_btn_click: 'show_hide_btn_click',

  // TODO New Eventa for Table Grids Revamp
  delete_all_rows: 'delete_all_rows',
  canvas_aws_cell: 'canvas_aws_cell',
  grid_navigation_table: 'grid_navigation_table',
  grid_navigation_sidebar: 'grid_navigation_sidebar',
  gridmap_column_name: 'gridmap_column_name',
  reviewscreen_close_backbtn: 'reviewscreen_close_backbtn',
  sidebar_tab_extraction_btn: 'sidebar_tab_extraction_btn',
  copycolumns_allgrids_editgridbtn: 'copycolumns_allgrids_editgridbtn',
  extractsimilar_editgridbtn: 'extractsimilar_editgridbtn',
  helpsection_keyboardshortcut: 'helpsection_keyboardshortcut',
  gridedit_makeactive: 'gridedit_makeactive',

  // Integration settings
  view_api_key: 'view_api_key',
  refresh_api_key: 'refresh_api_key',
  edit_webhook_url: 'edit_webhook_url',
  webhook_notification_update: 'webhook_notification_update',
  send_token: 'send_token',

  //train and test
  switch_mode: 'switch_mode',
  pull_doc_type_click: 'pull_doc_type_click',
  pull_doc_type_complete: 'pull_doc_type_complete',
  create_new_doc_type: 'create_new_doc_type',
  push_doc_type_click: 'push_doc_type_click',
  push_doc_type_complete: 'push_doc_type_complete',

  // onboarding flow events
  upload_processing: 'upload_processing',
  upload_review: 'upload_review',
  start_review_tour: 'start_review_tour', // When user starts review of review doc screen
  review_screen_phase_1: 'review_screen_phase_1',
  review_screen_phase_2: 'review_screen_phase_2',
  review_screen_phase_3_noGrids: 'review_screen_phase_3_noGrids',
  review_screen_phase__tableGrid: 'review_screen_phase__tableGrid',
  review_screen_phase_4: 'review_screen_phase_4',
  review_screen_phase_5: 'review_screen_phase_5',
  review_screen_phase_6: 'review_screen_phase_6',
  spreadsheet_review_phase_1: 'spreadsheet_review_phase_1',
  spreadsheet_review_phase_2: 'spreadsheet_review_phase_2',
  edit_fields_phase_1: 'edit_fields_phase_1',

  // Add document type
  add_doc_type: 'add_doc_type',
  select_doc_type: 'select_doc_type',
  proceed_with_sample: 'proceed_with_sample',

  //CHAT AI EVENTS
  view_chat_ai: 'view_chat_ai',
  accept_policy_chat_ai: 'accept_policy_chat_ai',
  cancel_policy_chat_ai: 'cancel_policy_chat_ai',
  ask_question_chat_ai: 'ask_question_chat_ai',
  error_response_chat_ai: 'error_response_chat_ai',
  request_access_chat_ai: 'request_access_chat_ai',
  copy_response_chat_ai: 'copy_response_chat_ai',
  page_reference_chat_ai: 'page_reference_chat_ai',

  // Doc sucessful upload
  doc_upload_success_sidebar: 'doc_upload_success_sidebar',
  doc_upload_success_doctype: 'doc_upload_success_doctype',
  doc_upload_success_add_btn: 'doc_upload_success_add_btn',

  // Header & SideNav
  whatsnew_click: 'whatsnew_click',
  help_section_click: 'help_section_click',

  //Edit Fields Screen
  kebab_menu_click: 'kebab_menu_click',
  datatype_dropdown_click: 'datatype_dropdown_click',
  datatype_dropdown_value_click: 'datatype_dropdown_value_click',
  kebab_menu_settings_click: 'kebab_menu_settings_click',
  edit_field_from_review: 'edit_field_from_review',
  sort_and_drag_field: 'sort_and_drag_field',
  section_field_collapse: 'section_field_collapse',
  show_fields: 'show_fields',
  hide_fields: 'hide_fields',
  add_fields: 'add_fields',
  delete_section: 'delete_section',
  editfield_sidebar_cancel_button: 'editfield_sidebar_cancel_button',
  keyboard_help_floating_button: 'keyboard_help_floating_button',
  section_field_expand: 'section_field_expand',
  custom_doctype: 'custom_doctype',
  custom_doctype_setupfields: 'custom_doctype_setupfields',
  custom_doctype_applychanges: 'custom_doctype_applychanges',
  creditutilization_notifyadmin: 'creditutilization_notifyadmin',
  creditutilization_requestcredits: 'creditutilization_requestcredits',
  creditutilization_contactsales: 'creditutilization_contactsales',
  creditutilization_requestcredits_userdropdown:
    'creditutilization_requestcredits_userdropdown',
  creditutilization_requestcredits_accountsettings:
    'creditutilization_requestcredits_accountsettings',
  testprod_clicked: 'testprod_clicked',
  testprod_confirm: 'testprod_confirm',
  testprod_viewchanges: 'testprod_viewchanges',
  testprod_createnew: 'testprod_createnew',
  testprod_replace: 'testprod_replace',
};

export function mixpanelInit() {
  // eslint-disable-next-line compat/compat
  const parsedUrl = new URL(window.location.href);
  const client = parsedUrl.searchParams.get('client');
  const URLToken = parsedUrl.searchParams.get('token');
  const sharedLink = client || URLToken;
  const { hostname } = global.window.location;
  const mixpanelDebug = localStorage.getItem('mixpanelDebug');

  // Disable debugging for Production
  const isDebugEnabled =
    hostname === 'app.docsumo.com' || !mixpanelDebug ? false : true;

  const token =
    hostname === 'app.docsumo.com'
      ? REACT_APP_MIXPANEL_TOKEN_PRODUCTION
      : REACT_APP_MIXPANEL_TOKEN_TESTING;
  // Initialize mixpanel
  mixpanel.init(token, {
    debug: isDebugEnabled,
  });

  if (window.self !== window.top || sharedLink) {
    mixpanel.disable();
  }
}
