import React, { Component } from 'react';

import { closest } from '@syncfusion/ej2-base';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import cx from 'classnames';
import { Cancel } from 'iconoir-react';
import _ from 'lodash';
import { ReactComponent as DocsumoIcon } from 'new/assets/images/docsumo/icon.svg';
import { ReactComponent as ExcelIcon } from 'new/assets/images/icons/excelIconPdfPreview.svg';
import { ReactComponent as PdfIcon } from 'new/assets/images/icons/pdfIconPdfPreview.svg';
import IconButton from 'new/ui-elements/IconButton/IconButton';

import PdfViewer from '../PdfViewer/PdfViewer';

import styles from './OriginalFilePreviewOverlay.scss';

class OriginalFilePreviewOverlay extends Component {
  closePreviewScreen = () => {
    window.close();
    window.history.go(-1);
  };

  highlightOriginalExcelDoc = (data) => {
    for (let i = 0; i < data.length; i++) {
      this.spreadsheet.cellFormat(
        {
          backgroundImage: 'linear-gradient(to bottom right, #E0E4F4, #E0E4F4)',
        },
        `Raw Sheet!${data[i]}`
      );
    }
  };

  render() {
    const originalFileProps =
      JSON.parse(localStorage.getItem('originalFileProps')) || {};
    const {
      excelData = [],
      fileUrl,
      docHasExcelType,
      highlights = [],
      highlightRanges = [],
    } = originalFileProps;

    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <div className={styles.titleContent}>
            <div className={cx(styles.imageContainer)}>
              <DocsumoIcon className={styles.logo} />
            </div>
            <div className={cx(styles.tabContent_tabs, styles.activeTab)}>
              <div>
                <span>{docHasExcelType ? <ExcelIcon /> : <PdfIcon />}</span>
                <span>Original file</span>
              </div>
            </div>
          </div>
          <div className={styles.actionContent}>
            <IconButton
              variant='ghost'
              icon={<Cancel height={24} width={24} />}
              size='small'
              onClick={() => this.closePreviewScreen()}
              className={styles.closeIcon}
            />
          </div>
        </div>
        <div
          className={cx({ [styles.spreadSheet]: docHasExcelType })}
          style={{ height: '100%' }}
        >
          {/* spreadsheet component renderer */}
          {docHasExcelType ? (
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
                  tabPanelBottom.style.height = '3.5rem';

                  const indicator = document.querySelector('.e-ignore') || {};
                  indicator.style.zIndex = '0';

                  const dropDownBtn =
                    document.querySelector('.e-dropdown-btn') || {};
                  dropDownBtn.style.display = 'none';

                  const secondSheet = document.querySelectorAll(
                    '[data-id=tabitem_1]'
                  )[0];
                  secondSheet.style.display = 'none';

                  const page = document.querySelector('.e-spreadsheet') || {};
                  page.style.top = '2.5rem';

                  const panel = document.querySelector('.e-sheet-panel') || {};
                  panel.style.height = 'calc(100% - 5.625rem)';

                  const borderIcon =
                    document.querySelector('.e-borders-ddb') || {};
                  borderIcon.disabled = true;
                }
              }}
              showFormulaBar={false}
              showRibbon={false}
              height={'calc(100% - 1.375rem)'}
              created={() => {
                /* add custom function initially */
                if (this.spreadsheet) {
                  this.spreadsheet.addCustomFunction(
                    this.calculateCustomSum,
                    'CUSTOMSUM'
                  );
                  if (docHasExcelType)
                    this.highlightOriginalExcelDoc(highlightRanges);
                }

                /* hide addSheet and dropdown button of spreadsheet component */
                const dropIcon = document.querySelector('.e-drop-icon') || {};
                if (!_.isEmpty(dropIcon)) {
                  dropIcon.style.display = 'none';
                  dropIcon.style.opacity = '0';
                  dropIcon.style.visibility = 'hidden';
                }
              }}
              contextMenuBeforeOpen={(args) => {
                if (closest(args.event.target, '.e-tab-wrap')) {
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
              sheets={excelData}
            ></SpreadsheetComponent>
          ) : (
            <PdfViewer
              url={fileUrl}
              originalFilePreview={true}
              highlights={highlights}
            />
          )}{' '}
          {/* PDF viewer renderer */}
        </div>
      </div>
    );
  }
}

export default OriginalFilePreviewOverlay;
