import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { Cancel } from 'iconoir-react';
import _ from 'lodash';
import documentPreviewPlaceholderUrl from 'new/assets/images/document-preview-placeholder.svg';
import Modal from 'new/ui-elements/Modal';
import ReactResizeDetector from 'react-resize-detector';

import styles from './index.scss';

const DocumentPreview = (props) => {
  const {
    image,
    width: appWidth = 0,
    height: appHeight = 0,
    onCloseBtnClick,
  } = props;

  const imageAvailable = image && !_.isEmpty(image);
  let imageUrl;
  let rootStyle;

  if (imageAvailable) {
    const { url, width, height } = image;

    const maxWidth = Math.floor(0.9 * appWidth);
    const maxHeight = Math.floor(0.9 * appHeight);

    let imgWidth;
    let imgHeight;

    if (width < maxWidth && height < maxHeight) {
      imgWidth = width;
      imgHeight = height;
    } else {
      const scalingFactor1 = maxWidth / width;
      const scalingFactor2 = maxHeight / height;
      const finalScalingFactor = Math.min(scalingFactor1, scalingFactor2) || 0;
      imgWidth = Math.floor(width * finalScalingFactor);
      imgHeight = Math.floor(height * finalScalingFactor);
    }

    imageUrl = url;
    rootStyle = {
      width: imgWidth,
      height: imgHeight,
    };
  } else {
    imageUrl = documentPreviewPlaceholderUrl;
    rootStyle = {
      width: 400,
      height: 550,
    };
  }

  return (
    <div className={styles.root} style={rootStyle}>
      <img src={imageUrl} alt='Preview' />

      {!imageAvailable ? (
        <div className={styles.placeholderTextContainer}>
          <p>Preview not available</p>
        </div>
      ) : null}

      <button
        title='Close preview'
        className={cx('unstyled-btn', styles.closeBtn)}
        onClick={onCloseBtnClick}
      >
        <Cancel />
      </button>
    </div>
  );
};

class DocPreviewModal extends Component {
  state = {
    showModal: false,
  };

  componentDidUpdate(prevProps) {
    const documentId = _.get(this.props.document, 'docId');
    const prevDocumentId = _.get(prevProps.document, 'docId');

    if (documentId && documentId !== prevDocumentId) {
      this.setState({ showModal: true });
    }
  }

  handleExit = () => {
    this.props.documentActions.closePreview();
    this.setState({ showModal: false });
  };

  render() {
    const { document } = this.props;
    if (!document || !_.isObject(document)) {
      return null;
    }

    const image = document.previewImage;

    const rootProps = {
      titleText: 'Preview',
      focusDialog: true,
      underlayClickExits: true,
      verticallyCenter: true,
      onExit: this.handleExit,
    };

    const previewProps = {
      image,
      onCloseBtnClick: this.handleExit,
    };

    return (
      <Modal
        show={true}
        onCloseHandler={this.handleExit}
        className={styles.previewModal}
      >
        <ReactResizeDetector handleWidth handleHeight resizableElementId='app'>
          <DocumentPreview {...previewProps} />
        </ReactResizeDetector>
      </Modal>
    );
  }
}

function mapStateToProp({ documents }) {
  const { previewDocId, documentsById } = documents;

  const document = previewDocId && documentsById[previewDocId];

  return {
    document,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(DocPreviewModal);
