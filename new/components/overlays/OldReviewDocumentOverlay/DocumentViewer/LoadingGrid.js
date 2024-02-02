import React, { Component } from 'react';

import _ from 'lodash';
import { ReactComponent as LoaderIcon } from 'new/assets/images/icons/loader.svg';

import styles from './GridRegion.scss';

class LoadingGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      style: {},
    };
    this.refGrid = React.createRef();
  }

  getPositions = () => {
    const { gridFetching, grid, docMeta } = this.props;
    if (gridFetching) {
      const { topLeft, bottomRight } = grid;
      const [x1, y1] = topLeft;
      const [x2, y2] = bottomRight;

      const {
        // status: docStatus,
        width: docWidth,
        height: docHeight,
      } = docMeta;

      const XD1 = (x1 / docWidth) * 100;
      const YD1 = (y1 / docHeight) * 100;
      const XD2 = (x2 / docWidth) * 100;
      const YD2 = (y2 / docHeight) * 100;

      const top = _.round(YD1, 4);
      const left = _.round(XD1, 4);
      const width = _.round(XD2 - XD1, 4);
      const height = _.round(YD2 - YD1, 4);

      const style = {
        top: `calc(${top}% - 20px)`,
        left: `calc(${left}% - 20px)`,
        width: `calc(${width}% + 41px)`,
        height: `calc(${height}% + 30px)`,
      };

      if (this.refGrid.current) {
        this.refGrid.current.style.top = style.top;
        this.refGrid.current.style.left = style.left;
        this.refGrid.current.style.width = style.width;
        this.refGrid.current.style.height = style.height;
      }
    }
  };

  componentDidMount() {
    //get grid position
    this.getPositions();
  }

  componentDidUpdate(prevProps) {
    const { gridFetching } = this.props;
    if (gridFetching !== prevProps.gridFetching) {
      this.getPositions();
    }
  }

  render() {
    return (
      <div
        className={styles.gridLoader}
        ref={this.refGrid}
        index={this.props.index}
      >
        <div className={styles.loaderIcon}>
          <LoaderIcon />
        </div>
      </div>
    );
  }
}

export default LoadingGrid;
