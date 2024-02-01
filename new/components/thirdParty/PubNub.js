import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { actions as servicesActions } from 'new/redux/services/actions';
import { actions as uploadActions } from 'new/redux/upload/actions';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import * as api from 'new/api';
import * as pubNub from 'new/thirdParty/pubNub';
class PubNub extends Component {
  componentDidMount() {
    pubNub.loadSdk({
      onLoad: this.initOnLoad,
    });
  }

  componentDidUpdate(prevProps) {
    const { tokenExpired: prevTokenExpired } = prevProps;
    const { tokenExpired } = this.props;

    if (!prevTokenExpired && tokenExpired) {
      // User token has expired
      pubNub.stop();
    }
  }

  initOnLoad = () => {
    const { user, config, tokenExpired } = this.props;

    if (user && config && !tokenExpired) {
      this.initPubNub({ config });
    }
  };

  initPubNub = ({ config }) => {
    const pubsubAuthKey = _.get(config, 'pubsubAuthKey');
    const pubsubSubKey = _.get(config, 'pubsubSubKey');
    const pubsubChannelName = _.get(config, 'pubsubChannelName');
    this.listener = {
      message: this.handleMessage,
      status: this.handleStatusEvent,
    };
    pubNub.init({
      authKey: pubsubAuthKey,
      subscribeKey: pubsubSubKey,
      userId: pubsubChannelName,
    });
    pubNub.addListener(this.listener);
    pubNub.subscribeChannel(pubsubChannelName);
    //remove pbnub logs
    // try {
    //   api.savePubnubLogs({
    //     payload: {
    //       payload: {
    //         authKey: pubsubAuthKey,
    //         subscribeKey: pubsubSubKey,
    //         userId: pubsubChannelName,
    //       },
    //       event: '',
    //     },
    //     type: 'connection_start',
    //   });
    // } catch (err) {
    //   console.log(err);
    // }
  };

  recycleAuthKey = async ({ attemptCount = 1 } = {}) => {
    const { tokenExpired } = this.props;
    if (tokenExpired) {
      // User session has expired
      return;
    }

    try {
      const response = await api.getConfig();
      const config = _.get(response.responsePayload, 'data');
      const pubsubAuthKey = _.get(config, 'pubsubAuthKey');

      this.props.appActions.updateConfig({
        updates: {
          pubsubAuthKey,
        },
      });
      pubNub.setAuthKey({
        authKey: pubsubAuthKey,
        reconnect: true,
      });
    } catch (e) {
      if (e && e.statusCode && e.statusCode === 401) {
        // User session has expired
        return;
      }

      if (attemptCount < 3) {
        setTimeout(() => {
          this.recycleAuthKey({
            attemptCount: attemptCount + 1,
          });
        }, _.random(5000, 10000));
      }
    }
  };

  handleMessage = (msg) => {
    const event = _.get(msg, 'message.event');
    const payload = _.get(msg, 'message.payload');
    const { selectedFolderId } = this.props;
    let queryParams = {
      q: '',
      sort_by: ['created_date.desc'],
      view: 'folder',
    };
    queryParams['folder_id'] = selectedFolderId;
    //remove pbnub logs
    // try {
    //   api.savePubnubLogs({
    //     payload: msg?.message,
    //     type: 'receive_message',
    //   });
    // } catch (err) {
    //   console.log(err);
    // }
    /* eslint-disable indent */
    switch (event) {
      case 'auto_classification_toggle':
        this.props.servicesActions.statusUpdate({
          serviceId: _.get(payload, 'service_id'),
          status: _.get(payload, 'can_upload'),
        });
        this.props.documentActions.changeAutoClassifyStatus({
          autoClassifyStatus: 'completed',
        });
        break;
      case 'pdf_split_complete':
        this.props.documentActions.allDocumentsFetch({
          queryParams,
        });
        this.props.documentActions.fetchDocumentCounts();
        this.props.uploadActions.updateFileDataWithDocId({
          docId: _.get(payload, 'doc_id'),
          updates: {
            status: 'split',
            folderId: _.get(payload, 'folder_id'),
            errMessage: _.get(payload, 'err_message'),
          },
        });
        break;
      case 'document_upload':
        this.props.documentActions.allDocumentsFetch({
          queryParams,
        });
        this.props.documentActions.fetchDocumentCounts();
        break;
      case 'document_count_update':
        this.props.documentActions.setDocumentCounts({
          counts: _.get(payload, 'count'),
          counts_folder: _.get(payload, 'count_folder'),
        });
        break;
      case 'summary_update_complete':
        this.props.documentActions.updateSummary({
          docId: _.get(payload, 'doc_id'),
        });
        break;
      case 'docs_permission_update':
        this.props.appActions.updatePermissionConfig();
        break;

      case 'document_status_change':
        if (_.get(payload, 'type')) {
          this.props.documentActions.updateDocData({
            docId: _.get(payload, 'doc_id'),
            updates: {
              status: _.get(payload, 'status'),
              type: _.get(payload, 'type'),
              errMessage: _.get(payload, 'err_message'),
            },
          });
        } else {
          this.props.documentActions.updateDocData({
            docId: _.get(payload, 'doc_id'),
            updates: {
              status: _.get(payload, 'status'),
              errMessage: _.get(payload, 'err_message'),
            },
          });
        }
        this.props.uploadActions.updateFileDataWithDocId({
          docId: _.get(payload, 'doc_id'),
          updates: {
            status: _.get(payload, 'status'),
            errMessage: _.get(payload, 'err_message'),
          },
        });
        this.props.documentActions.updateReviewDocData({
          docId: _.get(payload, 'doc_id'),
          updates: {
            status: _.get(payload, 'status'),
          },
        });
        if (_.get(payload, 'credit')) {
          this.props.appActions.updateUserCredit({
            credits: _.get(payload, 'credit', ''),
          });
        }
        break;
      case 'document_auto_assign':
        this.props.documentActions.updateAssignData({
          docId: _.get(payload, 'doc_id'),
          updates: {
            email: _.get(payload, 'email'),
            avatarUrl: _.get(payload, 'avatar_url'),
            fullName: _.get(payload, 'full_name'),
            userId: _.get(payload, 'user_id'),
          },
        });
        break;
    }
    /* eslint-enable indent */
  };

  handleStatusEvent = (event) => {
    if (event.error) {
      if (event.statusCode === 403) {
        // Pubnub token expired
        //remove pubnub logs
        // try {
        //   api.savePubnubLogs({
        //     payload: { payload: event, event: '' },
        //     type: 'recycle_authkey',
        //   });
        // } catch (err) {
        //   console.log(err);
        // }
        this.recycleAuthKey();
      } else if (event.category === 'PNNetworkIssuesCategory') {
        //remove pubnub logs
        // try {
        //   api.savePubnubLogs({
        //     payload: { payload: event, event: '' },
        //     type: 'recycle_authkey',
        //   });
        // } catch (err) {
        //   console.log(err);
        // }
        pubNub.pubnubReconnect();
      }
    }
  };

  render() {
    return null;
  }
}

class PubNubContainer extends Component {
  componentDidMount() {
    pubNub.prefetchSdk();
  }

  render() {
    const { user } = this.props;
    if (!user) return null;

    return <PubNub {...this.props} />;
  }
}

function mapStateToProp(state) {
  const { user, config, tokenExpired } = state.app;

  const { selectedFolderId } = state.documents;

  return {
    selectedFolderId,
    user,
    config,
    tokenExpired,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
    documentActions: bindActionCreators(documentActions, dispatch),
    servicesActions: bindActionCreators(servicesActions, dispatch),
    uploadActions: bindActionCreators(uploadActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(PubNubContainer);
