/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import { actions as documentActions } from 'new/redux/documents/actions';
import { showFeedbackForm, storeFolderId } from 'new/redux/helpers';
import * as reduxHelpers from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import {
  Archive,
  Brain,
  Calendar,
  MultiplePages,
  Settings,
  Upload,
  ViewGrid,
} from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { SALES_ORIGIN_KEYS } from 'new/components/contexts/trackingConstants';
import HubspotMeetingPopup from 'new/components/modals/hubspot';
import { ACCOUNT_TYPES } from 'new/constants';
import * as fileConstants from 'new/constants/file';
import { MIXPANEL_ORIGINS } from 'new/constants/mixpanel';
import routes from 'new/constants/routes';
import { getMemberPermissions } from 'new/helpers/permissions';
import * as uploadHelper from 'new/helpers/upload';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { CSSTransition } from 'react-transition-group';

import EmptyNewDropDown from './EmptyNewDropDown';
import NewDropdown from './NewDropdown';

import styles from './navigation.scss';

const SETTINGS_PATHS = [
  routes.ACCOUNT_SETTINGS,
  routes.USER_SETTINGS,
  routes.DATABASE_TABLES,
  routes.INTEGRATION_SETTINGS,
  routes.SECURITY_SETTINGS,
];

class Navigation extends Component {
  static propTypes = {
    isCollapsed: PropTypes.bool.isRequired,
    isNewDropdownVisible: PropTypes.bool.isRequired,
    isUploadButtonVisible: PropTypes.bool,
    history: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    onNewBtnClick: PropTypes.func,
    onNewDropdownOutsideClick: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      showApiServices: true,
      showContactSalesPopup: false,
    };
    this.dropzoneRef = React.createRef();
    this.inputRef = React.createRef();
    this.dropdownRef = React.createRef();
  }

  handleDropFolderAccepted = () => {
    let { files } = this.inputRef.current;
    let fileData = Array.from(files).filter((item) =>
      fileConstants.SUPPORTED_MIME_TYPES.includes(item?.type)
    );
    let folderName =
      files[0].webkitRelativePath && files[0].webkitRelativePath.split('/')[0];
    (async () => {
      const response = await api.createNewFolder({
        payload: {
          folder_name: folderName,
        },
      });
      const createdFolderId = _.get(
        response.responsePayload,
        'data.folderId',
        {}
      );
      storeFolderId({
        folderId: createdFolderId,
      });

      this.props.onNewDropdownOutsideClick();
      this.documentType &&
        uploadHelper.handleFileDrop({
          files: fileData,
          dropAccepted: true,
          documentType: this.documentType,
        });
    })();
  };

  handleDropAccepted = (files) => {
    const { currentDocumentType } = this.state;
    if (this.documentType === null) {
      (this.documentType || currentDocumentType) &&
        uploadHelper.handleFileDrop({
          files: files,
          dropAccepted: true,
          documentType: this.documentType || currentDocumentType,
        });
    } else {
      this.props.onNewDropdownOutsideClick();
      (this.documentType || currentDocumentType) &&
        uploadHelper.handleFileDrop({
          files: files,
          dropAccepted: true,
          documentType: this.documentType || currentDocumentType,
        });
    }
  };

  componentDidMount() {
    const permissions = getMemberPermissions() || {};
    this.setState({
      ...permissions,
    });
  }

  handleCloseCSVUploadOverlay = () => {
    reduxHelpers.closeCSVUploadOverlay();
  };

  handleDropRejected = (files) => {
    this.props.onNewDropdownOutsideClick();
    this.documentType &&
      uploadHelper.handleFileDrop({
        files: files,
        dropAccepted: false,
        documentType: this.documentType,
      });
  };

  handleFileDialogCancel = () => {
    this.documentType = null;
    this.props.onNewDropdownOutsideClick();
  };

  handleUploadFileBtnClick = (documentType) => {
    const {
      user,
      history: {
        location: { pathname },
      },
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;

    // Add mixpanel event
    const originType =
      Object.values(MIXPANEL_ORIGINS).find((i) => i.path === pathname)?.value ||
      '';
    mixpanel.track(MIXPANEL_EVENTS.upload_document_type, {
      'work email': user.email,
      'document type': documentType || '',
      origin: originType ? originType : '',
      location: 'Navigation - New button',
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });

    const selectedDocumentType = {
      ...documentType,
      showUploadMethods: true,
      shouldUploadOnDrop: true,
      label: {
        title: 'Upload document',
        confirmModalTitle: 'Cancel upload?',
        confirmModalBody:
          'This will cancel upload, are you sure you want to do this?',
        save: 'Upload',
      },
    };

    this.props.onNewDropdownOutsideClick();
    this.props.documentActions.displayCreateDocumentTypeModal(true);
    this.props.documentActions.selectDocumentType(selectedDocumentType);
  };

  handleUploadFolderBtnClick = (documentType) => {
    this.documentType = documentType;
    this.inputRef && this.inputRef.current.click();
  };
  closeAnalyticsOnNavigation = () => {
    const store = reduxHelpers.getStore();
    const {
      documents: { analyticsDocument },
    } = store.getState();

    if (analyticsDocument) {
      reduxHelpers.closeAnalytics(analyticsDocument);
    }
  };
  handleNewBtnClick = (e) => {
    this.closeAnalyticsOnNavigation();
    this.handleCloseCSVUploadOverlay();
    this.props.onNewBtnClick(e);
  };

  handleDocumentListPageLinkClick = (e, url, elName, mixpanelEvent) => {
    this.closeAnalyticsOnNavigation();
    e.preventDefault();

    const {
      user,
      history: {
        location: { pathname },
      },
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;

    if (mixpanelEvent) {
      const originType = Object.values(MIXPANEL_ORIGINS).find(
        (i) => i.path === pathname
      );
      // Add mixpanel event
      mixpanel.track(mixpanelEvent, {
        'work email': user.email,
        origin: originType ? originType.value : '',
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    }

    this.props.history.push(url);
  };

  handleSettingsLinkClick = () => {
    this.closeAnalyticsOnNavigation();
  };

  handleServiceLinkClick = () => {
    this.closeAnalyticsOnNavigation();

    const {
      user,
      history: {
        location: { pathname },
      },
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;

    const originType = Object.values(MIXPANEL_ORIGINS).find(
      (i) => i.path === pathname
    );
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.view_ai_model_hub, {
      'work email': user.email,
      origin: originType ? originType.value : '',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  handleModelLinkClick = () => {
    this.closeAnalyticsOnNavigation();
    const {
      user,
      history: {
        location: { pathname },
      },
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;

    const originType = Object.values(MIXPANEL_ORIGINS).find(
      (i) => i.path === pathname
    );
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.view_model_training, {
      'work email': user.email,
      origin: originType ? originType.value : '',
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  handleFeedbackLinkClick = (e) => {
    this.closeAnalyticsOnNavigation();
    e.preventDefault();
    showFeedbackForm();
  };

  handleContactSalesPopupDisplay = () =>
    this.setState({ showContactSalesPopup: false });

  render() {
    const {
      user,
      config,
      isCollapsed,
      isNewDropdownVisible,
      onNewDropdownOutsideClick,
    } = this.props;

    const { showApiServices, showContactSalesPopup } = this.state;

    const documentTypes = config.documentTypes || [];

    const uploadableDocumentTypes = documentTypes.filter((item) =>
      item.isAuthorized !== undefined
        ? item.isAuthorized && item.canUpload
        : item.canUpload
    );

    const { pathname } = this.props.history.location || {};

    const showHubpostPopup = () => {
      this.setState({ showContactSalesPopup: true });
      const { canSwitchToOldMode = true } = config;
      mixpanel.track(MIXPANEL_EVENTS.contact_sales_start, {
        'work email': user.email,
        origin: 'salesCard',
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });
    };

    return (
      <nav
        role='navigation'
        className={cx(styles.root, { [styles.collapsed]: isCollapsed })}
      >
        <Dropzone
          ref={this.dropzoneRef}
          disableClick
          accept={fileConstants.SUPPORTED_MIME_TYPES}
          className={styles.dropzoneClassName}
          activeClassName={styles.dropzoneActiveClassName}
          rejectClassName={styles.dropzoneRejectClassName}
          onDropAccepted={this.handleDropAccepted}
          onDropRejected={this.handleDropRejected}
          onFileDialogCancel={this.handleFileDialogCancel}
        />
        <input
          ref={this.inputRef}
          id='folder-upload-input'
          directory=''
          webkitdirectory=''
          type='file'
          onChange={this.handleDropFolderAccepted}
          style={{ display: 'none' }}
        />
        <CSSTransition
          in={isNewDropdownVisible}
          nodeRef={this.dropdownRef}
          timeout={200}
          classNames={{
            enter: styles['newDropdown--enter'],
            enterActive: styles['newDropdown--enter-active'],
            exit: styles['newDropdown--exit'],
            exitActive: styles['newDropdown--exit-active'],
          }}
          unmountOnExit
        >
          <div ref={this.dropdownRef} className={styles.newDropdown}>
            {uploadableDocumentTypes?.length ? (
              <NewDropdown
                documentTypes={uploadableDocumentTypes}
                uploadEmailAddress={user.uploadEmail}
                onOutsideClick={onNewDropdownOutsideClick} //TODO toggle on clicking upload button
                onUploadFileBtnClick={this.handleUploadFileBtnClick}
                onUploadFolderBtnClick={this.handleUploadFolderBtnClick}
              />
            ) : (
              <EmptyNewDropDown
                onOutsideClick={onNewDropdownOutsideClick}
                origin='Upload - Navigation'
              />
            )}
          </div>
        </CSSTransition>
        <ul>
          <li className={styles.newDoc}>
            <Tooltip
              label='Upload'
              placement='right'
              showTooltip={isCollapsed}
              className={styles.navTooltip}
            >
              <Button
                className={styles.newDocButton}
                onClick={this.handleNewBtnClick}
              >
                <Upload className={styles.uploadIcon} />
                <p className={styles.title}>Upload</p>
              </Button>
            </Tooltip>
          </li>
          <li>
            <Tooltip
              label='Document Types'
              placement='right'
              showTooltip={isCollapsed}
              className={styles.navTooltip}
            >
              <NavLink
                exact
                to={routes.ROOT}
                onClick={(e) =>
                  this.handleDocumentListPageLinkClick(
                    e,
                    routes.ROOT,
                    'all documents',
                    MIXPANEL_EVENTS.document_type
                  )
                }
                className={styles.navItem}
                activeClassName={styles.active}
              >
                <div className={styles.iconWrapper}>
                  <MultiplePages />
                </div>
                <p className={styles.title}>Document Types</p>
              </NavLink>
            </Tooltip>
          </li>

          <li>
            <Tooltip
              label='My Documents'
              placement='right'
              showTooltip={isCollapsed}
              className={styles.navTooltip}
            >
              <NavLink
                exact
                to={routes.ALL}
                onClick={(e) =>
                  this.handleDocumentListPageLinkClick(
                    e,
                    routes.ALL,
                    'all documents',
                    MIXPANEL_EVENTS.my_documents
                  )
                }
                className={cx(styles.navItem, {
                  [styles.active]: [
                    routes.ALL,
                    routes.REVIEW,
                    routes.SKIPPED,
                    routes.PROCESSED,
                  ].includes(pathname),
                })}
              >
                <div className={styles.iconWrapper}>
                  <Archive />
                </div>
                <p className={styles.title}>My Documents</p>
              </NavLink>
            </Tooltip>
          </li>
          {showApiServices ? (
            <li>
              <Tooltip
                label='Models &amp; Training'
                placement='right'
                showTooltip={isCollapsed}
                className={styles.navTooltip}
              >
                <NavLink
                  to={routes.MODEL}
                  className={styles.navItem}
                  activeClassName={styles.active}
                  onClick={this.handleModelLinkClick}
                >
                  <div className={styles.iconWrapper}>
                    <Brain />
                  </div>
                  <p className={styles.title}>Models &amp; Training</p>
                </NavLink>
              </Tooltip>
            </li>
          ) : (
            ''
          )}
        </ul>
        <ul className={styles.bottomNav}>
          {!isCollapsed && config?.accountType === ACCOUNT_TYPES.FREE && (
            <div className={styles.salesCard}>
              <p className={styles.salesCard__title}>Need help?</p>
              <p className={styles.salesCard__subtitle}>
                Contact <span>sales@docsumo.com</span> to learn more or schedule
                demo
              </p>
              <Button
                className={styles.salesCard__demoBtn}
                onClick={showHubpostPopup}
                size='lg'
                icon={<Calendar />}
              >
                {' '}
                Schedule Demo
              </Button>
              <HubspotMeetingPopup
                user={user}
                isOpen={showContactSalesPopup}
                handleClose={() => this.handleContactSalesPopupDisplay()}
                origin={SALES_ORIGIN_KEYS.salesCard}
              />
            </div>
          )}
          {showApiServices ? (
            <li>
              <Tooltip
                label='AI Models Hub'
                placement='right'
                showTooltip={isCollapsed}
                className={styles.navTooltip}
              >
                <NavLink
                  to={routes.MODELHUB}
                  className={styles.navItem}
                  activeClassName={styles.active}
                  onClick={this.handleServiceLinkClick}
                >
                  <div className={styles.iconWrapper}>
                    <ViewGrid />
                  </div>
                  <p className={styles.title}>AI Models Hub</p>
                </NavLink>
              </Tooltip>
            </li>
          ) : (
            ''
          )}
          <li>
            <Tooltip
              label='Settings'
              placement='right'
              showTooltip={isCollapsed}
              className={styles.navTooltip}
            >
              <NavLink
                to={routes.ACCOUNT_SETTINGS}
                isActive={(_, { pathname }) =>
                  SETTINGS_PATHS.includes(pathname)
                }
                className={styles.navItem}
                activeClassName={styles.active}
                onClick={this.handleSettingsLinkClick}
              >
                <div className={styles.iconWrapper}>
                  <Settings />
                </div>
                <p className={styles.title}>Settings</p>
              </NavLink>
            </Tooltip>
          </li>
        </ul>
      </nav>
    );
  }
}

function mapStateToProp(state) {
  const { user, config } = state.app;

  return {
    user,
    config,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(Navigation)
);
