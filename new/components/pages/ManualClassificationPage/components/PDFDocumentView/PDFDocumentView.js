/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import cx from 'classnames';
import { Collapse, Cut, Expand, ZoomIn, ZoomOut } from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import { PageScrollableContent } from 'new/components/layout/page';
import { CircularProgressBar } from 'new/components/widgets/progress';
import routes from 'new/constants/routes';
import { imageDownloader } from 'new/helpers/downloads';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import IconButton from 'new/ui-elements/IconButton/IconButton';

import SplitDocumentView from '../SplitDocumentView/SplitDocumentView';

import styles from './PDFDocumentView.scss';
class PDFDocumentView extends Component {
  state = {
    zoom: 100,
    zoomed: true,
    docFile: {},
    pageHeights: [],
    imagesLoaded: [],
    activePage: 1,
    showSplitDocumentView: false,
    approveFlag: false,
  };

  componentDidMount() {
    const { docFile } = this.props;
    this.setState({ docFile }, () => {
      this.setDocumentWrapperScrollEvent();
      this.setDocumentKeyDownEvent();
      this.handleImageDownload();
    });
  }

  setDocumentWrapperScrollEvent = () => {
    const { docFile } = this.state;
    const { pages = [] } = docFile;
    if (pages.length <= 1) return;
    const documentPagesWrapper = document.getElementById(
      'document-pages-wrapper'
    );
    if (documentPagesWrapper) {
      documentPagesWrapper.addEventListener(
        'scroll',
        this.handlePageChangeOnScroll
      );
    }
  };

  handlePageChangeOnScroll = (e) => {
    const { docFile, activePage } = this.state;
    const { pages = [] } = docFile;
    const documentPagesWrapperBB = e.target.getBoundingClientRect();
    for (let i = 0; i < pages.length; i++) {
      const documentPageContainer = document.getElementById(
        `document-page-${i}`
      );
      const documentPageContainerBB =
        documentPageContainer.getBoundingClientRect();
      if (
        documentPageContainerBB.y <= documentPagesWrapperBB.y &&
        documentPageContainerBB.y >= -documentPageContainerBB.height
      ) {
        const newActivePage = i + 1;
        if (newActivePage !== activePage) {
          this.setState({ activePage: newActivePage });
        }
      }
    }
  };

  setDocumentKeyDownEvent = () => {
    const { docFile } = this.state;
    const { pages = [] } = docFile;
    if (pages.length < 1) return;
    document.addEventListener('keydown', this.handleKeyDown);
  };

  handleKeyDown = (e) => {
    if (e.keyCode === 90 && (e.altKey || e.metaKey)) {
      e.preventDefault();
      this.handleZoomInClick();
    } else if (e.keyCode === 88 && (e.altKey || e.metaKey)) {
      e.preventDefault();
      const { zoom } = this.state;
      if (zoom < 40) return false;
      this.handleZoomOutClick();
    }
  };

  handleImageDownload = async (updateImage) => {
    const { docFile } = this.props;
    const { pages } = docFile;
    if (!pages.length) return;
    window.imageProgress = {};
    await pages.forEach(async ({ image }, index) => {
      const documentPage = document.getElementById(`document-page-${index}`);
      const thisImg = documentPage.querySelector('img');
      if (updateImage) {
        thisImg.src = '';
        document.querySelector(`.page-loader-${index}`).style.display = 'block';
      }
      window.imageProgress[`imageProgress-${index}`] = 0;
      const progress = ({ loaded, total }) => {
        window.imageProgress[`imageProgress-${index}`] = Math.round(
          (loaded / total) * 100
        );
      };
      await imageDownloader(image.url, thisImg, progress);
      const loader = document.querySelector(`.page-loader-${index}`) || {};
      thisImg.addEventListener('load', () => {
        document.getElementById('document-page-0')?.focus();
        if (loader.style) loader.style.display = 'none';
      });
    });
  };

  approveFlagChange = (value = true) => this.setState({ approveFlag: value });

  componentDidUpdate(prevProps, prevState) {
    const { approveFlag } = this.state;
    if (this.props.docFile !== prevProps.docFile) {
      this.setState(
        {
          docFile: this.props.docFile,
          imagesLoaded: [],
          pageHeights: [],
          activePage: 1,
        },
        () => {
          this.handleImageDownload(true);
          const documentPagesWrapper = document.getElementById(
            'document-pages-wrapper'
          );
          documentPagesWrapper.scrollTop = 0;
        }
      );
    }

    if (
      !approveFlag &&
      prevState.showSplitDocumentView &&
      this.state.showSplitDocumentView !== prevState.showSplitDocumentView
    ) {
      this.handleImageDownload();
    }
  }

  componentWillUnmount() {
    const documentPagesWrapper = document.getElementById(
      'document-pages-wrapper'
    );
    if (documentPagesWrapper) {
      documentPagesWrapper.removeEventListener(
        'scroll',
        this.handlePageChangeOnScroll
      );
    }
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handlePageChange = (e) => {
    const { value } = e.target;
    const { docFile } = this.state;
    const { pages = [] } = docFile;
    if (value > pages.length) return;
    this.setState({ activePage: value });
    const documentPagesWrapper = document.getElementById(
      'document-pages-wrapper'
    );
    const documentPagesWrapperBB = documentPagesWrapper.getBoundingClientRect();
    documentPagesWrapper.scrollTo(
      'auto',
      documentPagesWrapperBB.height * (value - 1)
    );
  };

  setZoom = (value) => {
    this.setPageHeights(value, () =>
      this.setState({
        zoom: value,
        zoomed: !!(value >= 99),
      })
    );
  };

  handleZoomOutClick = () => {
    const newValue = this.state.zoom - 10;
    this.setZoom(newValue);
  };

  handleZoomInClick = () => {
    const newValue = this.state.zoom + 10;
    this.setZoom(newValue);
  };

  handleSliderInputChange = (e) => {
    const { value } = e.target;
    this.setZoom(+value);
  };

  handleTogglePageSize = () => {
    const { zoomed } = this.state;
    this.setZoom(zoomed ? 75 : 100);
  };

  handleSplitDocument = () => {
    const { getDocData, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;
    const { excelType = false, docId = '', title = '' } = getDocData();
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_document, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.setState({ showSplitDocumentView: true });
  };

  closeSplitDocumentView = () =>
    this.setState({ showSplitDocumentView: false });

  handleCloseClick = () => this.props.history.push(routes.ALL);

  renderHeader = () => {
    const { zoom, zoomed, docFile, activePage } = this.state;
    return (
      <div className={styles.header}>
        <div className={cx(styles.header_controls)}>
          <div className={styles.header_zoom}>
            <IconButton
              className={cx(styles.header_zoomIconBtn)}
              icon={<ZoomOut />}
              variant='text'
              onClick={this.handleZoomOutClick}
              disabled={zoom <= 20}
              title='Zoom Out (Ctrl + -)'
            />
            <input
              type='range'
              min='20'
              max='160'
              value={zoom}
              className={styles.header_slider}
              id='myRange'
              onInput={this.handleSliderInputChange}
            />
            <IconButton
              className={cx(styles.header_zoomIconBtn)}
              icon={<ZoomIn />}
              variant='text'
              onClick={this.handleZoomInClick}
              title='Zoom In (Ctrl + +)'
              disabled={zoom >= 160}
            />
          </div>
          <span title='Zoom Percent' className={cx(styles.header_zoomPercent)}>
            {zoom}%
          </span>

          <IconButton
            className={cx(
              styles.header_iconBtn,
              styles['header_iconBtn--expand']
            )}
            onClick={this.handleTogglePageSize}
            title={zoomed ? 'Shrink Document' : 'Expand Document'}
            icon={zoomed ? <Collapse /> : <Expand />}
            variant='text'
          />

          <IconButton
            className={cx(styles.header_iconBtn, styles.splitIcon)}
            onClick={this.handleSplitDocument}
            title='Split Document'
            icon={<Cut />}
            variant='text'
          />

          <div className={styles.header_inputPageNumber}>
            <span
              title='Total Pages'
              className={cx('unstyled-btn', styles.header_totalPageCount)}
            >
              {activePage}
            </span>
            <span className={styles.header_slashSeparator}>/</span>
            <span
              title='Total Pages'
              className={cx('unstyled-btn', styles.header_totalPageCount)}
            >
              {docFile && docFile.pages ? docFile.pages.length : ''}
            </span>
          </div>
        </div>
      </div>
    );
  };

  setPageHeights = (zoomValue = null, callback = null) => {
    const { docFile, zoom } = this.state;
    const { pages = [] } = docFile;
    let pageHeights = [];
    pages.map((page, index) => {
      const documentContainer =
        document.getElementById(`document-page-${index}`) || {};
      const { image } = page;
      if (!_.isEmpty(documentContainer)) {
        let documentHeight = 0;
        if (zoomValue) {
          documentHeight = documentContainer.offsetHeight;
          documentHeight = (documentHeight * zoomValue) / zoom;
        } else {
          const documentWidth = documentContainer.offsetWidth;
          const dimensionRatio = (documentWidth * 100) / image.width;
          documentHeight = (dimensionRatio * image.height) / 100;
        }
        pageHeights.push(documentHeight);
      }
    });
    this.setState({ pageHeights });
    if (callback) callback();
  };

  handleImageLoadSuccess = (url) => {
    let { imagesLoaded } = this.state;
    imagesLoaded.push(url);
  };

  renderSplitDocView = () => {
    const { docFile = {} } = this.state;
    const {
      classificationDocTypeOption,
      handleCloseScreen,
      getNextDocId,
      currentDocId,
      classifyActions,
      user,
      getDocData,
      config,
    } = this.props;
    return (
      <SplitDocumentView
        docFile={docFile}
        closeSplitDocumentView={this.closeSplitDocumentView}
        classificationDocTypeOption={classificationDocTypeOption}
        handleCloseScreen={handleCloseScreen}
        getNextDocId={getNextDocId}
        currentDocId={currentDocId}
        classifyActions={classifyActions}
        approveFlagChange={this.approveFlagChange}
        user={user}
        getDocData={getDocData}
        config={config}
      />
    );
  };

  renderPages = () => {
    const { imagesLoaded, pageHeights } = this.state;
    const { docFile } = this.props;
    const { pages } = docFile;
    if (!pageHeights.length) {
      this.setPageHeights();
    }
    return (
      <div className={styles.documentWrapper}>
        {pages.map((page, index) => {
          var styless = {
            width:
              imagesLoaded.length && imagesLoaded.includes(page.image.url)
                ? 'auto'
                : '85%',
            background: 'white',
            margin: '0 auto 14px',
            boxShadow: '0 6px 10px rgba(95, 95, 95, 0.5)',
            height: `${pageHeights[index]}px`,
            position: 'relative',
            display:
              imagesLoaded.length && imagesLoaded.includes(page.image.url)
                ? 'inline-block'
                : 'block',
          };
          const imageProgress =
            100 -
            (window.imageProgress &&
              window.imageProgress[`imageProgress-${index}`]);
          return (
            <div
              tabIndex={-1}
              id={`document-page-${index}`}
              key={`document-page-${index}`}
              className={styles.wrapper}
              style={styless}
            >
              <img
                alt=''
                style={{ width: '100%', height: '100%' }}
                loading='lazy'
                onLoad={() => this.handleImageLoadSuccess(page.image.url)}
              />
              <CircularProgressBar
                className={cx(
                  `${styles.circularProgressBar} page-loader-${index}`
                )}
                percentage={imageProgress || 0}
                strokeWidth={10}
              />
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    const { showSplitDocumentView } = this.state;
    return (
      <div className={styles.wrapper}>
        {showSplitDocumentView ? (
          this.renderSplitDocView()
        ) : (
          <>
            {this.renderHeader()}
            <PageScrollableContent
              className={styles.body}
              id='document-pages-wrapper'
              tabIndex={-1}
            >
              {this.renderPages()}
            </PageScrollableContent>
          </>
        )}
      </div>
    );
  }
}

export default withRouter(PDFDocumentView);
