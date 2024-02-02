/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { closest } from '@syncfusion/ej2-base';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import _ from 'lodash';
import * as api from 'new/api';
import { ReactComponent as ExcelIcon } from 'new/assets/images/icons/excelIconPdfPreview.svg';
import routes from 'new/constants/routes';

import styles from './ExcelDocumentView.scss';

class ExcelDocumentViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      isLoading: true,
      excelData: [],
      title: '',
    };
  }

  componentDidMount() {
    this.getExcelData();
  }

  getExcelData = async () => {
    const { currentDocId, docFile, appActions } = this.props;
    appActions.showLoaderOverlay();
    try {
      const response = await api.getDocumentData({
        docId: currentDocId,
      });
      let section = _.get(response, 'responsePayload.data.sections') || [];
      this.setState({
        isLoading: false,
        excelData: section,
        title: docFile.title,
      });
    } catch (e) {
      //error
    } finally {
      appActions.hideLoaderOverlay();
    }
  };

  componentDidUpdate(prevProps) {
    const { currentDocId: prevCurrentDocId } = prevProps;
    const { currentDocId } = this.props;
    if (prevCurrentDocId && currentDocId && prevCurrentDocId !== currentDocId) {
      this.getExcelData();
    }
  }

  handleCloseSpreadsheet = () => {
    const { history } = this.props;
    history.push(routes.ROOT);
  };

  render() {
    const { isLoading, excelData, title = '' } = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.header} title={title || ''}>
          <span className={styles.title}>
            <ExcelIcon className={styles.icon} />
            <p className={styles.value}>{title || ''}</p>
          </span>
        </div>
        {isLoading ? (
          <div></div>
        ) : (
          <>
            {/* spreadsheet component renderer */}
            <SpreadsheetComponent
              ref={(ssObj) => {
                this.spreadsheet = ssObj;
                if (this.spreadsheet) {
                  /* hide the necessary menu, ribbon, toolbar items from spreadsheet */
                  this.spreadsheet.hideFileMenuItems(['File']);
                  this.spreadsheet.hideRibbonTabs([
                    'File',
                    'Insert',
                    'Formulas',
                    'Data',
                    'View',
                  ]);
                  this.spreadsheet.hideToolbarItems(
                    'Home',
                    [5, 6, 7, 20, 26, 27, 29]
                  );
                  /* DOM manipulation for providing style for spreadsheet component parts */
                  const addSheet =
                    document.querySelector('.e-add-sheet-tab') || {};
                  addSheet.style.display = 'none';
                  const tabPanelBottom =
                    document.querySelector('.e-sheet-tab-panel') || {};
                  tabPanelBottom.style.height = '49px';
                  const indicator = document.querySelector('.e-ignore') || {};
                  indicator.style.zIndex = '0';
                  const page = document.querySelector('.e-spreadsheet') || {};
                  page.style.minHeight = '0';
                  const sheetPages =
                    document.getElementsByClassName('e-spreadsheet') || [];
                  sheetPages[0].style.minHeight = '0';
                  const borderIcon =
                    document.querySelector('.e-borders-ddb') || {};
                  borderIcon.disabled = true;
                }
              }}
              showFormulaBar={true}
              showRibbon={true}
              allowSheetTabsEditing={false}
              created={() => {
                const dropIcon = document.querySelector('.e-drop-icon') || {};
                if (!_.isEmpty(dropIcon)) {
                  dropIcon.style.display = 'none';
                  dropIcon.style.opacity = '0';
                  dropIcon.style.visibility = 'hidden';
                }
              }}
              contextMenuBeforeOpen={(args) => {
                if (
                  this.spreadsheet &&
                  closest(args.event.target, '.e-tab-wrap')
                ) {
                  this.spreadsheet.enableContextMenuItems(
                    [
                      'Protect Sheet',
                      'Unprotect Sheet',
                      'Move Left',
                      'Move Right',
                      'Hide',
                      'Rename',
                      'Duplicate',
                      'Delete',
                      'Insert',
                    ],
                    false,
                    false
                  );
                }
              }}
              height={'99.4%'}
              sheets={excelData}
              className='customViewerExcel'
            ></SpreadsheetComponent>
          </>
        )}
      </div>
    );
  }
}

export default withRouter(ExcelDocumentViewer);
