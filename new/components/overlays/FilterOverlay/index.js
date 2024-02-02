import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import {
  Calculator,
  Calendar,
  Cancel,
  CheckCircle,
  FastArrowDownBox,
  InfoEmpty,
  Table2Columns,
  TextAlt,
} from 'iconoir-react';
import _ from 'lodash';
import * as api from 'new/api';
import { ReactComponent as AlphaNumericIcon } from 'new/assets/images/icons/alphanumeric.svg';
import { ReactComponent as BarcodeIcon } from 'new/assets/images/icons/barcode.svg';
import { ReactComponent as CompanyIcon } from 'new/assets/images/icons/company-name.svg';
import { ReactComponent as EmailIcon } from 'new/assets/images/icons/email-address.svg';
import { ReactComponent as IconDropdown } from 'new/assets/images/icons/icon-dropdown.svg';
import { ReactComponent as IconNumber } from 'new/assets/images/icons/icon-number.svg';
import { ReactComponent as PhoneIcon } from 'new/assets/images/icons/phone-number.svg';
import { SUPPORT_LINK } from 'new/constants/urllink';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import OutsideClickHandler from 'react-outside-click-handler';

import FilterSkeleton from './FilterSkeleton/FilterSkeleton';
import DropDown from './DropDown';
import InputBox from './InputBox';
import InputCustomArea from './InputCustomArea';
import InputRange from './InputRange';
import InputSwitch from './InputSwitch';
import InputTextArea from './InputTextArea';
import RegexBox from './RegexBox';

import styles from './index.scss';

//import _ from 'lodash';

const TABS = [
  {
    title: 'Basic',
    uid: 'basic',
  },
  {
    title: 'Advanced',
    uid: 'advanced',
  },
  // {
  //   title: 'Validation',
  //   uid: 'validation',
  // },
];
class FilterOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: TABS[0].uid,
      uiDataLabelValue: '',
      filterContainer: [],
      icons: [],
      isLoading: false,
      isSuccess: false,
      isError: false,
      overrideOutside: false,
    };

    this.filterContentRef = React.createRef();
  }

  componentDidMount() {
    this.setActiveTab(TABS[0].uid);
    let icons = [
      {
        id: 101,
        icon: <TextAlt />,
      },
      {
        id: 102,
        icon: <Calendar />,
      },
      {
        id: 103,
        icon: <IconNumber />,
      },
      {
        id: 104,
        icon: <Calculator />,
      },
      {
        id: 114,
        icon: <AlphaNumericIcon />,
      },
      {
        id: 105,
        icon: <IconDropdown />,
      },
      {
        id: 106,
        icon: <CheckCircle />,
      },
      {
        id: 107,
        icon: <FastArrowDownBox />,
      },
      {
        id: 108,
        icon: <Table2Columns />,
      },
      {
        id: 109,
        icon: <Calendar />,
      },
      {
        id: 110,
        icon: <CompanyIcon />,
      },
      {
        id: 111,
        icon: <PhoneIcon />,
      },
      {
        id: 112,
        icon: <EmailIcon />,
      },
      {
        id: 113,
        icon: <BarcodeIcon />,
      },
    ];
    this.setState({
      icons: icons,
    });

    const filterOverlay = document?.getElementById('filter-overlay');
    filterOverlay?.addEventListener('keydown', this.handleKeyDown);
    filterOverlay?.scrollTo(0, 40);
  }

  handleKeyDown = (e) => {
    e.stopPropagation();
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    let filterContainer = [];
    const { field, filterList } = nextProps;
    if (this.props !== nextProps) {
      if (field && field.filters) {
        for (let i = 0; i < field.filters.length; i++) {
          filterContainer.push({
            ...filterList.find(
              (itmInner) => itmInner.id === field.filters[i].filterId
            ),
            ...field.filters[i],
          });
        }
      }
      this.setState({
        filterContainer: filterContainer,
      });
    }
  }

  componentDidUpdate(_, prevState) {
    if (prevState.activeTab !== this.state.activeTab) {
      this.filterContentRef.current.scrollTo({ top: '0', behaviour: 'smooth' });
    }
  }
  componentWillUnmount() {
    this.props.documentActions.changeDataTypeFromSettinsPopup(false);
  }
  setActiveTab = (activeTab) => {
    this.setState({ activeTab: activeTab });
  };

  handleTabClick = (e, uid) => {
    e.preventDefault();
    this.setState({
      activeTab: uid,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  };

  handleInputChange = (e) => {
    this.setState({
      uiDataLabelValue: e.target.value,
    });
  };

  handleChangedValueSubmit = async ({
    uiValue,
    id,
    filterId,
    value,
    valueId,
    label,
    onError,
  }) => {
    const {
      docType,
      field: {
        //idAutoExtract,
        id: fieldId,
        type,
        uiLabel: fieldLabel,
      },
      documentActions,
      docId,
      appActions,
    } = this.props;
    const { field } = this.props;
    const isLineIemField = field?.subPType === 'line_item';

    if (id === 1) {
      try {
        if (!value) {
          appActions.setToast({
            title: `${
              isLineIemField ? 'Column' : 'Field'
            } title cannot be left blank. The ${
              isLineIemField ? 'column' : 'field'
            } title has been reverted to its previous name.`,
            error: true,
          });
          onError(field?.label);
        } else {
          await api.updateSectionField({
            fieldId: fieldId,
            docType,
            payload: {
              label: value,
              time_spent: 1,
              position: field.uiLabelRectangle || [],
              type: type,
            },
          });
          documentActions.setEditFieldChanges(true);
          documentActions.rtUpdateFieldValue({
            fieldId,
            label: value,
            value: field.uiValue,
          });
          documentActions.updateDisplayLabelFilter({
            id,
            label: value,
          });
        }
      } catch (e) {
        appActions.setToast({
          title:
            e?.responsePayload?.message ||
            'An error occurred. Please try again later.',
          error: true,
        });
      }
      return;
    }
    const { pType, subPType } = field;
    documentActions.setEditFieldChanges(true);
    if (filterId === 500) {
      let payload = {
        docTypeId: this.props.docTypeId,
        id: fieldId,
        fieldId: value,
        docType,
        filterType: type,
      };
      if (value !== 1001000) {
        const response = await api.filterSectionField({
          payload,
        });
        let changedData = response.responsePayload.data;

        let filterData = changedData.filter(
          (item) =>
            item.filterId === 200 || (item.filterId === 14 && item.id === 18)
        );
        filterData.forEach(async (item) => {
          let id = item.id;
          let filterId = item.filterId;
          let label = item.label;
          let value = item.value;
          await api.changeFilter({
            payload: {
              id,
              filterId,
              docType,
              docId,
              fieldId,
              uiValue,
              valueId,
              value,
              label,
              pType,
              subPType,
            },
          });
        });
      } else {
        let filterData = [];
        let databaseData = {
          filterId: 200,
          id: 12,
          label: 'Database Table',
          value: 1001000,
        };
        let thresHoldData = {
          filterId: 14,
          id: 18,
          label: 'Threshold',
          value: 80,
        };
        filterData.push(databaseData);
        filterData.push(thresHoldData);
        filterData.forEach(async (item) => {
          let id = item.id;
          let filterId = item.filterId;
          let label = item.label;
          let value = item.value;
          await api.changeFilter({
            payload: {
              id,
              filterId,
              docType,
              docId,
              fieldId,
              uiValue,
              valueId,
              value,
              label,
              pType,
              subPType,
            },
          });
        });
      }

      setTimeout(() => {
        documentActions.rtAdditionalFilter({
          id,
          filterId,
          fieldLabel,
          docType,
          docId,
          fieldId,
          uiValue,
          valueId,
          value,
          label,
          pType,
          subPType,
        });
      }, 400);
      return null;
    }
    if (filterId === 1 && uiValue === 'line_item') {
      this.props.documentActions.changeDataTypeFromSettinsPopup(true);
    }
    await documentActions.rtAdditionalFilter({
      id,
      filterId,
      fieldLabel,
      docType,
      docId,
      fieldId,
      uiValue,
      valueId,
      value,
      label,
      pType,
      subPType,
    });
  };

  handleValidate = async ({ id, value }) => {
    this.setState({
      isLoading: true,
      loadingId: id,
      clearValidation: false,
    });
    const {
      field: { parentId, idAutoExtract },
      docId,
      docType,
    } = this.props;
    try {
      const response = await api.getValidation({
        docType,
        docId,
        parentId,
        payload: {
          id: id,
          item_id: idAutoExtract,
          value: value,
        },
      });
      const status = _.get(response.responsePayload, 'status');
      if (status === 'success') {
        this.setState({
          isSuccess: true,
          isLoading: false,
        });
      } else {
        this.setState({
          isSuccess: false,
          isLoading: false,
          isError: true,
        });
      }
    } catch (e) {
      this.setState({
        isSuccess: false,
        isLoading: false,
        isError: true,
      });
    }
  };
  handleDropDownValidate = async ({ id }) => {
    this.setState({
      isLoading: true,
      clearValidation: false,
    });
    const { docType } = this.props;
    //const { field : {content : { value }}} = this.props;
    try {
      const response = await api.getDocumentDDOptions({
        type: docType,
        id,
        // queryParams: {
        //     q: value
        // }
      });
      const status = _.get(response.responsePayload, 'status');
      if (status === 'success') {
        this.setState({
          isSuccess: true,
          isLoading: false,
        });
      } else {
        this.setState({
          isSuccess: false,
          isLoading: false,
          isError: true,
        });
      }
    } catch (e) {
      this.setState({
        isSuccess: false,
        isLoading: false,
        isError: true,
      });
    }
  };

  handleNextBtnClick = async () => {
    const {
      docType,
      field: {
        //idAutoExtract,
        id,
        type,
        pType,
        subPType,
      },
      fieldsById,
      sectionFieldIds,
      lineItemId,
      selectedSectionFieldId,
      selectedFieldId,
      appActions,
    } = this.props;
    appActions.showLoaderOverlay();
    //await api.saveAndCloseFilter({docType, idAutoExtract, docId});
    //await api.saveAndCloseFilter({docType, id, docId});
    //let filteredSectionFieldIds = [];
    let filteredIds = [];

    if (selectedFieldId > 9999999) {
      for (let i = 0; i < lineItemId.length; i++) {
        if (
          String(lineItemId[i]).substring(0, 7) ===
          String(selectedSectionFieldId)
        ) {
          filteredIds.push(lineItemId[i]);
        }
      }
    } else {
      for (let i = 0; i < sectionFieldIds.length; i++) {
        if (sectionFieldIds[i] > 9999) {
          if (fieldsById[sectionFieldIds[i]].type !== 'line_item') {
            filteredIds.push(sectionFieldIds[i]);
          }
        }
      }
    }
    //let position = filteredIds.indexOf(idAutoExtract);
    let position = filteredIds.indexOf(id);
    if (position < filteredIds.length - 1) {
      this.props.documentActions.rtShowFiterInField({
        docTypeId: this.props.docTypeId,
        fieldId: filteredIds[position + 1],
        docType,
        filterType: type,
        pType,
        subPType,
      });
    }

    appActions.hideLoaderOverlay();
  };

  displayContent = (activeTab) => {
    switch (activeTab) {
      case 'basic':
        return this.displayGeneral();
      case 'advanced':
        return (
          <div className={styles.negativeMargin}>
            {this.displayExtraction()}
          </div>
        );
      // case 'validation':
      //   return (
      //     <div className={styles.negativeMargin}>
      //       {this.displayValidation()}
      //     </div>
      //   );
      default:
        return this.displayGeneral();
    }
  };

  displayGeneral = () => {
    const { filterContainer, icons, isLoading, isSuccess, isError, loadingId } =
      this.state;
    const {
      field: {
        //idAutoExtract,
        subPType = '',
      },
      changeDataTypeFromSettings,
      appActions,
    } = this.props;
    let generalComponent = [];

    for (let i = 0; i < filterContainer.length; i++) {
      if (filterContainer[i].tab === 'basic') {
        if (filterContainer[i].filterType === 'input_text') {
          generalComponent.push(
            <InputBox
              changeDataTypeFromSettings={changeDataTypeFromSettings}
              key={filterContainer[i].id}
              mainField={filterContainer[i].mainField || false}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              value={filterContainer[i].value}
              label={filterContainer[i].label}
              defaultPlaceholder={'Type here...'}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
            />
          );
        } else if (
          filterContainer[i].filterType === 'drop_down' &&
          filterContainer[i].id !== 14
        ) {
          generalComponent.push(
            <DropDown
              changeDataTypeFromSettings={changeDataTypeFromSettings}
              key={filterContainer[i].id}
              value={filterContainer[i].value}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              id={filterContainer[i].id}
              mainField={filterContainer[i].mainField || false}
              labelText={filterContainer[i].label}
              option={
                //filter the dropdown option for the table column field settings
                filterContainer[i].id && subPType === 'line_item'
                  ? [
                      ...filterContainer[i].options.filter(
                        (item) => item.type !== subPType
                      ),
                    ]
                  : filterContainer[i].options
              }
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              indexCheck={filterContainer.find(
                (element) => element.id === 10 && element.label === 'Index'
              )}
              icons={icons}
            />
          );
        } else if (
          filterContainer[i].filterType === 'drop_down' &&
          filterContainer[i].id === 14
        ) {
          generalComponent.push(
            <DropDown
              changeDataTypeFromSettings={changeDataTypeFromSettings}
              key={filterContainer[i].id}
              value={filterContainer[i].value}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              id={filterContainer[i].id}
              mainField={filterContainer[i].mainField || false}
              labelText={filterContainer[i].label}
              option={filterContainer[i].options}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              indexCheck={filterContainer.find(
                (element) => element.id === 10 && element.label === 'Index'
              )}
              optionTable={filterContainer.find(
                (element) => element.id === 12 && filterContainer[i].id === 14
              )}
            />
          );
        } else if (filterContainer[i].filterType === 'section') {
          generalComponent.push(
            <InputBox
              changeDataTypeFromSettings={changeDataTypeFromSettings}
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              mainField={true}
              label={filterContainer[i].label}
              className={styles.displayLabel}
              fieldClassName={styles.displayField}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
            />
          );
        } else if (filterContainer[i].filterType === 'radio_button') {
          generalComponent.push(
            <InputSwitch
              changeDataTypeFromSettings={changeDataTypeFromSettings}
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              value={filterContainer[i].value}
              labelText={filterContainer[i].label}
              option={filterContainer[i].options}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              setOverRidePopup={this.props.setOverRide}
              overrideOutsideClick={this.overrideOutsideClick}
            />
          );
        } else if (filterContainer[i].filterType === 'input_number') {
          generalComponent.push(
            <InputBox
              changeDataTypeFromSettings={changeDataTypeFromSettings}
              key={filterContainer[i].id}
              mainField={filterContainer[i].mainField || false}
              label={filterContainer[i].label}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              value={filterContainer[i].value}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              type={'number'}
              className={styles.confidence}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              indexCheck={filterContainer.find(
                (element) => element.id === 10 && element.label === 'Index'
              )}
            />
          );
        } else if (filterContainer[i].filterType === 'regex_box') {
          generalComponent.push(
            <>
              <RegexBox
                changeDataTypeFromSettings={changeDataTypeFromSettings}
                key={filterContainer[i].id}
                mainField={filterContainer[i].mainField || false}
                label={filterContainer[i].label}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
                id={filterContainer[i].id}
                value={filterContainer[i].value}
                filterId={filterContainer[i].filterId}
                handleChangedValueSubmit={this.handleChangedValueSubmit}
              />
            </>
          );
        } else if (filterContainer[i].filterType === 'input_range') {
          generalComponent.push(
            <InputRange
              changeDataTypeFromSettings={changeDataTypeFromSettings}
              key={filterContainer[i].id}
              label={filterContainer[i].label}
              placeholderOne={'Min...'}
              placeholderTwo={'Max...'}
              option={filterContainer[i].options}
              value={filterContainer[i].value}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              appActions={appActions}
            />
          );
        } else if (filterContainer[i].filterType === 'large_input_box') {
          generalComponent.push(
            <>
              <InputTextArea
                changeDataTypeFromSettings={changeDataTypeFromSettings}
                mainField={filterContainer[i].mainField || false}
                label={filterContainer[i].label}
                key={filterContainer[i].id}
                defaultPlaceholder={'a\nb\nc'}
                id={filterContainer[i].id}
                value={filterContainer[i].value}
                filterId={filterContainer[i].filterId}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
                handleChangedValueSubmit={this.handleChangedValueSubmit}
              />
            </>
          );
        } else if (filterContainer[i].filterType === 'large_text_box') {
          generalComponent.push(
            <>
              <InputCustomArea
                changeDataTypeFromSettings={changeDataTypeFromSettings}
                mainField={filterContainer[i].mainField || false}
                label={filterContainer[i].label}
                key={filterContainer[i].id}
                type={subPType}
                defaultPlaceholder={'a\nb\nc'}
                id={filterContainer[i].id}
                value={filterContainer[i].value}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
                filterId={filterContainer[i].filterId}
                handleChangedValueSubmit={this.handleChangedValueSubmit}
                isLoading={isLoading}
                isSuccess={isSuccess}
                isError={isError}
                handleValidate={this.handleValidate}
                loadingId={loadingId}
                handleDropDownValidate={this.handleDropDownValidate}
              />
            </>
          );
        }
      }
    }

    return generalComponent;
  };
  displayExtraction = () => {
    const { filterContainer, isLoading, isSuccess, isError, loadingId } =
      this.state;
    const {
      field: {
        //idAutoExtract,
        subPType = '',
      },
    } = this.props;
    var extractionComponent = [];

    for (let i = 0; i < filterContainer.length; i++) {
      if (filterContainer[i].tab === 'advanced') {
        if (filterContainer[i].filterType === 'input_text') {
          extractionComponent.push(
            <InputBox
              key={filterContainer[i].id}
              mainField={filterContainer[i].mainField || false}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              value={filterContainer[i].value}
              label={filterContainer[i].label}
              defaultPlaceholder={'Type here...'}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
            />
          );
        } else if (filterContainer[i].filterType === 'drop_down') {
          extractionComponent.push(
            <DropDown
              key={filterContainer[i].id}
              value={filterContainer[i].value}
              filterId={filterContainer[i].filterId}
              id={filterContainer[i].id}
              mainField={filterContainer[i].mainField || false}
              labelText={filterContainer[i].label}
              option={filterContainer[i].options}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
            />
          );
          // }
          // else if(filterContainer[i].filterType === 'session'){
          //     extractionComponent.push(
          //         <InputBox
          //             id = {filterContainer[i].id}
          //             mainField={ true }
          //             label={filterContainer[i].label}
          //             className={styles.displayLabel}
          //             helpText={filterContainer[i].helpText}
          //         />

          //     );
        } else if (filterContainer[i].filterType === 'radio_button') {
          extractionComponent.push(
            <InputSwitch
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              value={filterContainer[i].value}
              labelText={filterContainer[i].label}
              option={filterContainer[i].options}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              overrideOutsideClick={this.overrideOutsideClick}
            />
          );
        } else if (filterContainer[i].filterType === 'input_number') {
          extractionComponent.push(
            <InputBox
              key={filterContainer[i].id}
              mainField={filterContainer[i].mainField || false}
              label={filterContainer[i].label}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              value={filterContainer[i].value}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              defaultPlaceholder={'%'}
              type={'number'}
              className={styles.confidence}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
            />
          );
        } else if (filterContainer[i].filterType === 'regex_box') {
          extractionComponent.push(
            <>
              <RegexBox
                key={filterContainer[i].id}
                mainField={filterContainer[i].mainField || false}
                label={filterContainer[i].label}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
                id={filterContainer[i].id}
                value={filterContainer[i].value}
                filterId={filterContainer[i].filterId}
                handleChangedValueSubmit={this.handleChangedValueSubmit}
              />
            </>
          );
        } else if (filterContainer[i].filterType === 'input_range') {
          extractionComponent.push(
            <InputRange
              key={filterContainer[i].id}
              label={filterContainer[i].label}
              placeholderOne={'Min...'}
              placeholderTwo={'Max...'}
              value={filterContainer[i].value}
              option={filterContainer[i].options}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
            />
          );
        } else if (filterContainer[i].filterType === 'large_input_box') {
          extractionComponent.push(
            <>
              <InputTextArea
                mainField={filterContainer[i].mainField || false}
                label={filterContainer[i].label}
                key={filterContainer[i].id}
                defaultPlaceholder={'a\nb\nc'}
                id={filterContainer[i].id}
                value={filterContainer[i].value}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
                filterId={filterContainer[i].filterId}
                handleChangedValueSubmit={this.handleChangedValueSubmit}
              />
            </>
          );
        } else if (filterContainer[i].filterType === 'large_text_box') {
          extractionComponent.push(
            <>
              <InputCustomArea
                mainField={filterContainer[i].mainField || false}
                label={filterContainer[i].label}
                key={filterContainer[i].id}
                type={subPType}
                defaultPlaceholder={'a\nb\nc'}
                id={filterContainer[i].id}
                value={filterContainer[i].value}
                filterId={filterContainer[i].filterId}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
                handleChangedValueSubmit={this.handleChangedValueSubmit}
                isLoading={isLoading}
                isSuccess={isSuccess}
                isError={isError}
                handleValidate={this.handleValidate}
                loadingId={loadingId}
              />
            </>
          );
        }
      }
    }

    return extractionComponent;
  };
  displayValidation = () => {
    const { filterContainer, isLoading, isSuccess, isError, loadingId } =
      this.state;
    const {
      field: {
        //idAutoExtract,
        subPType = '',
      },
    } = this.props;
    let validationComponent = [];

    for (let i = 0; i < filterContainer.length; i++) {
      if (filterContainer[i].tab === 'validation') {
        if (filterContainer[i].filterType === 'large_text_box') {
          validationComponent.push(
            <>
              <InputCustomArea
                mainField={filterContainer[i].mainField || false}
                label={filterContainer[i].label}
                key={filterContainer[i].id}
                type={subPType}
                defaultPlaceholder={'a\nb\nc'}
                id={filterContainer[i].id}
                filterId={filterContainer[i].filterId}
                value={filterContainer[i].value}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
                handleChangedValueSubmit={this.handleChangedValueSubmit}
                isLoading={isLoading}
                isSuccess={isSuccess}
                isError={isError}
                handleValidate={this.handleValidate}
                loadingId={loadingId}
              />
            </>
          );
        }
      }
    }
    return validationComponent;
  };
  outsideClickCloseFilterOverlay = () => {
    const {
      docType,
      docId,
      documentActions,
      field: { id: fieldId },
      closeMoreOption,
    } = this.props;
    const { overrideOutside } = this.state;
    if (overrideOutside) {
      return;
    }
    // appActions.showLoaderOverlay();
    // await api.saveAndCloseFilter({docType, id:fieldId, docId});
    // const data = _.get(response.responsePayload, 'data');
    documentActions.rtHideFilterInField({ fieldId });
    closeMoreOption();
    //appActions.hideLoaderOverlay();
    this.setActiveTab(TABS[0].uid);
    this.setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  };

  overrideOutsideClick = (overrideOutside) => {
    this.setState({
      overrideOutside: overrideOutside,
    });
  };

  closeFilterOverlay = async () => {
    const {
      appActions,
      documentActions,
      docType,
      docId,
      field: { id: fieldId },
      closeMoreOption,
    } = this.props;

    const app = document.getElementById('app');
    app && app.click();
    closeMoreOption();
    documentActions.rtHideFilterInField({ fieldId });
    // const data = _.get(response.responsePayload, 'data');

    this.setActiveTab(TABS[0].uid);
    this.setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  };

  render() {
    const { field, changeDataTypeFromSettings } = this.props;
    const { activeTab } = this.state;

    if (!field) {
      return null;
    }
    return (
      <div className={styles.root} id={'filter-overlay'}>
        <OutsideClickHandler
          onOutsideClick={this.outsideClickCloseFilterOverlay}
        >
          <div className={styles.floatingBtn}>
            <Tooltip
              className={styles['floatingBtn__tooltip']}
              label={
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href={SUPPORT_LINK.CUSTOM_PROCESSING_FOR_EACH_LABEL}
                  className={cx('d-flex align-items-center')}
                >
                  Read more about field settings
                </a>
              }
            >
              <InfoEmpty className={styles['tooltip-icon']} fontSize='14' />
            </Tooltip>
            <IconButton
              icon={Cancel}
              variant='text'
              className={styles.floatingBtn__close}
              onClick={() => this.closeFilterOverlay()}
            />
          </div>
          <div className={styles.header}>
            {TABS.map(({ title, uid }, i) => (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <div
                role='button'
                tabIndex={i}
                key={i}
                className={cx(styles.tab, {
                  [styles.active]: activeTab === uid,
                  [styles.disable]: changeDataTypeFromSettings,
                })}
                onClick={(e) =>
                  changeDataTypeFromSettings
                    ? null
                    : this.handleTabClick(e, uid, title)
                }
                style={{ width: '40%' }}
              >
                {title}
              </div>
            ))}
          </div>
          <div className={styles.filterContent} ref={this.filterContentRef}>
            {this.props.isEditFieldFilterFetching ? (
              <FilterSkeleton />
            ) : activeTab ? (
              this.displayContent(activeTab)
            ) : null}
          </div>
        </OutsideClickHandler>
      </div>
    );
  }
}

const Container = (props) => {
  const { field } = props;
  if (!field) {
    return null;
  }

  return <FilterOverlay {...props} />;
};

function mapStateToProp(state) {
  const {
    fieldsById,
    docId,
    docTypeId,
    sectionFieldIds,
    sectionIds,
    lineItemId,
    selectedFieldId,
    selectedSectionFieldId,
  } = state.documents.reviewTool;
  const isEditFieldFilterFetching =
    state.documents.editFields.fetchState === 'FETCHING';

  const { filterList } = state.documents;
  const { fieldId, docType } = state.documents;
  const field = fieldsById[fieldId];

  return {
    field,
    fieldsById,
    docType,
    docId,
    filterList,
    docTypeId,
    sectionFieldIds,
    sectionIds,
    lineItemId,
    selectedFieldId,
    selectedSectionFieldId,
    isEditFieldFilterFetching,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(Container);
