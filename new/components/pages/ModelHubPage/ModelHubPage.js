import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';
import { actions as requestActions } from 'new/redux/requests/actions';
import { actions as servicesActions } from 'new/redux/services/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { Cancel, PageFlip } from 'iconoir-react';
import mixpanel from 'mixpanel-browser';
import { PageMetadata } from 'new/components/layout/page';
import * as apiConstants from 'new/constants/api';
import history from 'new/history';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Badge from 'new/ui-elements/Badge';

import ModelCard from './components/ModelCard';
import {
  CARD_DATA,
  IMAGE_MAP,
} from './components/ModelDataMapper/ModelDataMapper';
import SearchBox from './components/SearchBox';
import SkeletonLoader from './components/SkeletonLoader/SkeletonLoader';

import styles from './modelHubPage.scss';

let colorArray = [
  '#A8B3E0',
  '#D1ACBB',
  '#DADAA8',
  '#F8CA98',
  '#ACD7D2',
  '#E0CFA8',
];
const ModelHubPage = (props) => {
  const [searchValue, setSearchValue] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [popularModel, setPopularModel] = useState([]);
  const [apiCategory, setApiCategory] = useState([]);
  const [cardValue, setCardValue] = useState('');

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearchValue(value);
  };
  const { services } = props;
  const handleSearchClear = () => {
    setSearchValue('');
  };

  useEffect(() => {
    const { servicesActions } = props;
    let queryParams = {
      custom_dt: false,
    };
    servicesActions.servicesFetch({ queryParams });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchValue) {
      const filteredServices = services.filter(
        (api) =>
          api.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          (api.description &&
            api.description.toLowerCase().includes(searchValue.toLowerCase()))
      );

      const modifiedServices = mapModifiedServices(filteredServices);
      if (cardValue) {
        const cardFilterServices = modifiedServices?.filter((item) =>
          item?.tagCategory?.includes(cardValue)
        );
        setFilteredServices(cardFilterServices);
      } else {
        setFilteredServices(modifiedServices);
      }
    } else {
      const modifiedServices = mapModifiedServices(services);
      var categoryFilterValue = services?.map((item) => item.category);
      categoryFilterValue = [...new Set(categoryFilterValue)];
      categoryFilterValue = categoryFilterValue.map((item) => ({
        category: item,
        title: item,
      }));
      setApiCategory(categoryFilterValue);
      let popularModel = services?.filter((service) => service.popularRank);
      popularModel = popularModel?.sort(
        (a, b) => a.popularRank - b.popularRank
      );
      if (cardValue) {
        const cardFilterServices = modifiedServices?.filter((item) =>
          item?.tagCategory?.includes(cardValue)
        );
        const cardPopularModelFilterServices = popularModel?.filter((item) =>
          item?.tagCategory?.includes(cardValue)
        );
        setFilteredServices(cardFilterServices);
        setPopularModel(cardPopularModelFilterServices);
      } else {
        setFilteredServices(modifiedServices);
        setPopularModel(popularModel);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, searchValue, cardValue]);

  const mapModifiedServices = useCallback((services) => {
    const modifiedServices = services?.map((item, idx) => {
      return {
        ...item,
        icon: IMAGE_MAP.find((itm) => itm.value === item.value)?.icon || (
          <PageFlip />
        ),
        name: item.title,
        title: item.title,
        content: item.description,
        value: item.value,
        category: item.category,
        tagCategory: item.tagCategory,
        index: idx,
        apiDoc: item.apiDoc,
      };
    });
    return modifiedServices;
  }, []);

  const handleDocumentType = (api) => {
    const {
      user,
      config: { canSwitchToOldMode = true },
    } = props;

    mixpanel.track(MIXPANEL_EVENTS.use_doc_type, {
      'work email': user.email,
      'organization ID': user.orgId,
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
      docType: api.value ? api.value : 'Custom - Document',
      isCustomDocType: !api.value,
      origin: 'AI Models Hub',
    });

    history.push('/');
    props.documentActions.displaySelectDocumentTypeModal(true);
    props.documentActions.selectedService({
      documentTypeModel: api,
    });
  };

  const handleCardFilter = (value) => {
    const {
      user,
      config: { canSwitchToOldMode = true },
    } = props;

    if (value === cardValue) {
      setCardValue('');
    } else {
      setCardValue(value);

      mixpanel.track(MIXPANEL_EVENTS.select_filter_tag, {
        'work email': user.email,
        'organization ID': user.orgId,
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
        category: value,
        origin: 'AI Models Hub',
      });
    }
  };

  const renderModelList = (item, index) => {
    return (
      <div key={index} className={styles.modellist}>
        <div className={styles.modellist__title}>{item.title}</div>
        <div className={styles.modellist__cardcollection}>
          {item.list.map((itm, idx) => {
            return (
              <ModelCard
                key={idx}
                item={itm}
                colorArray={colorArray}
                handleDocumentType={handleDocumentType}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const renderCustomModelList = () => {
    return (
      <div className={styles.modellist}>
        <div className={styles.modellist__title}>Train Your Own</div>
        <div className={styles.modellist__cardcollection}>
          <ModelCard
            isCustom={true}
            colorArray={colorArray}
            handleDocumentType={handleDocumentType}
          />
        </div>
      </div>
    );
  };

  const renderPopularModelList = () => {
    const modifiedPopularModel = mapModifiedServices(popularModel);
    return (
      <div className={styles.modellist}>
        <div className={styles.modellist__title}>Popular Models</div>
        <div className={styles.modellist__cardcollection}>
          {modifiedPopularModel?.map((itm, idx) => {
            return (
              <ModelCard
                key={idx}
                item={itm}
                colorArray={colorArray}
                handleDocumentType={handleDocumentType}
              />
            );
          })}
          {
            <ModelCard
              isCustom={true}
              colorArray={colorArray}
              handleDocumentType={handleDocumentType}
            />
          }
        </div>
      </div>
    );
  };

  let apiGroupList = apiCategory?.map((item) => {
    return {
      title: item.title,
      category: item.category,
      list: filteredServices.filter((api) => api.category === item.category),
    };
  });
  apiGroupList = apiGroupList?.filter((item) => item.list.length > 0);
  const { isFetchingServices, fetchSucceeded } = props;
  if (isFetchingServices) {
    return <SkeletonLoader />;
  }

  /* 
  We have two filter options. One is using the search query and other using the tag. We can also combine 
  the filter options and based on that we have a search query text
    i. Search results for searchquery
    ii. Search results for tags
    iii. Search results for search query and tags
  */
  const noSearchResult = !filteredServices?.length;
  const searchQueryandTag = searchValue && cardValue;
  const searchQueryAndNoTag = searchValue && !cardValue;
  const tagAndNoSearchQuery = cardValue && !searchValue;

  return (
    <div className={styles.root}>
      <PageMetadata title='AI Model Hub' />
      <div className={styles.head}>
        <div className={styles.head__title}>AI Models Hub</div>
        <div className={styles.head__subtitle}>
          Choose from a list of 50+ ready-to-use models
        </div>
        <div className={styles.head__search}>
          <SearchBox
            name='apiSearch'
            value={searchValue}
            onChange={handleSearchChange}
            onClear={handleSearchClear}
          />
        </div>
        <div className={styles.head__cardsection}>
          {CARD_DATA?.map((item, idx) => {
            return (
              <Badge
                className={cx(styles.head__card, 'cursor-pointer', {
                  [styles['head__card--selected']]: item.value === cardValue,
                })}
                title={item.name}
                onClick={() => handleCardFilter(item.value)}
                key={idx}
                iconClassName={styles['head__card--icon']}
                iconDirection='right'
                CustomIcons={
                  item.value === cardValue ? (
                    <Cancel width={16} height={16} strokeWidth={2} />
                  ) : null
                }
                size='lg'
              />
            );
          })}
        </div>
      </div>
      {noSearchResult && (
        <div className={styles.searchresult}>No results found</div> //no search results
      )}
      {!noSearchResult && searchQueryandTag && (
        <div className={styles.searchresult}>
          {`Search results for ${searchValue} and ${
            CARD_DATA?.find((itm) => itm.value === cardValue)?.name
          }`}
        </div> //both search query and tags
      )}
      {!noSearchResult && searchQueryAndNoTag && (
        <div className={styles.searchresult}>
          {`Search results for ${searchValue}`}
        </div> //only search query and no tag
      )}
      {!noSearchResult && tagAndNoSearchQuery && (
        <div className={styles.searchresult}>
          {`Search results for ${
            CARD_DATA?.find((itm) => itm.value === cardValue)?.name
          }`}
        </div> //only tag and no search query
      )}
      <div className={styles.modelcontent}>
        {popularModel?.length > 0 &&
          !(searchValue || cardValue) &&
          renderPopularModelList()}
        {apiGroupList.map((item, index) => {
          return renderModelList(item, index);
        })}
        {!(searchValue || cardValue) ? renderCustomModelList() : null}
        {fetchSucceeded && !filteredServices?.length && renderCustomModelList()}
      </div>
    </div>
  );
};
function mapStateToProp(state) {
  const { services, meta, fetchState, updatingServiceIds } =
    state.services.servicePage;

  const { user, config } = state.app;

  const isFetchingServices = fetchState === apiConstants.FETCH_STATES.FETCHING;
  const fetchSucceeded = fetchState === apiConstants.FETCH_STATES.SUCCESS;
  const fetchFailed = fetchState === apiConstants.FETCH_STATES.FAILURE;

  return {
    services,
    meta,
    fetchState,
    isFetchingServices,
    fetchSucceeded,
    fetchFailed,
    user,
    config,
    updatingServiceIds,
    // showAutoClassifyPopUpModal,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    requestActions: bindActionCreators(requestActions, dispatch),
    servicesActions: bindActionCreators(servicesActions, dispatch),
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}
export default connect(mapStateToProp, mapDispatchToProps)(ModelHubPage);
