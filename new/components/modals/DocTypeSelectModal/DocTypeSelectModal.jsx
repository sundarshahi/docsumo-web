import React, { Fragment, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { showToast } from 'new/redux/helpers';
import { actions as servicesActions } from 'new/redux/services/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { ArrowRightCircle, Cancel } from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { ReactComponent as DocEmptyState } from 'new/assets/images/icons/document-empty-state.svg';
import { ReactComponent as LoaderIcon } from 'new/assets/images/icons/loader.svg';
import { PageScrollableContent } from 'new/components/layout/page';
import { DataFetchFailurePageError } from 'new/components/shared/PageError';
import * as apiConstants from 'new/constants/api';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Modal from 'new/ui-elements/Modal/Modal';
import { generateCustomDocumentName } from 'new/utils/generateCustomDocumentName';
import { generateDuplicateName } from 'new/utils/generateDuplicateName';

import SearchBox from './components/SearchBox';
import SideBarListContentSkeletonLoader from './components/SkeletonLoader/SideBarListContentSkeletonLoader';
import SideBarSkeletonLoader from './components/SkeletonLoader/SideBarSkeletonLoader';

import styles from './index.scss';

function DocTypeSelectModal({
  showDoctypeSelectionModal,
  documentActions,
  appActions,
  servicesActions,
  services,
  fetchSucceeded,
  fetchFailed,
  isFetchingServices,
  config,
  user,
  setShowHubSpotMeetingPopUp,
  documentIds,
  disabledDocTypes,
  selectedModelHub,
}) {
  const [apiCategories, setApiCategories] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [preferredServices, setPreferredServices] = useState([]);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [activeModalContent, setActiveModalContent] =
    useState('docTypeSelection');
  const [duplicateCase, setDuplicatecase] = useState({});
  const [selectedDocType, setSelectedDocType] = useState({});
  const divsRef = useRef({});
  const [isEnablingDocType, setDocTypeStatus] = useState(false);
  const [isRequestingAccess, setRequestAccessStatus] = useState(false);

  useEffect(() => {
    appActions.showDarkOverlay();
    servicesActions.servicesFetch({});
    return () => {
      documentActions.selectedService({
        documentTypeModel: {},
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFilteredServices(services);

    if (services?.length > 0) {
      setFilteredServices(services);

      const categoriesFilterValue = services.map((service) => service.category);
      const uniqueCategories = [...new Set(categoriesFilterValue)];
      const formattedCategories = uniqueCategories.map((item) => ({
        category: item,
        title: item,
      }));

      setApiCategories(formattedCategories);

      const prefDocs = services.filter((service) => service.preferred === true);
      setPreferredServices(prefDocs);
    }
  }, [services]);

  useEffect(() => {
    if (searchValue) {
      const filterServices = services?.filter(
        (service) =>
          service?.title
            .toLowerCase()
            .includes(searchValue.trim().toLowerCase()) ||
          service?.description
            .toLowerCase()
            .includes(searchValue.trim().toLowerCase())
      );
      const filterPreferredDocs = preferredServices?.filter(
        (service) =>
          service?.title
            .toLowerCase()
            .includes(searchValue.trim().toLowerCase()) ||
          service?.description
            .toLowerCase()
            .includes(searchValue.trim().toLowerCase())
      );
      setFilteredServices(filterServices);
      setPreferredServices(filterPreferredDocs);
    } else {
      if (services?.length > 0) {
        setFilteredServices(services);

        const categoriesFilterValue = services?.map(
          (service) => service.category
        );
        const uniqueCategories = [...new Set(categoriesFilterValue)];
        const formattedCategories = uniqueCategories?.map((item) => ({
          category: item,
          title: item,
        }));

        setApiCategories(formattedCategories);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, showDoctypeSelectionModal, services]);

  useEffect(() => {
    if (!_.isEmpty(selectedModelHub)) {
      const { type = '' } = selectedModelHub;
      if (type === 'custom') {
        handleCustomDocTypeClick();
      } else {
        handleDocumentTypeClick(selectedModelHub);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModelHub]);

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearchValue(value);
  };

  const handleClose = () => {
    appActions.hideDarkOverlay();
    documentActions.displaySelectDocumentTypeModal(false);
    documentActions.selectedService({
      documentTypeModel: {},
    });
  };

  const docEmptyState = () => {
    return (
      <>
        <div className={styles.emptyStateContainer}>
          <DocEmptyState className={styles.emptyStateContainer__icon} />
          <div className={styles.emptyState}>
            <p className={styles.emptyState__title}>
              Couldn't find "{searchValue.trim()}"
            </p>
            <p className={styles.emptyState__desc}>
              Search for a different document type or train your own model below
            </p>
          </div>
        </div>
        {customDocumentTypeV2()}
      </>
    );
  };

  const handleCustomDocTypeClick = async () => {
    const { canSwitchToOldMode = true } = config;
    const documentName = generateCustomDocumentName(services);

    const selectedDocumentType = {
      title: documentName,
      value: 'Custom',
      type: 'custom',
      showDocumentTypeRenameField: true,
      showSampleDocProceedField: false,
      showBackButton: true,
      hideOverlay: true,
      label: {
        title: 'Create your document type',
        confirmModalTitle: 'Cancel upload',
        confirmModalBody:
          'This will cancel upload and the files you have queued will be lost. Are you sure you want to do this?',
        save: 'Create',
      },
    };

    documentActions.selectDocumentType(selectedDocumentType);
    documentActions.displaySelectDocumentTypeModal(false);
    documentActions.displayCreateDocumentTypeModal(true);

    mixpanel.track(MIXPANEL_EVENTS.select_doc_type, {
      'work email': user.email,
      'organization ID': user.orgId,
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
      isCustomDocType: true,
      docType: `Custom - ${documentName}`,
      isPreferredDocType: false,
      origin: 'Select Document Type Modal',
    });
  };

  const handleDocumentTypeClick = async (documentType) => {
    const { canSwitchToOldMode = true } = config;

    if (
      documentType.value === 'auto_classify' ||
      documentType.value === 'auto_classify__test'
    ) {
      // Trigger select doc type event
      mixpanel.track(MIXPANEL_EVENTS.select_doc_type, {
        'work email': user.email,
        'organization ID': user.orgId,
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
        isCustomDocType: false,
        docType: documentType.value,
        isPreferredDocType: documentType.preferred,
        origin: 'Select Document Type Modal',
      });
      appActions.hideDarkOverlay();
      documentActions.displaySelectDocumentTypeModal(false);

      documentActions.displayAutoClassifyModal(true);
      mixpanel.track(MIXPANEL_EVENTS.open_auto_classify_modal, {
        'work email': user.email,
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } else {
      setSelectedDocType(documentType);
      try {
        const response = await api.getDocumentTypeAccess({
          docType: documentType.value,
        });
        const statusCode = _.get(response?.responsePayload, 'statusCode');
        if (statusCode === 200) {
          handleDocTypeSelection(documentType, false);
        }
      } catch (e) {
        const { message, error } = e.responsePayload;
        setDuplicatecase({
          type: error,
          message,
        });
        setActiveModalContent('createDuplicateConfirmation');
      }
    }
  };

  const handleDocTypeSelection = (documentType, shouldDuplicateDoc) => {
    const { documentTypes = [], canSwitchToOldMode = true } = config;

    const selectedDocumentType = {
      ...documentType,
      title: shouldDuplicateDoc
        ? generateDuplicateName(documentTypes, documentType)
        : documentType.title,
      type: shouldDuplicateDoc ? 'duplicate' : 'new',
      showSampleDocProceedField: shouldDuplicateDoc ? false : true,
      showDocumentTypeRenameField: true,
      showBackButton: true,
      hideOverlay: true,
      canCreateDocWithoutUpload: shouldDuplicateDoc ? true : false,
      label: {
        title: 'Create your document type',
        confirmModalTitle: 'Cancel upload',
        confirmModalBody:
          'This will cancel upload and the files you have queued will be lost. Are you sure you want to do this?',
        save: 'Create',
      },
    };

    documentActions.selectDocumentType(selectedDocumentType);
    documentActions.displaySelectDocumentTypeModal(false);
    documentActions.displayCreateDocumentTypeModal(true);

    mixpanel.track(MIXPANEL_EVENTS.select_doc_type, {
      'work email': user.email,
      'organization ID': user.orgId,
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
      docType: documentType.value,
      isCustomDocType: false,
      isPreferredDocType: documentType.preferred,
      origin: 'Select Document Type Modal',
    });
  };

  const handleContactSalesClick = () => {
    appActions.hideDarkOverlay();
    documentActions.displaySelectDocumentTypeModal(false);
    setShowHubSpotMeetingPopUp(true);
    const { canSwitchToOldMode = true } = config;

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.contact_sales_start, {
      'work email': user.email,
      'organization ID': user.orgId,
      origin: 'Custom document type',
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  const handleSearchClear = () => {
    setSearchValue('');
    setFilteredServices(services);
  };

  const handleTabClick = (e, category) => {
    e.preventDefault();
    setActiveTab(category);

    const scrollPage = () => {
      if (divsRef.current[category]) {
        divsRef.current[category].scrollIntoView();
      }
    };

    if (
      !filteredServices.length ||
      !filteredServices.filter((api) => api.category === category).length
    ) {
      handleSearchClear();
      scrollPage();
    } else {
      scrollPage();
    }
  };

  const handleTooltipControl = () => {
    setIsTooltipVisible(!isTooltipVisible);
    setTimeout(() => {
      setIsTooltipVisible(false);
    }, 5000);
  };

  const handleExistingDocTypeUse = () => {
    documentActions.setHighlightedDocumentType({
      docType: selectedDocType,
    });
    appActions.hideDarkOverlay();
    documentActions.displaySelectDocumentTypeModal(false);
  };

  const handleEnableDocType = async () => {
    setDocTypeStatus(true);

    try {
      const response = await api.updateStatusServices({
        serviceId: selectedDocType.id,
        status: !selectedDocType.canUpload,
        uploadSample: false,
        refresh: true,
      });

      const data = _.get(response.responsePayload, 'data');

      // Update documentTypes of config in store
      await appActions.updateConfig({
        updates: {
          documentTypes: data,
        },
      });

      // Get latest document types data
      await documentActions.allDocumentsTypeFetch();

      showToast({
        title: 'Document type enabled successfully!',
        success: true,
        duration: 3000,
      });

      appActions.hideDarkOverlay();
      documentActions.displaySelectDocumentTypeModal(false);
    } catch (e) {
      const errorMessage =
        e?.responsePayload?.message ??
        'A error occured while enabling the document type.';
      showToast({
        title: errorMessage,
        error: true,
        duration: 3000,
      });
    } finally {
      setDocTypeStatus(false);
    }
  };

  const handleDocTypeAccessRequest = async (enable = false) => {
    setRequestAccessStatus(true);

    try {
      const response = await api.requestDocumentTypeAccess({
        doc_type: selectedDocType.value,
      });

      const statusCode = _.get(response.responsePayload, 'statusCode');

      if (statusCode === 200) {
        if (enable) {
          try {
            const response = await api.updateStatusServices({
              serviceId: selectedDocType.id,
              status: !selectedDocType.canUpload,
              uploadSample: false,
              refresh: true,
            });

            const data = _.get(response.responsePayload, 'data');

            // Update documentTypes of config in store
            await appActions.updateConfig({
              updates: {
                documentTypes: data,
              },
            });
          } catch (e) {
            const errorMessage =
              e?.responsePayload?.message ??
              'A error occured while enabling the document type.';
            showToast({
              title: errorMessage,
              error: true,
              duration: 3000,
            });
          }
        }

        // Get latest document types data
        await documentActions.allDocumentsTypeFetch();

        showToast({
          title: `Document type accessed ${
            enable ? 'and enabled' : ''
          } successfully!`,
          success: true,
          duration: 3000,
        });

        appActions.hideDarkOverlay();
        documentActions.displaySelectDocumentTypeModal(false);
      }
    } catch (e) {
      const errorMessage =
        e?.responsePayload?.message ??
        'A error occured while requesting document type access.';
      showToast({
        title: errorMessage,
        error: true,
        duration: 3000,
      });
    } finally {
      setRequestAccessStatus(false);
    }
  };

  const customDocumentType = () => {
    return (
      <>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-static-element-interactions*/}
        <div
          className={styles.flex_item}
          onClick={() => handleCustomDocTypeClick()}
        >
          <p className={styles.flex_item__title}>Train New Document Type</p>
          <ArrowRightCircle color='var(--ds-clr-primary)' />
        </div>
      </>
    );
  };
  const customDocumentTypeV2 = () => {
    return (
      <div
        ref={(el) => (divsRef.current['customDocType'] = el)}
        className={styles.docListContent}
      >
        <p className={styles.docListContent__docListTitle}>
          Custom Document Type
        </p>
        <div className={styles.docListItems}>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions*/}
          <div
            className={styles.flex_item}
            onClick={() => handleCustomDocTypeClick()}
          >
            <p className={styles.flex_item__title}>Create Your Own</p>
            <ArrowRightCircle color='var(--ds-clr-primary)' />
          </div>
        </div>
      </div>
    );
  };
  const renderSideBarContent = () => {
    if (isFetchingServices || !services?.length) {
      return <SideBarSkeletonLoader />;
    }
    const categoryExists = services.every((service) => service.category);

    const apiList = apiCategories?.map((apiItem) => {
      const categoryServices = services.filter(
        (api) => api.category === apiItem.category
      );

      return {
        title: apiItem.title,
        category: apiItem.category,
        list: categoryServices,
      };
    });
    const hasCustomApi = !!apiList.find(
      (item) => item.title === 'Custom Document Type'
    );

    return (
      <>
        {categoryExists ? (
          <ul className={styles.bottomColumnContent__leftColNavigation}>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions*/}
            <li
              className={cx(
                styles.tab,
                { [styles.active]: activeTab === 'all' },
                'px-4',
                'py-2'
              )}
              onClick={(e) => handleTabClick(e, 'all')}
            >
              <p className={styles.tab__title}>All</p>
            </li>

            {[
              ...apiList?.filter((group) => group.title !== 'General'),
              ...apiList?.filter((group) => group.title === 'General'),
            ].map((api) => {
              if (
                !services.filter((item) => item.category === api.category)
                  .length
              ) {
                return null;
              }
              return (
                /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions*/
                <li
                  key={api.category}
                  onClick={(e) => handleTabClick(e, api.category)}
                  className={cx(
                    styles.tab,
                    { [styles.active]: activeTab === api.category },
                    'px-4',
                    'py-3'
                  )}
                >
                  <p className={styles.tab__title}>
                    {api?.title === 'Custom Document Type'
                      ? 'Train Your Own'
                      : api?.title}
                  </p>
                  <p className={styles.tab__documentCount}>
                    {api.list.length.toString().padStart(2, '0')}
                  </p>
                </li>
              );
            })}
            {!hasCustomApi ? (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
              <li
                onClick={(e) => handleTabClick(e, 'customDocType')}
                className={cx(
                  styles.tab,
                  { [styles.active]: activeTab === 'customDocType' },
                  'px-4',
                  'py-3'
                )}
              >
                Train your own
              </li>
            ) : null}
          </ul>
        ) : null}
      </>
    );
  };

  const renderServiceTabList = () => {
    const showFetchError = !isFetchingServices && fetchFailed;

    if (isFetchingServices || !services?.length) {
      return <SideBarListContentSkeletonLoader />;
    }

    if (showFetchError) return <DataFetchFailurePageError className='mt-12' />;

    if (fetchSucceeded && !filteredServices?.length) {
      return docEmptyState();
    }

    const categoryExists = filteredServices.every(
      (service) => service.category
    );
    if (categoryExists) {
      const apiList = apiCategories?.map((apiItem) => {
        return {
          title: apiItem.title,
          category: apiItem.category,
          list: filteredServices.filter(
            (api) => api.category === apiItem.category
          ),
        };
      });
      const hasCustomApi = !!apiList.find(
        (item) => item.title === 'Custom Document Type'
      );

      return (
        <>
          <div ref={(el) => (divsRef.current['all'] = el)} />
          {preferredServices?.length ? (
            <div
              ref={(el) => (divsRef.current['prefDocType'] = el)}
              className={styles.docListContent}
            >
              <p className={styles.docListContent__docListTitle}>
                Preferred document types
              </p>
              <div className={styles.docListItems}>
                {preferredServices?.map((apiItem, i) => (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                  <div
                    key={i}
                    className={styles.flex_item}
                    onClick={() =>
                      handleDocumentTypeClick({
                        ...apiItem,
                        elemId: `prefDoc_${apiItem.id}`,
                      })
                    }
                    title={apiItem.title}
                  >
                    <p className={styles.flex_item__title}>{apiItem.title}</p>
                    {selectedDocType?.id === apiItem.id &&
                    selectedDocType?.elemId === `prefDoc_${apiItem.id}` ? (
                      <LoaderIcon className={styles.loaderIcon} />
                    ) : (
                      <ArrowRightCircle color='var(--ds-clr-primary)' />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {[
            ...apiList?.filter((group) => group.title !== 'General'),
            ...apiList?.filter((group) => group.title === 'General'),
          ].map((group, i) => {
            return (
              <React.Fragment key={i}>
                {group?.list?.length ? (
                  <div
                    className={styles.docListContent}
                    ref={(el) => (divsRef.current[group.category] = el)}
                  >
                    <p className={styles.docListContent__docListTitle}>
                      {group.title === 'Custom Document Type'
                        ? 'Train Your Own'
                        : group.title}
                    </p>
                    <div className={styles.docListItems}>
                      {group.list.map((api, i) => {
                        return (
                          <Fragment key={i}>
                            {i === 0 &&
                              api.category === 'Custom Document Type' &&
                              customDocumentType()}
                            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-static-element-interactions*/}
                            <div
                              className={styles.flex_item}
                              onClick={() =>
                                handleDocumentTypeClick({
                                  ...api,
                                  elemId: `listDoc_${api.id}`,
                                })
                              }
                            >
                              <p className={styles.flex_item__title}>
                                {api.title}
                              </p>
                              {selectedDocType?.id === api.id &&
                              selectedDocType?.elemId ===
                                `listDoc_${api.id}` ? (
                                <LoaderIcon className={styles.loaderIcon} />
                              ) : (
                                <ArrowRightCircle color='var(--ds-clr-primary)' />
                              )}
                            </div>
                          </Fragment>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}
          {!hasCustomApi && !searchValue && customDocumentTypeV2()}
        </>
      );
    }
  };

  const renderDocTypeSelectionContent = () => {
    return (
      <div className={styles.docSelectType}>
        <div className={styles.topColumnContent}>
          <div className={styles.header}>
            <p className={styles.header__doctype_select_title}>
              Select a Document Type
            </p>
            <IconButton
              icon={<Cancel height={24} width={24} />}
              variant='ghost'
              onClick={handleClose}
            />
          </div>
          <p className={styles.topColumnContent__doctype_span}>
            Choose from a list of 50+ ready-to-use document types
          </p>
          <div className={styles.searchField}>
            <SearchBox
              name='apiSearch'
              placeholder='Ex: Invoice'
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className={styles.bottomColumnContent}>
          <div className={styles.bottomColumnContent__leftColumn}>
            {renderSideBarContent()}
          </div>
          <PageScrollableContent
            id='apiScrollContainer'
            className={styles.scrollContainer}
          >
            <div className={cx(styles.RightColumn)}>
              <div className={styles.RightColumn__content}>
                {renderServiceTabList()}
              </div>
            </div>
          </PageScrollableContent>
        </div>
      </div>
    );
  };

  const renderCreateDuplicateContent = () => {
    let secondaryCTA = null;

    switch (duplicateCase.type) {
      case 'ENABLED':
        secondaryCTA = (
          <Button
            type='button'
            variant='outlined'
            onClick={handleExistingDocTypeUse}
          >
            Use Existing
          </Button>
        );
        break;
      case 'DISABLED':
        secondaryCTA = (
          <Button
            type='button'
            variant='outlined'
            isLoading={isEnablingDocType}
            onClick={handleEnableDocType}
          >
            Enable
          </Button>
        );
        break;
      case 'UNAUTHORIZED AND DISABLED':
        secondaryCTA = (
          <Button
            type='button'
            variant='outlined'
            isLoading={isRequestingAccess}
            onClick={() => handleDocTypeAccessRequest(true)}
          >
            Enable &amp; Get Access
          </Button>
        );
        break;
      case 'UNAUTHORIZED':
        secondaryCTA = (
          <Button
            type='button'
            variant='outlined'
            isLoading={isRequestingAccess}
            onClick={() => handleDocTypeAccessRequest(false)}
          >
            Get Access
          </Button>
        );
        break;
      default:
        secondaryCTA = (
          <Button
            type='button'
            variant='outlined'
            onClick={handleExistingDocTypeUse}
          >
            Use Existing
          </Button>
        );
    }
    return (
      <div className={styles.createDuplicateContent}>
        <div className={styles.createDuplicateContent_header}>
          <h1 className={styles.createDuplicateContent_heading}>
            Create Duplicate
          </h1>
          <IconButton
            icon={<Cancel height={24} width={24} />}
            variant='ghost'
            onClick={handleClose}
          />
        </div>
        <div className={styles.createDuplicateContent_body}>
          <p>{duplicateCase.message}</p>
        </div>
        <div className={styles.createDuplicateContent_footer}>
          {secondaryCTA}
          <Button
            type='button'
            variant='contained'
            onClick={() => handleDocTypeSelection(selectedDocType, true)}
          >
            Duplicate
          </Button>
        </div>
      </div>
    );
  };

  const renderModalContent = () => {
    switch (activeModalContent) {
      case 'docTypeSelection':
        return !_.isEmpty(selectedModelHub)
          ? null
          : renderDocTypeSelectionContent();
      case 'createDuplicateConfirmation':
        return renderCreateDuplicateContent();
      default:
        return !_.isEmpty(selectedModelHub)
          ? null
          : renderDocTypeSelectionContent();
    }
  };

  return (
    <>
      <Modal
        show={showDoctypeSelectionModal}
        onCloseHandler={handleClose}
        size={
          activeModalContent === 'createDuplicateConfirmation' ? 'sm' : 'lg'
        }
        hideOverlay
        timeout={0}
      >
        {renderModalContent()}
      </Modal>
    </>
  );
}

function mapStateToProp(state) {
  const { showDoctypeSelectionModal, allDocumentsTypePage, selectedModelHub } =
    state.documents;
  const { services, fetchState } = state.services.servicePage;
  const { config, user } = state.app;

  const isFetchingServices = fetchState === apiConstants.FETCH_STATES.FETCHING;
  const fetchSucceeded = fetchState === apiConstants.FETCH_STATES.SUCCESS;
  const fetchFailed = fetchState === apiConstants.FETCH_STATES.FAILURE;

  return {
    showDoctypeSelectionModal,
    services,
    fetchState,
    isFetchingServices,
    fetchSucceeded,
    fetchFailed,
    config,
    user,
    documentIds: allDocumentsTypePage?.documentIds || [],
    disabledDocTypes: allDocumentsTypePage?.disabledDocTypes || [],
    selectedModelHub,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    servicesActions: bindActionCreators(servicesActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(DocTypeSelectModal);
