import React, { Component, Fragment } from 'react';

import { CheckboxDocumentGroup } from 'client/components/widgets/checkbox';

import styles from './selectType.scss';

class SelectDocType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: '',
    };
  }
  UNSAFE_componentWillMount() {
    const { value } = this.props;
    {
      value || value === 0
        ? this.setState({
            //dropDownValue:label || option && option[0].label,
            uiValue: value,
          })
        : null;
    }
  }

  render() {
    const { enabledDocument, typeFiltered, handleFilterChange } = this.props;
    return (
      <Fragment>
        <CheckboxDocumentGroup
          options={enabledDocument}
          checked={typeFiltered}
          onChange={handleFilterChange}
          labelClassName={styles.typefilterlabel}
          className={styles.typefilter}
          countClassName={styles.typefilterCount}
        />
      </Fragment>
    );
  }
}

export default SelectDocType;
