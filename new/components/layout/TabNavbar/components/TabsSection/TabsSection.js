import React from 'react';

import Tabs from 'new/ui-elements/Tabs';

import { DOCUMENTS_ROUTES } from '../../constants';

import styles from './TabsSection.scss';

function TabsSection(props) {
  const { activeTab, documentCounts, onTabChange } = props;

  const getTotalDocumentsCount = (tab) => {
    const count =
      documentCounts[tab] >= 10000
        ? Math.floor(documentCounts[tab] / 1000) + 'K'
        : documentCounts[tab] || 0;

    return count;
  };

  const getTabHeaders = () => {
    const tabHeaders = [];

    DOCUMENTS_ROUTES.map(({ icon, title, url, counts }) => {
      tabHeaders.push({
        url,
        icon,
        header: title,
        count: getTotalDocumentsCount(counts),
        className: title === 'Processed' ? 'UFTooltipProcessed' : '',
      });
    });

    return tabHeaders;
  };

  return (
    <Tabs
      tabHeaders={getTabHeaders()}
      activeTab={activeTab}
      onTabChange={onTabChange}
      className={styles.container}
    />
  );
}

export default TabsSection;
