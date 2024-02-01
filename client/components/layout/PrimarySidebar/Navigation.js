/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { showFeedbackForm, storeFolderId } from '@redux/helpers';
import * as reduxHelpers from 'client/redux/helpers';

import cx from 'classnames';
import * as api from 'client/api';
import * as fileConstants from 'client/constants/file';
import { MIXPANEL_ORIGINS } from 'client/constants/mixpanel';
import routes from 'client/constants/routes';
import { MIXPANEL_EVENTS } from 'client/thirdParty/mixpanel';
import { getMemberPermissions } from 'helpers/permissions/';
import * as uploadHelper from 'helpers/upload';
import { ReactComponent as AddIcon } from 'images/icons/add.svg';
import { ReactComponent as SettingsIcon } from 'images/icons/configuration.svg';
import { ReactComponent as DocumentTypeIcon } from 'images/icons/document-type.svg';
import { ReactComponent as ModelIcon } from 'images/icons/model.svg';
import { ReactComponent as AllDocumentsIcon } from 'images/icons/nav-all-documents.svg';
import { ReactComponent as APIIcon } from 'images/icons/webapi.svg';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';

import { withConfigContext } from 'components/contexts/config';

import NewDropdown from './NewDropdown';

import styles from './navigation.scss';

const SETTINGS_PATHS = [
  '/settings/account-settings/',
  '/settings/users/',
  '/settings/database-table/',
  '/settings/integration/',
  '/settings/security/',
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
    };
    this.dropzoneRef = React.createRef();
    this.inputRef = React.createRef();
  }

  handleDropFolderAccepted = () => {
    let { files } = this.inputRef.current;
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
          files: files,
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
      version: 'old',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.setState({
      currentDocumentType: documentType,
    });
    this.documentType = documentType;
    this.dropzoneRef && this.dropzoneRef.current.open();
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
        version: 'old',
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
    mixpanel.track(MIXPANEL_EVENTS.view_api_services, {
      'work email': user.email,
      origin: originType ? originType.value : '',
      version: 'old',
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
      version: 'old',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  handleFeedbackLinkClick = (e) => {
    this.closeAnalyticsOnNavigation();
    e.preventDefault();
    showFeedbackForm();
  };

  render() {
    const {
      user,
      config,
      globalMyDocumentCounts,
      isCollapsed,
      isNewDropdownVisible,
      onNewDropdownOutsideClick,
      isUploadButtonVisible = true,
    } = this.props;

    const { showApiServices } = this.state;

    const documentTypes = config.documentTypes || [];

    const uploadableDocumentTypes = documentTypes.filter((item) =>
      item.isAuthorized !== undefined
        ? item.isAuthorized && item.canUpload
        : item.canUpload
    );

    const documentCounts = {};
    ['all', 'review', 'skipped', 'processed'].forEach((key) => {
      const value = _.get(globalMyDocumentCounts, key);
      documentCounts[key] = _.isNumber(value) ? value : null;
    });

    const { pathname } = this.props.history.location || {};

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
        {isNewDropdownVisible ? (
          <NewDropdown
            className={styles.newDropdown}
            documentTypes={uploadableDocumentTypes}
            uploadEmailAddress={user.uploadEmail}
            onOutsideClick={onNewDropdownOutsideClick}
            onUploadFileBtnClick={this.handleUploadFileBtnClick}
            onUploadFolderBtnClick={this.handleUploadFolderBtnClick}
          />
        ) : null}
        <ul>
          {isUploadButtonVisible && uploadableDocumentTypes.length ? (
            <li>
              <button
                className={cx(styles.navItem, styles.newDocButton)}
                onClick={this.handleNewBtnClick}
              >
                <div className={styles.iconWrapper}>
                  <AddIcon />
                </div>
                <p className={styles.title}>New</p>
              </button>
            </li>
          ) : null}

          <li>
            <NavLink
              exact
              to={'/'}
              onClick={(e) =>
                this.handleDocumentListPageLinkClick(
                  e,
                  '/',
                  'all documents',
                  MIXPANEL_EVENTS.document_type
                )
              }
              title='Document Types'
              className={styles.navItem}
              activeClassName={styles.active}
            >
              <div className={styles.iconWrapper}>
                <DocumentTypeIcon />
              </div>
              <p className={styles.title}>Document Types</p>
              <p className={styles.tooltip}>Document Types</p>
            </NavLink>
          </li>

          <li>
            <NavLink
              exact
              to={'/all'}
              onClick={(e) =>
                this.handleDocumentListPageLinkClick(
                  e,
                  '/all',
                  'all documents',
                  MIXPANEL_EVENTS.my_documents
                )
              }
              title='My Documents'
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
                <AllDocumentsIcon />
              </div>
              <p className={styles.title}>My Documents</p>
              <p className={styles.count}>{documentCounts.all}</p>
              <p className={styles.tooltip}>My Documents</p>
            </NavLink>
          </li>
          {showApiServices ? (
            <li>
              <NavLink
                to={'/model/'}
                title='Models & Training'
                className={styles.navItem}
                activeClassName={styles.active}
                onClick={this.handleModelLinkClick}
              >
                <div className={styles.iconWrapper}>
                  <ModelIcon />
                </div>
                <p className={styles.title}>Models &amp; Training</p>
                <p className={styles.tooltip}>Models &amp; Training</p>
              </NavLink>
            </li>
          ) : (
            ''
          )}

          {showApiServices ? (
            <li>
              <NavLink
                to={'/services/'}
                title='Services'
                className={styles.navItem}
                activeClassName={styles.active}
                onClick={this.handleServiceLinkClick}
              >
                <div className={styles.iconWrapper}>
                  <APIIcon />
                </div>
                <p className={styles.title}>APIs &amp; Services</p>
                <p className={styles.tooltip}>APIs &amp; Services</p>
              </NavLink>
            </li>
          ) : (
            ''
          )}
          <li>
            <NavLink
              to={'/settings/account-settings/'}
              isActive={(_, { pathname }) => SETTINGS_PATHS.includes(pathname)}
              title='Settings'
              className={styles.navItem}
              activeClassName={styles.active}
              onClick={this.handleSettingsLinkClick}
            >
              <div className={styles.iconWrapper}>
                <SettingsIcon />
              </div>
              <p className={styles.title}>Settings</p>
              <p className={styles.tooltip}>Settings</p>
            </NavLink>
          </li>
        </ul>
      </nav>
    );
  }
}

export default withConfigContext(Navigation);
