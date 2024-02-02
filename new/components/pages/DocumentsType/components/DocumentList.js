import React, { Fragment } from 'react';

import _ from 'lodash';
import { getMemberPermissions } from 'new/helpers/permissions';

import DocumentItem from './DocumentItem';
import DocumentListEmptyState from './DocumentListEmptyState';

export class DocumentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allowDuplicate: true,
      allowEditFields: true,
      allowSetting: true,
    };
  }

  componentDidMount() {
    const permissions = getMemberPermissions() || {};
    this.setState({
      ...permissions,
    });
  }

  render() {
    const {
      documents,
      onActionClick,
      getConfig,
      enableDocumentType,
      isDisabled = false,
      uploadSampleDocType,
      isModalOpen,
    } = this.props;

    const { allowEditFields, allowDuplicate, allowSetting } = this.state;

    return (
      <Fragment>
        {_.isEmpty(documents) ? (
          <DocumentListEmptyState show={!isDisabled} />
        ) : (
          documents.map((document, i) => {
            return (
              <DocumentItem
                key={i}
                document={document}
                onActionClick={onActionClick}
                getConfig={getConfig}
                toolTip={i === 0}
                allowEditFields={allowEditFields}
                allowDuplicate={allowDuplicate}
                allowSetting={allowSetting}
                isDisabled={isDisabled}
                enableDocumentType={enableDocumentType}
                uploadSampleDocType={uploadSampleDocType}
                isModalOpen={isModalOpen}
              />
            );
          })
        )}
      </Fragment>
    );
  }
}
