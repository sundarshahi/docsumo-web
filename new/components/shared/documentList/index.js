/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import React from 'react';
import { connect } from 'react-redux';

import cx from 'classnames';
import { format } from 'date-fns';
import download from 'downloadjs';
import {
  Copy,
  EditPencil,
  EyeEmpty,
  Mail,
  MoreHoriz,
  Reports,
  Settings,
  TransitionRight,
  Upload,
} from 'iconoir-react';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { ReactComponent as BDownloadIcon } from 'new/assets/images/icons/bdownload.svg';
import { ReactComponent as CheckIcon } from 'new/assets/images/icons/check.svg';
import { ReactComponent as DeleteIcon } from 'new/assets/images/icons/delete.svg';
import { ReactComponent as DownloadIcon } from 'new/assets/images/icons/download.svg';
import { ReactComponent as EditIcon } from 'new/assets/images/icons/edit.svg';
import { ReactComponent as ErrorIcon } from 'new/assets/images/icons/error.svg';
import { ReactComponent as FileIcon } from 'new/assets/images/icons/file.svg';
import { ReactComponent as FolderIcon } from 'new/assets/images/icons/folder.svg';
import { ReactComponent as InfoIcon } from 'new/assets/images/icons/info.svg';
import { ReactComponent as LoaderIcon } from 'new/assets/images/icons/loader.svg';
import { ReactComponent as ReviewIcon } from 'new/assets/images/icons/review.svg';
import { ReactComponent as AutoIcon } from 'new/assets/images/icons/slash.svg';
import { ReactComponent as StatusReviewRequiredIcon } from 'new/assets/images/icons/status-review-required.svg';
import { ReactComponent as StatusReviewSkippedIcon } from 'new/assets/images/icons/status-review-skipped.svg';
import { ReactComponent as StatusReviewingIcon } from 'new/assets/images/icons/status-reviewing.svg';
import { ReactComponent as UserAvatarIcon } from 'new/assets/images/icons/user-avatar.svg';
import AutoClassifyModal from 'new/components/modals/AutoClassifyModal';
import AuditLogModal from 'new/components/shared/AuditLogModal';
import { Cell, HeaderCell, Row } from 'new/components/shared/tabularList';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'new/components/widgets/buttons';
import { Checkbox } from 'new/components/widgets/checkbox';
import { ThreeDotsLoaderIcon } from 'new/components/widgets/progress';
import { GlobalTooltip } from 'new/components/widgets/tooltip';
import { ErrorTooltip, HelpTooltip } from 'new/components/widgets/tooltip';
import * as documentConstants from 'new/constants/document';
import ttConstants from 'new/constants/helpTooltips';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import { default as OutlinedButton } from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import { IconMenuPortal } from 'new/ui-elements/IconMenu';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import Switch from 'react-switch';

import RenameFileFolderBox from '../RenameFileFolderBox';

import styles from './index.scss';

const SkeletonView = (props) => {
  const { className } = props;
  return (
    <div className={cx(styles.skeletonView, className)}>
      <Row className={styles.row}>
        <div className={cx(styles.pill, styles.icon)} />
        <div className={cx(styles.pill, styles.title)} />
        <div className={cx(styles.pill, styles.type)} />
        <div className={cx(styles.pill, styles.status)} />
        <div className={cx(styles.pill, styles.dateModified)} />
        <div className={cx(styles.pill, styles.dateAdded)} />
        <div className={cx(styles.pill, styles.actions)} />
      </Row>
      <Row className={styles.row}>
        <div className={cx(styles.pill, styles.icon)} />
        <div className={cx(styles.pill, styles.title)} />
        <div className={cx(styles.pill, styles.type)} />
        <div className={cx(styles.pill, styles.status)} />
        <div className={cx(styles.pill, styles.dateModified)} />
        <div className={cx(styles.pill, styles.dateAdded)} />
        <div className={cx(styles.pill, styles.actions)} />
      </Row>
      <Row className={styles.row}>
        <div className={cx(styles.pill, styles.icon)} />
        <div className={cx(styles.pill, styles.title)} />
        <div className={cx(styles.pill, styles.type)} />
        <div className={cx(styles.pill, styles.status)} />
        <div className={cx(styles.pill, styles.dateModified)} />
        <div className={cx(styles.pill, styles.dateAdded)} />
        <div className={cx(styles.pill, styles.actions)} />
      </Row>
    </div>
  );
};

const TitleHeaderCell = (props) => {
  const { className, sortOrder, onClick, title } = props;

  return (
    <HeaderCell
      className={cx(styles.titleHeaderCell, className)}
      sortOrder={sortOrder}
      onClick={onClick}
    >
      {title ? title : 'Name'}
    </HeaderCell>
  );
};

const TypeHeaderCell = (props) => {
  const { className } = props;

  return (
    <HeaderCell className={cx(styles.typeHeaderCell, className)}>
      Type
    </HeaderCell>
  );
};

class ServiceActionsCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enabled: this.props.service && this.props.service.canUpload,
      showAutoClassifyModal: false,
    };
  }

  handleStatus = (enabled) => {
    const { service, onActionClick } = this.props;
    onActionClick('status', service, enabled);
  };

  handleUploadClick = () => {
    const { service, onActionClick } = this.props;
    onActionClick('upload', service);
  };

  viewAutoClassifyModal = () => {
    this.setState({
      showAutoClassifyModal: true,
    });
  };
  hideAutoClassifyModal = () => {
    this.setState({
      showAutoClassifyModal: false,
    });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.service.canUpload !== this.props.service.canUpload) {
      this.setState({ enabled: this.props.service.canUpload });
    }
  }

  render() {
    const { enabled, showAutoClassifyModal } = this.state;
    const { value: type } = this.props.service;
    const { className, status, message } = this.props;
    return (
      <Cell className={cx(styles.actionsCell, className)}>
        {type === 'auto_classify' ? (
          <>
            <GlobalTooltip
              visible={message}
              position='bottom'
              description={message}
              className={styles.reviewToolTip}
            >
              <Switch
                onColor={'#405089'}
                offColor={'#e8eaed'}
                height={15}
                width={40}
                checkedIcon={null}
                uncheckedIcon={null}
                //disabled = {!enabled ? true : false }
                checked={enabled}
                onChange={(e) => this.handleStatus(e)}
                handleDiameter={20}
                className={styles.switch}
                boxShadow={'0 2px 3px rgba(109, 109, 109, 0.5)'}
                activeBoxShadow={'0 2px 3px rgba(109, 109, 109, 0.5)'}
              />
            </GlobalTooltip>

            <div
              role='button'
              className={styles.icon}
              onClick={() => this.viewAutoClassifyModal()}
            >
              <AutoIcon />
            </div>
            <AutoClassifyModal
              showAutoClassifyModal={showAutoClassifyModal}
              hideAutoClassifyModal={this.hideAutoClassifyModal}
              trainable={
                status === 'upload_more_doc' ||
                status === 'enable_more_apis' ||
                status === 'processing'
                  ? false
                  : true
              }
              handleStatus={this.handleStatus}
              canUpload={enabled}
            />
          </>
        ) : (
          <Switch
            onColor={'#405089'}
            offColor={'#e8eaed'}
            height={15}
            width={40}
            checkedIcon={null}
            uncheckedIcon={null}
            checked={enabled}
            onChange={(e) => this.handleStatus(e)}
            handleDiameter={20}
            className={cx(
              styles.switch,
              type === 'invoice' ? 'UFTooltipSwitch' : ''
            )}
            boxShadow={'0 2px 3px rgba(109, 109, 109, 0.5)'}
            activeBoxShadow={'0 2px 3px rgba(109, 109, 109, 0.5)'}
          />
        )}
      </Cell>
    );
  }
}

class UserActionsCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmDelete: false,
      deleting: false,
    };
  }

  handleEditClick = () => {
    const { onActionClick, user } = this.props;
    onActionClick('edit', user);
  };
  handleDeleteConfirmClick = () => {
    this.setState({
      confirmDelete: true,
    });
  };
  handleDeleteCancelClick = () => {
    this.setState({
      confirmDelete: false,
    });
  };
  handleDeleteClick = async () => {
    const { onActionClick, appActions, user } = this.props;
    this.setState({
      deleting: true,
    });
    try {
      await api.deleteMember({
        payload: {
          user_id: user.userId,
        },
      });
      onActionClick('delete', user);
    } catch (e) {
      const errMessage = e.responsePayload
        ? e.responsePayload.error
        : 'Something went wrong!';
      appActions.setToast({
        title: errMessage,
        error: true,
      });
    } finally {
      this.setState({
        confirmDelete: false,
        deleting: false,
      });
    }
  };

  render() {
    const { className } = this.props;
    const { default: isDefault } = this.props.user;
    return (
      <Cell className={cx(styles.actionsCell, className)}>
        {isDefault ? (
          ''
        ) : (
          <>
            <button
              className={cx('unstyled-btn', styles.btn)}
              onClick={() => this.handleEditClick()}
            >
              <EditIcon />
              <div className={cx(styles.tooltip, styles.wideTooltip)}>Edit</div>
            </button>
          </>
        )}
      </Cell>
    );
  }
}
const StatusHeaderCell = (props) => {
  const { className } = props;

  return (
    <HeaderCell className={cx(styles.statusHeaderCell, className)}>
      Status
    </HeaderCell>
  );
};

const DateModifiedHeaderCell = (props) => {
  const { className, sortOrder, sortKey, onClick } = props;

  return (
    <HeaderCell
      className={cx(styles.dateModifiedHeaderCell, className)}
      sortOrder={sortOrder}
      sortKey={sortKey}
      onClick={onClick}
    >
      Date Modified
    </HeaderCell>
  );
};

const DateAddedHeaderCell = (props) => {
  return (
    <HeaderCell
      {...props}
      className={cx(styles.dateAddedHeaderCell, props.className)}
    >
      Date Added
    </HeaderCell>
  );
};

const ActionsHeaderCell = (props) => {
  const { className } = props;

  return (
    <HeaderCell className={cx(styles.actionsHeaderCell, className)}>
      Actions
    </HeaderCell>
  );
};

export const CustomHeaderCell = (props) => {
  const { name, width, className } = props;

  return (
    <HeaderCell className={cx(className)} style={{ width: `${width}px` }}>
      {name}
    </HeaderCell>
  );
};

export const CustomAnalysisHeaderCell = (props) => {
  const {
    name,
    width,
    className,
    tooltipContent,
    tooltip,
    tooltipClassName,
    arrowClassName,
  } = props;

  return (
    <HeaderCell
      className={cx(styles.analysisHeader, className)}
      style={{ width: `${width}px` }}
    >
      {name}
      {tooltip ? (
        <div className={cx(styles.tooltip, tooltipClassName)}>
          {tooltipContent}
          <div className={cx(styles.arrow, arrowClassName)} />
        </div>
      ) : null}
    </HeaderCell>
  );
};

class CustomCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      viewLog: false,
      data: [],
      users: [],
    };
  }
  UNSAFE_componentWillMount() {
    let colors = [
      '#3D9F75',
      '#7AABB7',
      '#717677',
      '#337281',
      '#4FBED9',
      '#949123',
      '#5F6368',
      '#3D9F75',
      '#7AABB7',
      '#717677',
      '#337281',
      '#4FBED9',
      '#949123',
      '#5F6368',
    ];
    const {
      users: { users },
    } = this.props;
    for (let i = 0; i < users.length; i++) {
      users[i]['color'] = colors[i];
    }
    this.setState({
      users,
    });
  }
  handleLogView = async () => {
    const { appActions } = this.props;
    appActions.showLoaderOverlay();

    const { docId } = this.props;
    try {
      const response = await api.getLogInfo({
        queryParams: {
          doc_id: docId,
        },
      });
      const {
        data: { data },
      } = response.responsePayload;
      this.setState({
        data,
      });
    } catch (e) {
      //do nothing
    }
    appActions.hideLoaderOverlay();
    this.setState({
      viewLog: true,
    });
  };

  closeAuditModal = () => {
    this.setState({
      viewLog: false,
    });
  };
  render() {
    const { value, width, className, title, displayType } = this.props;
    const { viewLog, data, users } = this.state;
    return (
      <Cell className={cx(className)} style={{ width: `${width}px` }}>
        {displayType === 'folder' ? (
          <p> {value} </p>
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            role='button'
            tabIndex={0}
            onKeyDown={() => true}
            className={styles.titleSection}
          >
            <button
              key={`file-${value}`}
              className={cx('unstyled-btn', styles.auditLink)}
              title={'View Audit Log'}
              onClick={this.handleLogView}
            >
              <p>{value}</p>
            </button>
            {viewLog ? (
              <AuditLogModal
                title={title}
                onCloseBtnClick={this.closeAuditModal}
                data={data}
                users={users}
              />
            ) : (
              ''
            )}
          </div>
        )}
      </Cell>
    );
  }
}

function mapStateToProp({ users, app }) {
  return {
    users: users.usersPage,
    currentUser: app.user,
  };
}

function mapDispatchToProps() {
  return {};
}

const CheckboxCell = (props) => {
  const { checked = false, className } = props;

  return (
    <Cell className={cx('non-selectable', styles.checkboxCell, className)}>
      <Checkbox name='first' checked={checked} />
    </Cell>
  );
};

const TitleCell = (props) => {
  const {
    title,
    className,
    iconClassName,
    titleClassName,
    onSelctionChange,
    checked,
    docId,
    displayType,
    currentEditId,
  } = props;

  return (
    <Cell className={cx(styles.titleCell, className)}>
      <div
        onClick={(e) => e.stopPropagation()}
        role='button'
        tabIndex={0}
        onKeyDown={() => true}
        className={styles.titleSection}
      >
        <Checkbox
          onChange={onSelctionChange}
          checked={checked}
          name={docId}
          value={docId}
          className={cx(styles.checkbox, iconClassName)}
        />
      </div>
      {currentEditId === docId ? (
        <>
          <FileIcon
            className={cx(styles.icon, iconClassName, styles.icon_dark)}
          />
          <RenameFileFolderBox
            originalValue={title}
            displayType={displayType}
          />
        </>
      ) : (
        <>
          <FileIcon className={cx(styles.icon, iconClassName)} />
          <p className={cx(styles.title, titleClassName)} title={title}>
            {title}
          </p>
        </>
      )}
    </Cell>
  );
};

const ModelTitleCell = (props) => {
  const {
    title,
    className,
    iconClassName,
    titleClassName,
    onSelctionChange,
    checked,
    docId,
  } = props;

  return (
    <Cell className={cx(styles.titleCell, className)}>
      <div
        onClick={(e) => e.stopPropagation()}
        role='button'
        tabIndex={0}
        onKeyDown={() => true}
        className={styles.titleSection}
      >
        <Checkbox
          onChange={onSelctionChange}
          checked={checked}
          name={docId}
          value={docId}
          className={cx(styles.checkbox, iconClassName)}
        />
      </div>
      <p className={cx(styles.title, titleClassName)} title={title}>
        {title}
      </p>
    </Cell>
  );
};

const FolderTitleCell = (props) => {
  const {
    title,
    className,
    iconClassName,
    titleClassName,
    onSelctionChange,
    checked,
    folderId,
    currentEditId,
    displayType,
  } = props;

  return (
    <Cell className={cx(styles.titleCell, className)}>
      <div
        onClick={(e) => e.stopPropagation()}
        role='button'
        tabIndex={0}
        onKeyDown={() => true}
        className={styles.titleSection}
      >
        <Checkbox
          onChange={onSelctionChange}
          checked={checked}
          name={folderId}
          value={folderId}
          className={cx(styles.checkbox, iconClassName)}
        />
      </div>
      {currentEditId === folderId ? (
        <>
          <FolderIcon
            className={cx(
              styles.folderIcon,
              iconClassName,
              styles.folderIcon_dark
            )}
          />
          <RenameFileFolderBox
            originalValue={title}
            displayType={displayType}
          />
        </>
      ) : (
        <>
          <FolderIcon className={cx(styles.folderIcon, iconClassName)} />
          <p className={cx(styles.title, titleClassName)} title={title}>
            {title}
          </p>
        </>
      )}
    </Cell>
  );
};

const CustomTextCell = (props) => {
  const { title, className, titleClassName, downloadUrl, appActions } = props;

  const downloadAction = () => {
    try {
      appActions.setToast({
        title: 'Your download will start in few seconds.',
        timeout: 2,
      });
      download(downloadUrl);
    } catch (e) {
      appActions.setToast({
        title: 'Something went wrong!',
        error: true,
      });
    }
  };

  return (
    <Cell className={cx(styles.titleCell, className)}>
      <p className={cx(styles.title, titleClassName)} title={title}>
        {downloadUrl ? (
          <div className={styles.bulkDownload}>
            {title}
            <Button
              text='Download'
              title='Download'
              iconLeft={<BDownloadIcon />}
              iconClassName={styles.icon}
              appearance={BUTTON_APPEARANCES.PRIMARY_REVERSED}
              className={cx(styles.btn, styles.btnCancel)}
              onClick={downloadAction}
            />
          </div>
        ) : (
          title
        )}
      </p>
    </Cell>
  );
};

class CustomMetricCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { modelId } = this.props;
    setTimeout(() => {
      const progress = document.getElementById(`progress-${modelId}`);
      if (progress) {
        progress.style.width = progress.getAttribute('data-done') + '%';
      }
    }, 500);
  }

  render() {
    const {
      status,
      metrics = {},
      modelId,
      timeElapsed,
      timeRemain,
      timeEstimated,
    } = this.props;
    const { testMetrics = {} } = metrics;
    const { macroAvg: { accuracy, f1Score, precision, recall, support } = {} } =
      testMetrics;
    return (
      <>
        {status === 'RUNNING' ? (
          <Cell className={styles.timeCell}>
            <div className={styles.timeBlock}>
              <div className={styles.timeField}>
                <p className={styles.timeElapsed}>
                  {timeElapsed || 10} mins elapsed
                </p>
                <p className={styles.timeRemain}>
                  {timeRemain || 40} mins remaining
                </p>
              </div>
              <div className={styles.progressBar}>
                <div
                  id={`progress-${modelId}`}
                  data-done={
                    ((timeEstimated - timeRemain) / timeEstimated) * 100
                  }
                  className={styles.progressDone}
                ></div>
              </div>
              <div className={styles.emailNotification}>
                <p className={styles.emailText}>
                  You will receive an email when training is done.
                </p>
              </div>
            </div>
          </Cell>
        ) : status === 'COMPLETE' ? (
          <div className={styles.analysis}>
            <Cell className={styles.analysisCell}>
              <p className={styles.complete}>
                {accuracy || f1Score
                  ? `${Math.round(
                      Number((accuracy || f1Score).toFixed(2)) * 100
                    )}%`
                  : 0}
              </p>
            </Cell>
            <Cell className={styles.analysisCell}>
              <p className={styles.complete}>
                {precision ? precision.toFixed(2) : 0}
              </p>
            </Cell>
            <Cell className={styles.analysisCell}>
              <p className={styles.complete}>
                {recall ? recall.toFixed(2) : 0}
              </p>
            </Cell>
            <Cell className={styles.analysisCell}>
              <p className={styles.complete}>
                {f1Score ? f1Score.toFixed(2) : 0}
              </p>
            </Cell>
            <Cell className={styles.analysisCell}>
              <p className={styles.complete}>
                {support ? support.toFixed(2) : 0}
              </p>
            </Cell>
          </div>
        ) : (
          <p className={styles.failed}>FAILED</p>
        )}
      </>
    );
  }
}

const UserDetailCell = (props) => {
  const { userName, email, className } = props;

  return (
    <Cell className={cx(styles.userCell, className)}>
      <UserAvatarIcon className={styles.icon} />
      <div className={styles.detailCell}>
        <p className={cx(styles.title)} title={userName}>
          {userName}
        </p>
        <p className={cx(styles.subtitle)} title={email}>
          {email}
        </p>
      </div>
    </Cell>
  );
};

const LinkTextCell = (props) => {
  const { text, link, className, titleClassName } = props;

  return (
    <Cell className={cx(styles.titleCell, className)}>
      <a
        className={cx(styles.title, titleClassName)}
        title={text}
        href={link}
        target='_blank'
        rel='noopener noreferrer'
      >
        {text}
      </a>
    </Cell>
  );
};

function mapStateToProps(state) {
  const { config } = state.app;

  return {
    config,
  };
}

const TypeCell = connect(mapStateToProps)((props) => {
  const { config, type, className, docId, onActionClick, empty } = props;

  if (empty) {
    return (
      <Cell className={cx('non-selectable', styles.typeCell, className)}></Cell>
    );
  }

  let typeTitle = 'Other';
  config &&
    config.documentTypes &&
    config.documentTypes.forEach((documentType) => {
      if (documentType.value === type) {
        typeTitle = documentType.title;
      }
    });

  return (
    <Cell className={cx('non-selectable', styles.typeCell, className)}>
      <div
        onClick={(e) => e.stopPropagation()}
        role='button'
        tabIndex={0}
        onKeyDown={() => true}
      >
        <InfoIcon
          className={cx(styles.icon)}
          onClick={() => onActionClick('view', docId)}
        />
      </div>
      <p className={styles.docTitle}>{typeTitle}</p>
    </Cell>
  );
});

const StatusCell = (props) => {
  const {
    type,
    status,
    className,
    iconClassName,
    textClassName,
    errMessage,
    empty,
  } = props;

  let statusText = '';
  let StatusIcon = null;

  /* eslint-disable indent */
  switch (status) {
    case documentConstants.STATUSES.NEW: {
      statusText = 'Processing';
      StatusIcon = ThreeDotsLoaderIcon;
      break;
    }

    case documentConstants.STATUSES.PROCESSING: {
      statusText = 'Processing';
      StatusIcon = ThreeDotsLoaderIcon;
      break;
    }

    case documentConstants.STATUSES.PROCESSED: {
      statusText = 'Processed';
      StatusIcon = CheckIcon;
      break;
    }

    case documentConstants.STATUSES.REVIEW_REQUIRED: {
      statusText = 'Review required';
      StatusIcon = ReviewIcon;
      break;
    }

    case documentConstants.STATUSES.REVIEWING: {
      statusText = 'Reviewing';
      StatusIcon = ReviewIcon;
      break;
    }

    case documentConstants.STATUSES.REVIEW_SKIPPED: {
      statusText = 'Review skipped';
      StatusIcon = ReviewIcon;
      break;
    }

    case documentConstants.STATUSES.ERRED: {
      statusText = 'Erred';
      StatusIcon = ErrorIcon;
      break;
    }
    case 'upload_more_doc': {
      statusText = 'Disabled';
      break;
    }

    case 'enable_more_apis': {
      statusText = 'Disabled';
      break;
    }
    default: {
      statusText = 'Erred';
      StatusIcon = ErrorIcon;
      break;
    }
  }
  /* eslint-enable indent */

  if (empty) {
    return <Cell className={cx(styles.statusCell, className)}></Cell>;
  }

  if (errMessage) {
    return (
      <Cell className={cx(styles.statusCell, className)}>
        <ErrorTooltip overlay={errMessage}>
          <div className={styles.errorStatusCell}>
            <StatusIcon className={cx(styles.icon, iconClassName)} />
            <p className={cx(styles.text, textClassName)}>{statusText}</p>
          </div>
        </ErrorTooltip>
      </Cell>
    );
  }
  if (type === 'auto_classify' && StatusIcon) {
    return (
      <Cell className={cx(styles.statusCell, className)}>
        {StatusIcon ? (
          <StatusIcon className={cx(styles.iconStatus, iconClassName)} />
        ) : null}
      </Cell>
    );
  }
  return (
    <Cell className={cx(styles.statusCell, className)}>
      {StatusIcon ? (
        <StatusIcon className={cx(styles.icon, iconClassName)} />
      ) : null}
      <p
        className={cx(
          styles.text,
          textClassName,
          status === documentConstants.STATUSES.REVIEWING ? 'UFReviewCell' : ''
        )}
      >
        {statusText}
      </p>
    </Cell>
  );
};

const ReviewStatusCell = (props) => {
  const { status, className, iconClassName, textClassName } = props;

  let statusText = '';
  let StatusIcon = null;
  let statusIconClassName = null;

  /* eslint-disable indent */
  switch (status) {
    case documentConstants.STATUSES.REVIEW_REQUIRED: {
      statusText = 'To Review';
      StatusIcon = StatusReviewRequiredIcon;
      statusIconClassName = styles.reviewRequiredIcon;
      break;
    }

    case documentConstants.STATUSES.REVIEWING: {
      statusText = 'Reviewing';
      StatusIcon = StatusReviewingIcon;
      statusIconClassName = styles.reviewingIcon;
      break;
    }

    case documentConstants.STATUSES.REVIEW_SKIPPED: {
      statusText = 'Skipped';
      StatusIcon = StatusReviewSkippedIcon;
      statusIconClassName = styles.reviewSkippedIcon;
      break;
    }
  }
  /* eslint-enable indent */

  return (
    <Cell className={cx(styles.reviewStatusCell, className)}>
      <StatusIcon
        className={cx(styles.icon, statusIconClassName, iconClassName)}
      />
      <p className={cx(styles.text, textClassName)}>{statusText}</p>
    </Cell>
  );
};

const ActionsCell = (props) => {
  const { document, className, btnClassName, onActionClick } = props;

  const { docId, status, isDeleting } = document;

  const isNew = status === documentConstants.STATUSES.NEW;
  const isProcessing = status === documentConstants.STATUSES.PROCESSING;
  const isErred = status === documentConstants.STATUSES.ERRED;

  const viewActionAllowed = !isErred && !isDeleting;
  const reviewActionAllowed =
    !isNew && !isProcessing && !isErred && !isDeleting;
  const deleteActionAllowed = !isDeleting;

  const handleActionClick = (type, docId) => {
    onActionClick(type, docId);
  };

  let actions = [
    {
      type: 'download',
      allowed: viewActionAllowed,
      onClick: (e) => {
        e.stopPropagation();
        handleActionClick('download', docId);
      },
    },
    {
      type: 'view',
      allowed: viewActionAllowed,
      onClick: (e) => {
        e.stopPropagation();
        handleActionClick('view', docId);
      },
    },
    {
      type: 'review',
      allowed: reviewActionAllowed,
      onClick: (e) => {
        e.stopPropagation();
        handleActionClick('review', docId);
      },
    },
    {
      type: 'delete',
      allowed: deleteActionAllowed,
      onClick: (e) => {
        e.stopPropagation();
        handleActionClick('delete', docId);
      },
    },
  ];

  const nodes = [];

  actions.forEach((action) => {
    /* eslint-disable indent */
    switch (action.type) {
      case documentConstants.ACTIONS.VIEW: {
        nodes.push(
          <button
            key={action.type}
            disabled={!action.allowed}
            title='View'
            className={cx('unstyled-btn', styles.btn, btnClassName)}
            onClick={action.onClick}
          >
            <InfoIcon />
            <div className={styles.tooltip}>View</div>
          </button>
        );
        break;
      }

      case documentConstants.ACTIONS.REVIEW: {
        nodes.push(
          <button
            key={action.type}
            disabled={!action.allowed}
            title='Review'
            className={cx('unstyled-btn', styles.btn, btnClassName)}
            onClick={action.onClick}
          >
            <ReviewIcon />
            <div className={styles.tooltip}>Review</div>
          </button>
        );
        break;
      }

      case documentConstants.ACTIONS.DELETE: {
        nodes.push(
          <button
            key={action.type}
            disabled={!action.allowed}
            title='Delete'
            className={cx('unstyled-btn', styles.btn, btnClassName)}
            onClick={action.onClick}
          >
            {isDeleting ? (
              <LoaderIcon className={styles.loaderIcon} />
            ) : (
              <DeleteIcon />
            )}

            <div className={styles.tooltip}>Delete</div>
          </button>
        );
        break;
      }

      case documentConstants.ACTIONS.DOWNLOAD: {
        nodes.push(
          <button
            key={action.type}
            disabled={!action.allowed}
            title='Download'
            className={cx('unstyled-btn', styles.btn, btnClassName)}
            onClick={action.onClick}
          >
            <DownloadIcon />
            <div className={styles.tooltip}>Download</div>
          </button>
        );
        break;
      }
    }
    /* eslint-enable indent */
  });

  return <Cell className={cx(styles.actionsCell, className)}>{nodes}</Cell>;
};

const DocTypeActionsCell = (props) => {
  const {
    document,
    btnClassName,
    onActionClick,
    toolTip,
    allowEditFields,
    userDetails,
    config,
    isDisabled = false,
    reviewClassName = '',
    updateFileUploadOrigin,
  } = props;
  const handleActionClick = (type, document) => {
    onActionClick(type, document);
  };
  const { canSwitchToOldMode = true } = config;
  const { excelType, docType, isEditable = true } = document;
  const excelTypeFlag = excelType;
  const { docCounts } = document;
  const { reviewing } = docCounts;
  const actions = [
    {
      type: documentConstants.ACTIONS.EDIT_FIELDS,
      // allowed: editActionAllowed,
      onClick: () => {
        // Add mixpanel events
        mixpanel.track(MIXPANEL_EVENTS.edit_field, {
          'work email': userDetails['work email'],
          'document type': document.docType,
          origin: 'Document Type',
          version: 'new',
          mode: userDetails.mode,
          canSwitchUIVersion: canSwitchToOldMode,
        });

        handleActionClick(docCounts.all ? 'editFields' : 'edit', document);
      },
    },
    {
      type: documentConstants.ACTIONS.UPLOAD,
      onNext: () => {},
      onClick: () => {
        // Add mixpanel events
        mixpanel.track(MIXPANEL_EVENTS.upload_document_type, {
          'work email': userDetails['work email'],
          'document type': document.docType,
          origin: 'Document Type',
          location: 'Document Type - Upload button',
          version: 'new',
          mode: userDetails.mode,
          canSwitchUIVersion: canSwitchToOldMode,
        });
        updateFileUploadOrigin();
        handleActionClick('upload', document);
      },
    },
    {
      type: documentConstants.ACTIONS.REVIEW,
      onClick: () => {
        // Add mixpanel events
        mixpanel.track(MIXPANEL_EVENTS.review_document_type, {
          'work email': userDetails['work email'],
          'document type': document.docType,
          origin: 'Document Type',
          version: 'new',
          mode: userDetails.mode,
          canSwitchUIVersion: canSwitchToOldMode,
        });

        handleActionClick(
          docType.startsWith('auto_classify')
            ? 'classifyView'
            : !excelTypeFlag
            ? 'review'
            : 'excelView',
          document
        );
      },
    },
  ];

  const nodes = [];

  actions.forEach((action) => {
    /* eslint-disable indent */
    switch (action.type) {
      case documentConstants.ACTIONS.EDIT_FIELDS: {
        nodes.push(
          <HelpTooltip
            id={toolTip && ttConstants.TT_DOC_TYPE_EDIT_DOC_ITEM}
            onNext={action.onClick}
            key={action.type}
          >
            <OutlinedButton
              variant='outlined'
              size='small'
              icon={EditPencil}
              key={action.type}
              disabled={
                !allowEditFields ||
                excelTypeFlag ||
                !isEditable ||
                docType === 'auto_classify' ||
                docType === 'auto_classify__test' ||
                isDisabled ||
                !reviewing
              }
              className={styles.bottomActionsCell__btn}
              onClick={action.onClick}
            >
              Edit Fields
            </OutlinedButton>
          </HelpTooltip>
        );
        break;
      }

      case documentConstants.ACTIONS.UPLOAD: {
        nodes.push(
          <HelpTooltip
            id={toolTip && ttConstants.TT_DOC_TYPE_UPLOAD_DOC_ITEM}
            onNext={action.onNext}
            key={action.type}
          >
            <OutlinedButton
              variant='outlined'
              size='small'
              icon={Upload}
              key={action.type}
              className={cx(
                styles.bottomActionsCell__btn,
                docType === 'invoice' ? 'UFTooltipUpload' : ''
              )}
              onClick={action.onClick}
              disabled={isDisabled}
            >
              Upload
            </OutlinedButton>
          </HelpTooltip>
        );
        break;
      }

      case documentConstants.ACTIONS.REVIEW: {
        nodes.push(
          <HelpTooltip
            id={toolTip && ttConstants.TT_DOC_TYPE_REVIEW_DOC_ITEM}
            onNext={action.onClick}
            key={action.type}
          >
            <OutlinedButton
              variant='outlined'
              size='small'
              icon={EyeEmpty}
              key={action.type}
              disabled={!docCounts.reviewing || isDisabled}
              className={cx(styles.bottomActionsCell__btn, reviewClassName)}
              onClick={action.onClick}
            >
              Review
            </OutlinedButton>
          </HelpTooltip>
        );
        break;
      }
    }
    /* eslint-enable indent */
  });

  return <Cell className={styles.bottomActionsCell}>{nodes}</Cell>;
};
const DocTypeHeaderActionsCell = (props) => {
  const {
    document,
    className,
    onActionClick,
    allowDuplicate,
    userDetails,
    testMode,
    allowSetting,
    config,
    isDisabled,
  } = props;
  const {
    excelType,
    docType,
    flags: { hasUpdatedDocSettings = false } = {},
  } = document;
  const { canSwitchToOldMode = true } = config;

  const handleActionClick = (type, document) => {
    onActionClick(type, document);
  };

  const iconMenuOptions = [
    {
      title: 'Duplicate',
      icon: <Copy height={16} width={16} />,
      key: 'duplicate',
      disabled:
        !allowDuplicate ||
        docType === 'auto_classify' ||
        docType === 'auto_classify__test',
    },
    {
      title: 'Email To',
      icon: <Mail />,
      key: 'mail',
      disabled: excelType,
    },
  ];

  let actions = [
    {
      type: documentConstants.ACTIONS.ANALYTICS,
      onClick: () => handleActionClick('analytics', document),
    },
    {
      type: documentConstants.ACTIONS.SETTINGS,
      onClick: () => {
        // Add mixpanel events
        mixpanel.track(MIXPANEL_EVENTS.settings_document_type, {
          'work email': userDetails['work email'],
          'document type': document.docType,
          origin: 'Document Type',
          version: 'new',
          mode: userDetails.mode,
          canSwitchUIVersion: canSwitchToOldMode,
        });
        handleActionClick('settings', document);
      },
    },
    {
      type: documentConstants.ACTIONS.MORE_SETTINGS,
      onClick: ({ key }) => handleActionClick(key, document),
    },
  ];

  let pushToProdItem = {};

  if (testMode) {
    pushToProdItem = {
      type: documentConstants.ACTIONS.PUSH_TO_PRODUCTION,
      onClick: () => {
        // Add mixpanel events

        mixpanel.track(MIXPANEL_EVENTS.push_doc_type_click, {
          'work email': userDetails['work email'],
          'doc type': document.docType,
          origin: 'push_doc_type_click',
          mode: testMode ? 'test' : 'prod',
          version: 'new',
          'organization ID': userDetails['org Id'],
          canSwitchUIVersion: canSwitchToOldMode,
        });
        handleActionClick('push-to-production', document);
      },
    };
  }

  actions = [pushToProdItem, ...actions];

  const nodes = [];

  actions.forEach((action, index) => {
    /* eslint-disable indent */
    switch (action.type) {
      case documentConstants.ACTIONS.PUSH_TO_PRODUCTION: {
        nodes.push(
          <Tooltip
            key={`push_to_production_${index}`}
            label={
              hasUpdatedDocSettings
                ? 'Changes available to be pushed to production'
                : 'Push to production'
            }
            placement='bottom'
            showTooltip={true}
            rootClassname={styles.navTooltip}
            tooltipOverlayClassname={styles.pushToProdTooltip}
          >
            {hasUpdatedDocSettings ? (
              <span className={styles.activeChanges} />
            ) : (
              ''
            )}
            <IconButton
              variant='text'
              icon={<TransitionRight height={20} width={20} />}
              size='small'
              className={styles.headerActionsCell__btn}
              onClick={action.onClick}
              disabled={isDisabled}
            />
          </Tooltip>
        );
        break;
      }

      case documentConstants.ACTIONS.ANALYTICS: {
        nodes.push(
          <Tooltip
            key={`analytics_${index}`}
            label='Analytics'
            placement='bottom'
            showTooltip={true}
            rootClassname={styles.navTooltip}
          >
            <IconButton
              variant='text'
              icon={<Reports height={20} width={20} />}
              size='small'
              className={styles.headerActionsCell__btn}
              disabled={
                excelType ||
                docType === 'auto_classify' ||
                docType === 'auto_classify__test' ||
                isDisabled
              }
              onClick={action.onClick}
            />
          </Tooltip>
        );
        break;
      }

      case documentConstants.ACTIONS.SETTINGS: {
        nodes.push(
          <Tooltip
            key={`settings_${index}`}
            label='Settings'
            placement='bottom'
            showTooltip={true}
            rootClassname={styles.navTooltip}
          >
            <IconButton
              variant='text'
              icon={<Settings height={20} width={20} />}
              size='small'
              className={styles.headerActionsCell__btn}
              onClick={action.onClick}
              disabled={!allowSetting || isDisabled}
            />
          </Tooltip>
        );
        break;
      }

      case documentConstants.ACTIONS.MORE_SETTINGS: {
        nodes.push(
          <IconMenuPortal
            key={`more_settings_${index}`}
            menuIcon={<MoreHoriz height={20} width={20} />}
            options={iconMenuOptions}
            onDropdownItemClick={action.onClick}
            placement='right-start'
            disabled={isDisabled}
          />
        );
        break;
      }
    }
    /* eslint-enable indent */
  });

  return (
    <Cell className={cx(styles.headerActionsCell, className)}>{nodes}</Cell>
  );
};

const DateCell = (props) => {
  const { date, className } = props;
  let dateTime = new Date(date).getTime();
  return (
    <Cell className={cx('non-selectable', styles.dateCell, className)}>
      <div>
        <p>{format(dateTime, 'h:mm a')}</p>
        <p>{format(dateTime, 'd LLL yyyy')}</p>
      </div>
    </Cell>
  );
};

export {
  ActionsCell,
  ActionsHeaderCell,
  CheckboxCell,
  CustomMetricCell,
  CustomTextCell,
  DateAddedHeaderCell,
  DateCell,
  DateModifiedHeaderCell,
  DocTypeActionsCell,
  DocTypeHeaderActionsCell,
  FolderTitleCell,
  LinkTextCell,
  ModelTitleCell,
  ReviewStatusCell,
  ServiceActionsCell,
  SkeletonView,
  StatusCell,
  StatusHeaderCell,
  TitleCell,
  TitleHeaderCell,
  TypeCell,
  TypeHeaderCell,
  UserActionsCell,
  UserDetailCell,
};

export default connect(mapStateToProp, mapDispatchToProps)(CustomCell);
