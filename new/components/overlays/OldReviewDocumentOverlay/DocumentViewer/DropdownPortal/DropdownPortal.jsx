import React from 'react';

import ReactDOM from 'react-dom';

class DropdownPortal extends React.Component {
  render() {
    const dropdownPortalEl = document.getElementById('rt-document-portal');

    return ReactDOM.createPortal(this.props.children, dropdownPortalEl);
  }
}

export default DropdownPortal;
