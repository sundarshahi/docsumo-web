import React from 'react';
import { connect } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';
import { actions as uploadActions } from 'new/redux/upload/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import {
  DocTypeActionsCell,
  DocTypeHeaderActionsCell,
} from 'new/components/shared/documentList';
import { Card, Cell, Row } from 'new/components/shared/tabularList';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Badge from 'new/ui-elements/Badge';
import ToggleControl from 'new/ui-elements/ToggleControl/ToggleControl';

import styles from './DocumentItem.scss';

class DocumentItem extends React.Component {
  state = {
    isEditingName: false,
    isUpdatingName: false,
    uiNameValue: '',
    uiNameError: '',
    enablingApiId: '',
  };
  nameInputRef = React.createRef();

  componentDidUpdate(prevProps, prevState) {
    const { isEditingName } = this.state;
    const { document, uploadSampleDocType = {}, isModalOpen } = this.props;

    const { isEditingName: prevIsEditingName } = prevState;

    if (isEditingName && isEditingName !== prevIsEditingName) {
      // Focus name input
      if (this.nameInputRef && this.nameInputRef.current) {
        this.nameInputRef.current.focus();
      }
    }

    const { reviewing = 0 } = document?.docCounts;
  }

  handleActionsClick = (type, document, ...params) => {
    const [value] = params;
    this.props.onActionClick(type, document);
    this.setState({ mountMoreSettingsModal: value });
  };

  handleToggleClick = (document) => {
    this.setState({ enablingApiId: document.id });

    this.props.enableDocumentType(document);
  };

  updateFileUploadOrigin = () => {
    const { uploadActions } = this.props;
    uploadActions.fileUploadOrigin({
      origin: MIXPANEL_EVENTS.doc_upload_success_doctype,
    });
  };

  render() {
    const { enablingApiId } = this.state;
    const {
      document = {},
      onActionClick,
      toolTip,
      allowEditFields,
      allowDuplicate,
      allowSetting,
      user,
      onboardingTutorialOrigin,
      isTestingMode,
      config,
      isDisabled,
      uploadSampleDocType,
    } = this.props;

    const { title, docCounts = {} } = document;
    const { all = 0, processed = 0, reviewing = 0 } = docCounts;

    const userDetails = {
      'full name': user.fullName,
      'company name': user.companyName,
      'work email': user.email,
      'account region': user.region,
      'org Id': user.orgId,
      mode: user.mode,
      error: '',
      origin: onboardingTutorialOrigin,
    };

    return (
      <Card
        className={cx(styles.container, {
          [styles.container__disabled]: isDisabled,
          [styles.container__updating]: enablingApiId === document.id,
        })}
        id={`docType_${document.id}`}
      >
        <div className={styles.content}>
          <Row className={styles.container__row}>
            <Cell className={styles['container__row--cell']} title={title}>
              <span className={cx('text-truncate', styles['container__title'])}>
                {title}
              </span>
              {isDisabled && (
                <Badge
                  className={styles.badge}
                  type='warning'
                  title='Disabled'
                />
              )}
            </Cell>
            <DocTypeHeaderActionsCell
              document={document}
              onActionClick={this.handleActionsClick}
              toolTip={toolTip}
              allowDuplicate={allowDuplicate}
              allowSetting={allowSetting}
              userDetails={userDetails}
              testMode={isTestingMode}
              config={config}
              isDisabled={isDisabled}
            />
          </Row>
          <Row className={styles.container__rowSeparator}></Row>
          <Row
            className={cx(
              'd-block',
              'flex-direction-column',
              'align-items-initial',
              styles.container__details
            )}
          >
            <Row className={styles['container__details--detailsRow']}>
              Uploaded : &nbsp; <span className='font-medium'>{all}</span>
            </Row>
            <Row className={styles['container__details--detailsRow']}>
              Review Pending : &nbsp;{' '}
              <span className='font-medium'>{reviewing}</span>
            </Row>
            <Row className={styles['container__details--detailsRow']}>
              Approved : &nbsp; <span className='font-medium'>{processed}</span>
            </Row>
          </Row>
          <Row className={styles.container__btnRow}>
            <DocTypeActionsCell
              userDetails={userDetails}
              toolTip={toolTip}
              btnClassName={styles.btn}
              onActionClick={onActionClick}
              document={document}
              allowEditFields={allowEditFields}
              config={config}
              isDisabled={isDisabled}
              updateFileUploadOrigin={this.updateFileUploadOrigin}
              reviewClassName={
                uploadSampleDocType?.id === document.id ? 'UFCardReview' : ''
              }
            />
          </Row>
        </div>
        <div className={styles.overlay}>
          <div className={styles.overlay_section}>
            <span>Enable</span>
            <ToggleControl
              disabled={enablingApiId === document.id}
              isLoading={enablingApiId === document.id}
              checked={
                enablingApiId === document.id
                  ? !document.canUpload
                  : document.canUpload
              }
              handleStatus={() => this.handleToggleClick(document)}
            />
          </div>
        </div>
      </Card>
    );
  }
}

function mapStateToProp({ app }) {
  return {
    user: app.user,
    config: app.config,
    isTestingMode: !!(app.user?.mode !== 'prod'),
    onboardingTutorialOrigin: app.onboardingTutorialOrigin,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    uploadActions: bindActionCreators(uploadActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(DocumentItem);
