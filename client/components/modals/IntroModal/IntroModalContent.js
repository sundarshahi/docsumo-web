import React, { Component } from 'react';

import cx from 'classnames';
import { ReactComponent as ChevronLeftIcon } from 'images/icons/chevron-left.svg';
import { ReactComponent as ChevronRightIcon } from 'images/icons/chevron-right.svg';
import { ReactComponent as ClearIcon } from 'images/icons/clear.svg';
import PropTypes from 'prop-types';

import styles from './introModalContent.scss';

class IntroModalContent extends Component {
  static propTypes = {
    content: PropTypes.array.isRequired,
    onCloseBtnClick: PropTypes.func.isRequired,
  };

  state = {
    currentScreenIndex: 0,
  };

  handleCloseBtnClick = () => {
    this.props.onCloseBtnClick();
  };

  handleNavigationDotClick = (index) => {
    if (index === this.state.currentScreenIndex) {
      return;
    }

    this.setState({
      currentScreenIndex: index,
    });
  };

  handleNavigationPrevBtnClick = () => {
    if (this.state.currentScreenIndex > 0) {
      this.setState({
        currentScreenIndex: this.state.currentScreenIndex - 1,
      });
    }
  };

  handleNavigationNextBtnClick = () => {
    if (this.state.currentScreenIndex < this.props.content.length - 1) {
      this.setState({
        currentScreenIndex: this.state.currentScreenIndex + 1,
      });
    }
  };

  renderScreenContent = () => {
    const { content } = this.props;
    const { currentScreenIndex } = this.state;
    const screenContent = content[currentScreenIndex];

    if (!screenContent) {
      return null;
    }

    const { type, title, description, youtubeVideoId, startSecond, url } =
      screenContent;

    return (
      <div className={styles.screen}>
        <div className={styles.header}>
          {type === 'youtube_video' ? (
            <div className={styles.ytVideo}>
              <iframe
                title={title}
                allowFullScreen='allowFullScreen'
                src={`https://www.youtube.com/embed/${youtubeVideoId}?ecver=1&amp;iv_load_policy=3&amp;rel=0&amp;showinfo=0&amp;yt:stretch=16:9&amp;autohide=1&amp;color=white&amp;start=${
                  startSecond || 0
                }&amp;width=560&amp;width=560`}
                width='560'
                height='315'
                allowTransparency='true'
                frameBorder='0'
              />
            </div>
          ) : null}

          {type === 'image' ? (
            <div
              className={styles.image}
              style={{ backgroundImage: `url(${url})` }}
            />
          ) : null}
        </div>
        <div className={styles.body}>
          <h2 className={styles.title}>{title}</h2>

          <p className={styles.description}>{description}</p>
        </div>
      </div>
    );
  };

  renderNavigationDots = () => {
    const { content } = this.props;
    const { currentScreenIndex } = this.state;

    if (content.length <= 1) {
      return null;
    }

    return (
      <ol className={styles.navigationDots}>
        {content.map((item, index) => {
          return (
            <li
              key={`${index}-${item.title}-${item.url}`}
              className={cx({
                [styles.isSelected]: index === currentScreenIndex,
              })}
            >
              <button onClick={() => this.handleNavigationDotClick(index)} />
            </li>
          );
        })}
      </ol>
    );
  };

  renderNavigationArrows = () => {
    const { content } = this.props;
    const { currentScreenIndex } = this.state;

    if (content.length <= 1) {
      return null;
    }

    const disabledPrevBtn = currentScreenIndex === 0;
    const disabledNextBtn = currentScreenIndex === content.length - 1;

    return (
      <div className={styles.navigationArrows}>
        <button
          disabled={disabledPrevBtn}
          onClick={this.handleNavigationPrevBtnClick}
        >
          <ChevronLeftIcon />
        </button>

        <button
          disabled={disabledNextBtn}
          onClick={this.handleNavigationNextBtnClick}
        >
          <ChevronRightIcon />
        </button>
      </div>
    );
  };

  render() {
    return (
      <div className={styles.root}>
        {this.renderNavigationDots()}
        {this.renderNavigationArrows()}
        {this.renderScreenContent()}

        <button
          title='Close'
          className={cx('unstyled-btn', styles.closeBtn)}
          onClick={this.handleCloseBtnClick}
        >
          <ClearIcon />
        </button>
      </div>
    );
  }
}

export default IntroModalContent;
