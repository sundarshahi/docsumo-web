import React from 'react';
import { useSelector } from 'react-redux';

import cx from 'classnames';
import { Cancel, NavArrowDown, NavArrowUp } from 'iconoir-react';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Input from 'new/ui-elements/Input/Input';
import Tooltip from 'new/ui-elements/Tooltip';

import searchStyles from './TextSearchBox.scss';

const TextSearchBox = ({
  searchInputName,
  activeSearch,
  handleSearchInputChange,
  handleChangeActiveSearch,
  handleSearchClick,
  searchInputRef,
}) => {
  const { docuSearchBbox } = useSelector((state) => state.documents.reviewTool);

  return (
    <div className={cx(searchStyles.search)}>
      <div className={searchStyles.searchInputBox}>
        <Input
          ref={searchInputRef}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          onKeyPress={(e) =>
            e.key === 'Enter'
              ? handleChangeActiveSearch(activeSearch + 1)
              : null
          }
          title='Enter finding keyword'
          value={searchInputName}
          data-hj-allow
          placeholder='Search'
        />
        <div className={searchStyles.countBox}>
          <span className={searchStyles.searchCount} title='Current Find'>
            {docuSearchBbox && docuSearchBbox.length ? activeSearch + 1 : 0}
          </span>
          <div className={searchStyles.pageSeparator} />
          <span className={searchStyles.searchCount} title='Total Finds'>
            {docuSearchBbox ? docuSearchBbox.length : 0}
          </span>
        </div>
      </div>
      <Tooltip label='Find Prev'>
        <IconButton
          onClick={() => handleChangeActiveSearch(activeSearch - 1)}
          variant='text'
          icon={<NavArrowDown />}
        />
      </Tooltip>
      <Tooltip label='Find Next (Enter)'>
        <IconButton
          onClick={() => handleChangeActiveSearch(activeSearch + 1)}
          variant='text'
          icon={<NavArrowUp />}
        />
      </Tooltip>
      <Tooltip label='Close (Esc)'>
        <IconButton
          onClick={() => handleSearchClick(false)}
          variant='text'
          icon={<Cancel />}
        />
      </Tooltip>
    </div>
  );
};

export default TextSearchBox;
