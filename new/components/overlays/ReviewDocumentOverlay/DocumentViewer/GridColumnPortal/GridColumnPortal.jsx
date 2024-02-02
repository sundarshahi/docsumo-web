import React from 'react';

import ReactDOM from 'react-dom';

class GridColumnPortal extends React.Component {
  render() {
    const gridColumnPortal = document.getElementById('rt-column-portal');

    return ReactDOM.createPortal(this.props.children, gridColumnPortal);
  }
}

export default GridColumnPortal;
