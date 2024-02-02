/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { memo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';

import cx from 'classnames';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';
import mixpanel from 'mixpanel-browser';
import { ReactComponent as ArrowActiveIcon } from 'new/assets/images/icons/arrow-active.svg';
import { HelpTooltip } from 'new/components/widgets/tooltip';
import * as documentConstants from 'new/constants/document';
import ttConstants from 'new/constants/helpTooltips';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Skeleton from 'new/ui-elements/Skeleton/Skeleton';
import Tooltip from 'new/ui-elements/Tooltip';

import Field from './Field';
import LineItemField from './LineItemField';

import styles from './sectionList.scss';

const Section = memo(
  (props) => {
    const {
      section,
      docReadOnly,
      onSidebarLineItemFieldClick,
      onSidebarFieldInputFocus,
      onSidebarReadOnlyFieldClick,
      onSidebarFieldInputValueChange,
      onSidebarFieldInputFormSubmit,
      toolTipView,
      lineItemTooltip,
      onRegionFieldInputValueChange,
      onRegionFieldInputRemoveBtnClick,
      onRegionFieldInputSubmitBtnClick,
      onRegionFieldInputFormSubmit,
      scrollSectionFieldIntoView,
      id,
      user = {},
      config: { canSwitchToOldMode = true } = {},
      docMeta = {},
      docId = '',
    } = props;
    const sectionRef = useRef(null);
    const { type, title, fieldIds } = section;

    const { collapsedSectionIds, selectedSectionId, selectedSectionFieldId } =
      useSelector((state) => state.documents.reviewTool);

    const dispatch = useDispatch();

    const isSectionCollapsed = collapsedSectionIds.includes(id);

    useEffect(() => {
      if (!collapsedSectionIds?.includes(id)) {
        // Expand the section
        sectionRef.current.style.height = 'auto';
        sectionRef.current.style.opacity = 1;
      } else {
        // Collapse the section
        sectionRef.current.style.height = '0';
        sectionRef.current.style.opacity = 0;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collapsedSectionIds]);

    const handleCollapseExpandMixpanelTrack = (action, id) => {
      mixpanel.track(MIXPANEL_EVENTS[action], {
        docId: docId,
        docType: docMeta?.type,
        'work email': user?.email,
        version: 'new',
        origin: 'Review Screen',
        sectionId: id,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    };
    const toggleSectionCollapse = (id) => {
      if (collapsedSectionIds?.includes(id)) {
        handleCollapseExpandMixpanelTrack('section_field_expand', id);
        dispatch(
          documentActions.updateCollapsedSectionIds({
            collapsedSectionIds: collapsedSectionIds.filter(
              (item) => item !== id
            ),
          })
        );
      } else {
        if (fieldIds.includes(selectedSectionFieldId)) {
          dispatch(
            documentActions.rtSetSelectedFieldId({
              sectionFieldId: null,
              lineItemRowId: null,
              fieldId: null,
              lineItemFooterBtn: null,
              sectionId: id,
            })
          );
        }
        handleCollapseExpandMixpanelTrack('section_field_collapse', id);

        dispatch(
          documentActions.updateCollapsedSectionIds({
            collapsedSectionIds: [...collapsedSectionIds, id],
          })
        );
      }
    };

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className={cx(styles.reviewSection, styles.reviewSection__borderBottom)}
      >
        <div className={styles.reviewSection__header}>
          <h2
            className={cx(
              styles['reviewSection__header--title'],
              'text-truncate'
            )}
            title={title}
          >
            {title}
          </h2>
          <Tooltip
            placement='right'
            label={isSectionCollapsed ? 'Expand' : 'Collapse'}
            className={styles.reviewSection__btnTooltip}
          >
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <span
              tabIndex={-1}
              id={`js-section-arrow-${id}`}
              className={styles.reviewSection__collapseBtn}
              onClick={() => toggleSectionCollapse(id)}
            >
              {!isSectionCollapsed ? (
                <NavArrowUp />
              ) : id === selectedSectionId ? (
                <ArrowActiveIcon />
              ) : (
                <NavArrowDown />
              )}
            </span>
          </Tooltip>
        </div>
        <div
          className={cx(styles.content, {
            [styles['content--collapse']]: isSectionCollapsed,
          })}
          ref={sectionRef}
        >
          {fieldIds.map((fieldId, idx) => {
            if (type === documentConstants.FIELD_TYPES.LINE_ITEM) {
              return (
                <HelpTooltip
                  key={idx}
                  id={
                    lineItemTooltip.id === fieldId &&
                    ttConstants.TT_REVIEW_SCRREN_LINE_ITEM_SECTION
                  }
                  onNext={() =>
                    onSidebarLineItemFieldClick({
                      fieldId,
                      tooltip: true,
                    })
                  }
                >
                  <LineItemField
                    key={fieldId}
                    fieldId={fieldId}
                    docReadOnly={docReadOnly}
                    onSidebarLineItemFieldClick={onSidebarLineItemFieldClick}
                    classNames={ttConstants.TT_REVIEW_SCRREN_LINE_ITEM_SECTION}
                  />
                </HelpTooltip>
              );
            }

            return (
              <HelpTooltip
                key={fieldId}
                id={
                  toolTipView &&
                  idx === 0 &&
                  ttConstants.TT_REVIEW_SCRREN_LABLE_VALUE
                }
              >
                <Field
                  className={idx === 0 ? 'UFTooltipReview1' : ''}
                  fieldId={fieldId}
                  docReadOnly={docReadOnly}
                  lineItemTooltip={lineItemTooltip}
                  onSidebarLineItemFieldClick={onSidebarLineItemFieldClick}
                  onSidebarFieldInputFocus={onSidebarFieldInputFocus}
                  onSidebarReadOnlyFieldClick={onSidebarReadOnlyFieldClick}
                  onSidebarFieldInputValueChange={
                    onSidebarFieldInputValueChange
                  }
                  onSidebarFieldInputFormSubmit={onSidebarFieldInputFormSubmit}
                  onRegionFieldInputValueChange={onRegionFieldInputValueChange}
                  onRegionFieldInputRemoveBtnClick={
                    onRegionFieldInputRemoveBtnClick
                  }
                  onRegionFieldInputSubmitBtnClick={
                    onRegionFieldInputSubmitBtnClick
                  }
                  onRegionFieldInputFormSubmit={onRegionFieldInputFormSubmit}
                  scrollSectionFieldIntoView={scrollSectionFieldIntoView}
                />
              </HelpTooltip>
            );
          })}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Bail out update if same field
    return (
      prevProps.section.id === nextProps.section.id &&
      prevProps.docReadOnly === nextProps.docReadOnly &&
      prevProps.collapseId === nextProps.collapseId &&
      prevProps.section === nextProps.section
    );
  }
);

const SectionList = (props) => {
  const {
    sections,
    docReadOnly,
    onSidebarLineItemFieldClick,
    onSidebarFieldInputFocus,
    onSidebarReadOnlyFieldClick,
    onSidebarFieldInputValueChange,
    onSidebarFieldInputFormSubmit,
    onRegionFieldInputValueChange,
    onRegionFieldInputRemoveBtnClick,
    onRegionFieldInputSubmitBtnClick,
    onRegionFieldInputFormSubmit,
    scrollSectionFieldIntoView,
    user,
    config,
    docId,
    docMeta,
  } = props;

  const { collapsedSectionIds } = useSelector(
    (state) => state.documents.reviewTool
  );

  const dispatch = useDispatch();

  let lineItemCollection = sections.map((item) =>
    item.children.map((d) => {
      if (d.type === 'line_item') {
        return d.id;
      }
    })
  );
  lineItemCollection = lineItemCollection
    .flat(1)
    .filter((item) => item !== undefined);
  return (
    <div className={cx(styles.sectionList, styles.reviewSection)}>
      {sections.map((section, i) => {
        return (
          <Section
            key={section.id}
            id={section.id}
            section={section}
            docReadOnly={docReadOnly}
            onSidebarLineItemFieldClick={onSidebarLineItemFieldClick}
            onSidebarFieldInputFocus={onSidebarFieldInputFocus}
            onSidebarReadOnlyFieldClick={onSidebarReadOnlyFieldClick}
            onSidebarFieldInputValueChange={onSidebarFieldInputValueChange}
            onSidebarFieldInputFormSubmit={onSidebarFieldInputFormSubmit}
            toolTipView={i === 0}
            lineItemTooltip={lineItemCollection[0]}
            onRegionFieldInputValueChange={onRegionFieldInputValueChange}
            onRegionFieldInputRemoveBtnClick={onRegionFieldInputRemoveBtnClick}
            onRegionFieldInputSubmitBtnClick={onRegionFieldInputSubmitBtnClick}
            onRegionFieldInputFormSubmit={onRegionFieldInputFormSubmit}
            scrollSectionFieldIntoView={scrollSectionFieldIntoView}
            user={user}
            config={config}
            docId={docId}
            docMeta={docMeta}
          />
        );
      })}
    </div>
  );
};

const SectionListSkeleton = () => {
  return (
    <div className={styles.skeleton}>
      {[1, 2, 3].map((item, index) => {
        return (
          <>
            {index > 0 && <div className='divider my-2' />}
            <div key={item} className='py-2 px-4 pr-8'>
              <Skeleton
                width='50%'
                height='24px'
                className='mb-3 border-radius-6'
              />
              <Skeleton
                width='100%'
                height='24px'
                className='mb-3 border-radius-6'
              />
              <Skeleton
                width='100%'
                height='24px'
                className='mb-3 border-radius-6'
              />
              <Skeleton
                width='100%'
                height='24px'
                className='border-radius-6'
              />
            </div>
          </>
        );
      })}
    </div>
  );
};

const FooterSkeleton = () => {
  return (
    <div className={cx(styles.skeleton, 'p-4')}>
      <>
        <div>
          <div className={styles.footerSkeleton}>
            <Skeleton width='40%' height='24px' className='border-radius-6' />
            {new Array(4).fill('x').map((item, index) => {
              return (
                <Skeleton
                  key={index}
                  width='11%'
                  height='24px'
                  className='border-radius-6'
                />
              );
            })}
          </div>
          <Skeleton
            width='40%'
            height='24px'
            className='mt-8 border-radius-6'
          />
        </div>
      </>
    </div>
  );
};

export default SectionList;
export { FooterSkeleton, SectionListSkeleton };
