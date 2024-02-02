import React from 'react';

import ReactDOM from 'react-dom';

class DocumentPortal extends React.Component {
  render() {
    const documentPortalEl = document.getElementById('rt-document-portal');

    return ReactDOM.createPortal(this.props.children, documentPortalEl);
  }
}

export default DocumentPortal;
