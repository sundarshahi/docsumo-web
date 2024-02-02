import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';

import mixpanel from 'mixpanel-browser';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import { DragDropContext } from 'react-beautiful-dnd';

import Section from '../Section';

import styles from './SectionList.scss';

import { ReactComponent as EmptyFieldsStateImg } from '/new/assets/images/EmptyFieldsState.svg';

const SectionList = ({ sections, ...props }) => {
  const dispatch = useDispatch();
  const [defaultCustomDocTypefields, setDefaultCustomDocTypefields] =
    useState(false);

  const { sectionsById, fieldsById, selectedFieldId, sectionFieldIds } =
    useSelector((state) => state.documents.reviewTool);

  const [selectedDropdownId, setSelectedDropdownId] = useState(false);

  const querySearchParams = new URLSearchParams(window.location.search);
  const customDocType = querySearchParams.get('customDocType') || false;

  /**
   * The sectionList scrolls to bottom when switching to edit fields from review screen.
   * Below useEffect code ensures, selectedField is visible OR
   *  if none of the field is selected, sidebar top will be visible
   */
  useEffect(() => {
    if (selectedFieldId) {
      const selectedFieldInput = document.getElementById(
        `sidebar-field-input-${selectedFieldId}`
      );
      if (selectedFieldInput) {
        selectedFieldInput.scrollIntoView({ block: 'center' });
      }
    } else {
      const sidebar = document.getElementById('rt-sidebar-content');

      if (sidebar) {
        sidebar.scrollIntoView({ block: 'center' });
      }
    }
  }, []);

  useEffect(() => {
    if (!customDocType) return;

    const fieldsByIdArr = Object.values(fieldsById);

    const defaultfield = fieldsByIdArr.find(
      (el) => el.content && el.content.validationSource === 'human'
    );

    if (defaultCustomDocTypefields !== !defaultfield) {
      setDefaultCustomDocTypefields(!defaultfield);
    }
  }, [fieldsById]);

  const changeSelectedDropdownId = (id) => {
    setSelectedDropdownId(id);
  };

  const lineItemCollection = sections
    .map((item) =>
      item.children.map((d) => {
        if (d.type === 'line_item') {
          return d.id;
        }
      })
    )
    .flat(1)
    .filter((item) => item !== undefined);

  const handleDragEnd = (result) => {
    const { destination = '', source = '', draggableId } = result;
    const {
      docId = '',
      docType = '',
      user,
      config: { canSwitchToOldMode = true },
    } = props;
    if (
      !destination ||
      (source?.droppableId === destination?.droppableId &&
        destination?.index === source?.index)
    ) {
      return;
    }

    /**
     * Reordering destination index so that no visible fields stay under the hidden field
     */
    let newResult = { ...result };
    const destinationSectionId = Number(destination.droppableId);

    const hiddenIndex = sectionsById[destinationSectionId].fieldIds.findIndex(
      (field) => fieldsById[field]?.isHidden
    );

    if (hiddenIndex > -1 && destination.index >= hiddenIndex) {
      let newDestinationIndex = hiddenIndex;

      if (source.droppableId === destination.droppableId) {
        newDestinationIndex = hiddenIndex - 1;
      }

      newResult = {
        ...newResult,
        destination: { ...newResult.destination, index: newDestinationIndex },
      };
    }

    const postData = {
      docType: props.docType,
      dragResult: newResult,
      data: {
        field_id: draggableId,
        order: newResult.destination.index + 1,
        parent_id: destination.droppableId,
      },
    };
    mixpanel.track(MIXPANEL_EVENTS.sort_and_drag_field, {
      docId: docId,
      docType: docType,
      'work email': user?.email,
      destination,
      source,
      version: 'new',
      'result data': postData?.data,
      canSwitchUIVersion: canSwitchToOldMode,
    });
    dispatch(documentActions.changeFieldOrder(postData));
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        {sections.map((section, i) => {
          return (
            <Section
              key={section.id}
              toolTipView={i === 0}
              lineItemTooltip={lineItemCollection[0]}
              isLastSection={++i === sections?.length}
              section={section}
              selectedDropdownId={selectedDropdownId}
              changeSelectedDropdownId={changeSelectedDropdownId}
              {...props}
            />
          );
        })}
      </DragDropContext>
      {customDocType && defaultCustomDocTypefields && (
        <div className={styles.emptyFieldContainer}>
          <div className={styles.content}>
            <EmptyFieldsStateImg />
            <p className={styles.content__title_extract}>
              Add a field above to get started!
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SectionList;
