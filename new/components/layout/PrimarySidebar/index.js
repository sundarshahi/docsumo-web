import React, { Component } from 'react';

import cx from 'classnames';
import { NavArrowLeft } from 'iconoir-react';
import { ReactComponent as DocsumoIcon } from 'new/assets/images/docsumo/icon.svg';
import { ReactComponent as DocsumoLogo } from 'new/assets/images/docsumo/logo-brand-color.svg';

import Navigation from './Navigation';

import styles from './index.scss';

class PrimarySidebar extends Component {
  state = {
    isCollapsed: false,
    isNewDropdownVisible: false,
  };

  toggleCollapse = () => {
    this.setState({
      isCollapsed: !this.state.isCollapsed,
    });
  };

  toggleNewDropdown = () => {
    this.setState({
      isNewDropdownVisible: !this.state.isNewDropdownVisible,
    });
  };

  render() {
    const { globalMyDocumentCounts } = this.props;

    const { isCollapsed, isNewDropdownVisible } = this.state;

    return (
      <aside className={cx(styles.root, { [styles.collapsed]: isCollapsed })}>
        <header className={styles.header}>
          <div
            className={cx(styles.imageContainer, {
              [styles.invisible]: isCollapsed,
            })}
          >
            <DocsumoLogo className={styles.logo} />
          </div>
          <div
            className={cx(styles.imageContainer, {
              [styles.invisible]: !isCollapsed,
            })}
          >
            <DocsumoIcon className={styles.icon} />
          </div>
        </header>

        <button onClick={this.toggleCollapse} className={styles.toggleButton}>
          <NavArrowLeft fontSize='12px' />
        </button>

        <Navigation
          isCollapsed={isCollapsed}
          isNewDropdownVisible={isNewDropdownVisible}
          globalMyDocumentCounts={globalMyDocumentCounts}
          onNewBtnClick={this.toggleNewDropdown}
          onNewDropdownOutsideClick={this.toggleNewDropdown}
        />
      </aside>
    );
  }
}

export default PrimarySidebar;
