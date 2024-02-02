/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import cx from 'classnames';
import { NavArrowLeft, NavArrowRight } from 'iconoir-react';
import { ArrowLeft } from 'iconoir-react';
import * as api from 'new/api';
import { HelpTooltip } from 'new/components/overlays/OldReviewDocumentOverlay/tooltip';
import ttConstants from 'new/constants/helpTooltips';
import ROUTES from 'new/constants/routes';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import FullPageLoader from 'new/ui-elements/PageLoader/PageLoader';

import { default as SectionList } from './SectionList';
import SectionSkeleton from './SectionSkeleton';

import styles from './EditFieldSidebar.scss';

class EditFieldSidebar extends Component {
  state = {
    dataTypes: [],
    loaderText: 'Updating the changes made..',
  };

  contentRef = React.createRef();

  componentDidMount() {
    this.fetchDataTypeList();
  }

  componentDidUpdate(prevProps) {
    const { isReviewLoading } = this.props;
    const { isReviewLoading: prevIsReviewLoading } = prevProps;
    if (isReviewLoading !== prevIsReviewLoading) {
      this.timer = setInterval(() => {
        this.setState({
          loaderText: 'Extracting the data..',
        });
      }, 4000);
    }
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  fetchDataTypeList = async () => {
    const response = await api.getFilterDataType();
    const dataTypes = [...(response?.responsePayload?.data || [])];

    this.setState({
      dataTypes,
    });
  };

  handleScroll = (e) => {
    this.props.onScroll(e);
  };

  handleMouseDown = (e) => {
    var box = this.contentRef.current;
    var pos = 0,
      pos1 = 0;
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup
    pos1 = e.clientX;
    /* stop moving when mouse button is released:*/
    document.onmouseup = () => {
      document.onmouseup = null;
      document.onmousemove = null;
    };
    // call a function whenever the cursor moves:
    document.onmousemove = (e) => {
      e = e || window.event;
      e.preventDefault();
      pos = e.clientX - pos1;
      pos1 = e.clientX;
      let right = pos;
      let boxWidth = box.clientWidth;
      var finalWidth = boxWidth + right;
      box.style.flexBasis = `${finalWidth}px`;
      this.props.onSidebarResize();
    };
  };

  renderFooterPagination = () => {
    const { documentIds, docId, onEditDocNavigateBtnClick, isReviewLoading } =
      this.props;

    const totalDocCount = documentIds.length;
    const currentDocIndex = documentIds.indexOf(docId);

    if (currentDocIndex < 0) {
      return null;
    }

    const currentDocPosition = currentDocIndex + 1;
    let prevDocId;
    let nextDocId;

    if (currentDocIndex > 0) {
      prevDocId = documentIds[currentDocIndex - 1];
    }

    if (currentDocIndex < totalDocCount - 1) {
      nextDocId = documentIds[currentDocIndex + 1];
    }

    const handlePrevBtnClick = () => {
      onEditDocNavigateBtnClick(prevDocId);
    };

    const handleNextBtnClick = () => {
      onEditDocNavigateBtnClick(nextDocId);
    };

    return (
      <div className={cx(styles.nav)}>
        <IconButton
          variant='ghost'
          size='small'
          disabled={!prevDocId || isReviewLoading}
          onClick={handlePrevBtnClick}
          icon={NavArrowLeft}
        />

        <div className={cx('non-selectable', styles.content)}>
          {totalDocCount >= 500 ? (
            <p>
              {currentDocPosition} of {`${totalDocCount}+`}
            </p>
          ) : (
            <p>
              {currentDocPosition} of {totalDocCount}
            </p>
          )}
        </div>

        <IconButton
          variant='ghost'
          size='small'
          disabled={!nextDocId || isReviewLoading}
          onClick={handleNextBtnClick}
          icon={NavArrowRight}
        />
      </div>
    );
  };

  renderFooter = () => {
    const {
      isFetchingData,
      dataFetchFailed,
      allDocImagesLoaded,
      isStartingReview,
      onSaveCloseBtnClick,
      onCancelClick,
      editFieldChanges,
      isReviewLoading,
      customDocType,
    } = this.props;

    const allDocumentImagesLoaded = customDocType ? true : allDocImagesLoaded;
    if (isFetchingData || dataFetchFailed || !allDocumentImagesLoaded) {
      return null;
    }

    return (
      <footer className={styles.footer}>
        <div className={styles.footer__btns}>
          <HelpTooltip id={ttConstants.TT_EDIT_FIELD_SAVE_CLOSE_BTN}>
            <Button
              className={styles.btn}
              isLoading={isStartingReview}
              style={{ width: '65%' }}
              size='small'
              fluid
              disabled={!editFieldChanges || isReviewLoading}
              onClick={onSaveCloseBtnClick}
            >
              Save & Extract
            </Button>
          </HelpTooltip>
          <Button
            variant='outlined'
            isLoading={isStartingReview}
            disabled={isReviewLoading}
            style={{ width: '35%' }}
            size='small'
            fluid
            onClick={onCancelClick}
          >
            Cancel
          </Button>
        </div>
        <div className={styles.footer__pagination}>
          {this.renderFooterPagination()}
        </div>
      </footer>
    );
  };

  render() {
    const {
      isFetchingData,
      dataFetchFailed,
      allDocImagesLoaded,
      docMeta,
      docReadOnly,
      sections,
      onAddFieldBtnClick,
      onSidebarLineItemFieldClick,
      onSidebarFieldInputFocus,
      onSidebarReadOnlyFieldClick,
      onSidebarFieldInputValueChange,
      onSidebarFieldInputFormSubmit,
      onSidebarFieldLabelFormSubmit,
      onFilterBtnClick,
      updateLabelSlug,
      setFieldKey,
      setFieldValue,
      setSectionNameValue,
      onInputSelect,
      docType,
      docId,
      onDeleteSectionField,
      onAddSectionBtnClick,
      onSectionDeleteBtnClick,
      tooltipFlow,
      scrollSectionFieldIntoView,
      isReviewLoading,
      onLineFieldInputFocus,
      onFooterFieldInputSubmit,
      onFooterFieldInputValueChange,
      changeText,
      documentsById,
      editFieldChanges,
      onCancelClick,
      user,
      config,
      customDocType,
    } = this.props;

    const { dataTypes } = this.state;
    const allDocumentImagesLoaded = customDocType ? true : allDocImagesLoaded;
    const allDocsLoaded = dataFetchFailed ? false : !allDocumentImagesLoaded;
    const showSkeleton = isFetchingData || allDocsLoaded;
    const showSections = !showSkeleton && !dataFetchFailed && !isReviewLoading;
    const formattedDocType =
      documentsById[docId]?.typeTitle ||
      docType?.charAt(0).toUpperCase() + docType?.slice(1);

    return (
      <aside
        id={'rt-sidebar'}
        className={cx(styles.root, {
          [styles.addExtraPadding]: tooltipFlow,
          [styles['root--docReadOnly']]: docReadOnly,
        })}
        onScroll={this.handleScroll}
        ref={this.contentRef}
      >
        <div className={styles.drag} onMouseDown={this.handleMouseDown}>
          <span></span>
          <span></span>
        </div>
        <header className={styles.header}>
          <IconButton
            icon={<ArrowLeft height={17} width={17} strokeWidth={2} />}
            variant='ghost'
            onClick={onCancelClick}
            className={styles.header__icon}
          />
          <h1 className={cx('ellipsis', styles.title)} title={formattedDocType}>
            {formattedDocType} &gt; Edit Fields
          </h1>
        </header>

        <main className={styles.content} id={'rt-sidebar-content'}>
          {showSkeleton ? <SectionSkeleton /> : null}

          {isReviewLoading ? (
            <div className={styles.root__loader}>
              <FullPageLoader className={cx(styles['root__loader--icon'])} />
              <div className={cx(styles['root__loader--text'], 'mt-5')}>
                {changeText ? (
                  <>
                    <p>Extracting the data..</p>
                    <p className='mt-2'>
                      Beep boop, data bots are taking time to extract your data,{' '}
                      <span
                        className={styles['root__loader--action']}
                        onClick={() => this.props.history.push(ROUTES.ROOT)}
                      >
                        come back later
                      </span>{' '}
                      to witness the magic!
                    </p>
                  </>
                ) : (
                  // eslint-disable-next-line quotes
                  <p>{this.state.loaderText}</p>
                )}
              </div>
            </div>
          ) : null}

          {showSections ? (
            <SectionList
              sections={sections}
              docType={docType}
              docId={docId}
              updateLabelSlug={updateLabelSlug}
              docReadOnly={docReadOnly}
              setFieldKey={setFieldKey}
              setFieldValue={setFieldValue}
              onInputSelect={onInputSelect}
              onFilterBtnClick={onFilterBtnClick}
              onAddSectionBtnClick={onAddSectionBtnClick}
              setSectionNameValue={setSectionNameValue}
              onDeleteSectionField={onDeleteSectionField}
              onSectionDeleteBtnClick={onSectionDeleteBtnClick}
              onSidebarLineItemFieldClick={onSidebarLineItemFieldClick}
              onSidebarFieldInputFocus={onSidebarFieldInputFocus}
              onSidebarReadOnlyFieldClick={onSidebarReadOnlyFieldClick}
              onSidebarFieldInputValueChange={onSidebarFieldInputValueChange}
              onSidebarFieldInputFormSubmit={onSidebarFieldInputFormSubmit}
              onSidebarFieldLabelFormSubmit={onSidebarFieldLabelFormSubmit}
              onAddFieldBtnClick={onAddFieldBtnClick}
              scrollSectionFieldIntoView={scrollSectionFieldIntoView}
              dataTypes={dataTypes}
              onLineFieldInputFocus={onLineFieldInputFocus}
              onFooterFieldInputSubmit={onFooterFieldInputSubmit}
              onFooterFieldInputValueChange={onFooterFieldInputValueChange}
              user={user}
              config={config}
            />
          ) : null}
        </main>

        {this.renderFooter()}
      </aside>
    );
  }
}

export default withRouter(EditFieldSidebar);
