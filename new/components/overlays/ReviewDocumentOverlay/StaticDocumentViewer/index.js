import React, { Component } from 'react';

import cx from 'classnames';
import _ from 'lodash';
import { CircularProgressBar } from 'new/components/widgets/progress';
import * as documentConstants from 'new/constants/document';
import { DOCUMENT_ZOOM_VALUE } from 'new/constants/document';
import { imageDownloader } from 'new/helpers/downloads';

import ControlHeader from '../DocumentViewer/ControlHeader';

import styles from './index.scss';
class StaticDocumentViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      docDomWidth: null,
      docDomHeight: null,
      zoomedDoc: false,
      imgProgress: {},
      searchable: false,
    };
  }

  async componentDidMount() {
    this.downloadAllPageImages();
    this.resetDocumentState();
  }

  async componentDidUpdate(prevProps) {
    const { docId } = this.props;

    if (prevProps.docId && docId && prevProps.docId !== docId) {
      this.downloadAllPageImages();
    }
  }

  downloadAllPageImages = async () => {
    const pages = this.props.docMeta?.pages || [];
    const allPageHeights = [0];
    let startHeight = 0;
    window.imageProgress = {};

    // set image height and pages height to use in scroll.
    await pages.forEach(async ({ image }, index) => {
      const rtDocuemnt =
        document.getElementById(`rt-canvas-document-${index}`) || {};
      const loader = rtDocuemnt.querySelector(`.rt-canvas-loader-${index}`);
      const thisImg = rtDocuemnt.querySelector('img');

      const rtDocuemntWidth = rtDocuemnt.offsetWidth;
      const rtDocDimensionRetio =
        (rtDocuemntWidth * DOCUMENT_ZOOM_VALUE.BASE) / (image.width || 1653);
      let rtDocHeight = (rtDocDimensionRetio * (image.height || 2339)) / 100;
      rtDocHeight =
        rtDocHeight -
        (pages.length - 1 === index ? 0 : documentConstants.DOC_PADDING);

      rtDocuemnt.style.height = `${rtDocHeight}px`;
      rtDocuemnt.style.marginBottom = `${documentConstants.DOC_PADDING}px`;

      startHeight = startHeight + rtDocHeight;
      allPageHeights.push(startHeight);

      thisImg.style.height = `calc(100% + ${
        pages.length - 1 === index ? 0 : documentConstants.DOC_PADDING
      }px)`;

      window.imageProgress[`imageProgress-${index}`] = 0;

      const progress = ({ loaded, total }) => {
        window.imageProgress[`imageProgress-${index}`] = Math.round(
          (loaded / total) * 100
        );
      };

      await imageDownloader(image.url, thisImg, progress, true);
      thisImg.addEventListener('load', () => {
        loader.style.display = 'none';
      });
    });
  };

  resetDocumentState = () => {
    let docWrapperElement = document.getElementById('rt-document-wrapper');
    if (docWrapperElement) docWrapperElement.scrollTop = 115;
    this.setState(
      {
        zoomed: true,
      },
      () => this.setZoom(DOCUMENT_ZOOM_VALUE.BASE)
    );
  };

  /**
   * Handles page number change logic depdending upon zoom value
   *
   * LOGIC:
   * Calculate baseHeights of single document which will be same for all documents.
   * Then, calculate one percent value of baseHeight.
   * After that based on zoom value, subtract or add zoom pixel value on each document height
   * And compare it with wrapper scroll top offset to calculate page number.
   */
  handleWrapperScroll = (e) => {
    const documentScrollTop = e.target.scrollTop;

    const baseHeights =
      this.props.allPageHeights[1] + documentConstants.DOC_PADDING;

    const onePercentValueHeight = baseHeights / DOCUMENT_ZOOM_VALUE.BASE;

    const pageIndex = this.props.allPageHeights.findIndex((height, index) => {
      let updatedHeight = height;

      if (this.props.zoom > DOCUMENT_ZOOM_VALUE.BASE) {
        const additionalHeight =
          (this.props.zoom - DOCUMENT_ZOOM_VALUE.BASE) *
          onePercentValueHeight *
          index;
        updatedHeight = updatedHeight + additionalHeight;
      }

      if (this.props.zoom < DOCUMENT_ZOOM_VALUE.BASE) {
        const additionalHeight =
          (DOCUMENT_ZOOM_VALUE.BASE - this.props.zoom) *
          onePercentValueHeight *
          index;
        updatedHeight = updatedHeight - additionalHeight;
      }

      return updatedHeight > documentScrollTop && documentScrollTop !== 0;
    });

    this.props.handlePageChange(pageIndex < 0 ? 1 : pageIndex);
  };

  handleResize = (width, height) => {
    this.setState({
      docDomWidth: width,
      docDomHeight: height,
    });
  };

  handleDocumentWrapperScroll = (e) => {
    this.handleWrapperScroll(e);
    this.props.onDocumentWrapperScroll(e);
  };

  setZoom = async (value) => {
    const { docMeta, zoom } = this.props;
    //const { pages = [] } = docMeta;
    const pages = this.props.docMeta?.pages || [];
    const pageHeights = [0];
    let startHeight = 0;

    await pages.map(async (page, index) => {
      const rtDocuemnt =
        document.getElementById(`rt-canvas-document-${index}`) || {};
      let rtDocuemntHeight = rtDocuemnt.offsetHeight;
      rtDocuemntHeight = (rtDocuemntHeight * value) / zoom;
      rtDocuemnt.style.height = `${rtDocuemntHeight}px`;
      startHeight = startHeight + rtDocuemntHeight;
      await pageHeights.push(startHeight);
    });
    document.pageHeights = pageHeights;
    this.props.onZoomChange({
      value,
    });
  };

  handleZoomInClick = () => {
    let newZoomValue = Math.round((this.props.zoom + 10) / 10) * 10;
    if (newZoomValue > DOCUMENT_ZOOM_VALUE.MAX) {
      newZoomValue = newZoomValue - 10;
    }
    this.setZoom(newZoomValue);
  };

  handleZoomOutClick = () => {
    let newZoomValue = Math.round((this.props.zoom - 10) / 10) * 10;
    if (newZoomValue < DOCUMENT_ZOOM_VALUE.MIN) {
      newZoomValue = newZoomValue + 10;
    }
    this.setZoom(newZoomValue);
  };

  handleDebouncedSearchInput = _.debounce((value) => {
    this.handleSearchInput(value);
  }, 500);

  handleSearchInputChange = (value) => {
    this.setState({ searchInputName: value });
    this.handleDebouncedSearchInput(value);
  };

  handleShrinkExpandButtonClick = () => {
    this.setState(
      {
        zoomed: !this.state.zoomed,
      },
      () => {
        this.setZoom(this.state.zoomed ? 100 : 80);
      }
    );
  };

  handlePageChange = (e) => {
    const { handlePageChange } = this.props;
    let page = e.target.value;
    const pageHeights = document.pageHeights;
    page = pageHeights.length - 1 < page ? pageHeights.length - 1 : page;
    if (!page) {
      return handlePageChange('');
    }
    if (page > 0) {
      handlePageChange(page);
      const pageHeights = document.pageHeights[page - 1];
      const documentWrapperNode = document.getElementById(
        'rt-document-wrapper'
      );
      documentWrapperNode.scrollTo(
        documentWrapperNode.scrollLeft,
        pageHeights + (page - 1) * documentConstants.DOC_PADDING
      );
    }
  };

  setDebouncedZoom = _.debounce((newValue) => {
    this.setZoom(newValue);
  }, 150);

  render() {
    const { zoom, currentPage } = this.props;
    const pages = this.props.docMeta?.pages || [];
    const { zoomed } = this.state;

    const documentBoxStyle = {
      width: `${zoom}%`,
    };

    return (
      <div className={styles.root}>
        <div
          id={'rt-document-wrapper'}
          className={styles.documentWrapper}
          onScroll={this.handleDocumentWrapperScroll}
        >
          {/* RT document portal for rendering dropdown component */}
          <div id='rt-document-portal' />
          <div className={styles.documentBox} style={documentBoxStyle}>
            <div className={cx(styles.document)} id={'rt-document'}>
              {pages.map((page, index) => {
                const imageProgress =
                  window.imageProgress &&
                  window.imageProgress[`imageProgress-${index}`];
                /* eslint-disable jsx-a11y/no-static-element-interactions */
                return (
                  <div
                    className={styles.documentPage}
                    id={`rt-canvas-document-${index}`}
                    key={[page.id, page.image.url].join('-')}
                    style={{ width: '100%' }}
                  >
                    <CircularProgressBar
                      className={`${styles.circularProgressBar} rt-canvas-loader-${index}`}
                      percentage={imageProgress || 0}
                      strokeWidth={10}
                    />
                    <img
                      alt=''
                      className={styles.documentImg}
                      onLoad={() =>
                        this.props.onPageImageLoadSuccess(page.image.url)
                      }
                      onError={() =>
                        this.props.onPageImageLoadError(page.image.url)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <ControlHeader
          zoom={zoom}
          zoomed={zoomed}
          currentPage={currentPage}
          pages={pages}
          showSearch={false}
          showSplitDocument={false}
          handleSplitDocument={this.handleSplitDocument}
          handlePageChange={this.handlePageChange}
          handleZoomInClick={this.handleZoomInClick}
          handleZoomOutClick={this.handleZoomOutClick}
          setDebouncedZoom={this.setDebouncedZoom}
          handleShrinkExpandButtonClick={this.handleShrinkExpandButtonClick}
        />
      </div>
    );
  }
}

export default StaticDocumentViewer;
