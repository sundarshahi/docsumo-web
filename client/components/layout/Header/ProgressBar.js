import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import styles from './progressBar.scss';

class ProgressBar extends Component {
  static propTypes = {
    progress: PropTypes.number.isRequired,
    minProgress: PropTypes.number,
  };

  state = {
    percent: 0,
    activeRequest: null,
  };

  componentDidMount() {
    this.mounted = true;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const nextActiveRequest = nextProps.activeRequest;
    const { activeRequest } = this.state;

    if (nextActiveRequest) {
      if (activeRequest) {
        this.resetProgress(nextActiveRequest);
      } else {
        this.startProgress(nextActiveRequest);
      }
    } else {
      if (activeRequest) {
        this.stopProgress();
      }
    }

    // if (nextActiveRequest !== activeRequest) {
    //     if (activeRequest) {
    //         this.stopProgress();
    //     }

    //     if (nextActiveRequest) {
    //         this.startProgress(nextActiveRequest);
    //     }
    // }
  }

  componentWillUnmount() {
    this.mounted = false;
    this.progressIntervalId && clearInterval(this.progressIntervalId);
  }

  startProgress = (activeRequest) => {
    this.setState({
      percent: 0,
      activeRequest: activeRequest,
    });
    this.progressIntervalId = setInterval(this.increaseProgress, 150);
  };

  increaseProgress = () => {
    this.mounted &&
      this.setState({
        percent: this.newPercent(this.state.percent),
      });
  };

  resetProgress = (nextActiveRequest) => {
    this.setState({
      percent: 0,
      activeRequest: nextActiveRequest,
    });
  };

  stopProgress = () => {
    this.progressIntervalId && clearInterval(this.progressIntervalId);
    this.setState(
      {
        percent: 100,
      },
      () => {
        setTimeout(() => {
          this.mounted &&
            this.setState({
              percent: 0,
              activeRequest: null,
            });
        }, 300);
      }
    );
  };

  newPercent = (currentPercent, progressIncrease = 5) => {
    // Use cosine as a smoothing function
    // It could be any function to slow down progress near the ending 100%
    const smoothedProgressIncrease =
      progressIncrease * Math.cos(currentPercent * (Math.PI / 2 / 100));
    const newPercent = currentPercent + smoothedProgressIncrease;
    return newPercent;
  };

  render() {
    const { percent } = this.state;

    return (
      <div className={styles.root}>
        {percent ? (
          <div
            className={styles.fill}
            style={{
              width: `${percent}%`,
            }}
          />
        ) : null}
      </div>
    );
  }
}

function mapStateToProp({ requests }) {
  const activeRequestName = Object.keys(requests).find((name) => {
    return requests[name].isFetching && requests[name].showLoader;
  });

  const activeRequest = activeRequestName ? requests[activeRequestName] : null;

  // console.log('requests', JSON.stringify(requests));
  // console.log('activeRequestName', activeRequestName);

  return {
    activeRequest,
  };
}

export default connect(mapStateToProp)(ProgressBar);
