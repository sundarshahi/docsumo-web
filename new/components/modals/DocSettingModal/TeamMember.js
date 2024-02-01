import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import _ from 'lodash';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';

import styles from './teamMember.scss';

class TeamMember extends Component {
  constructor(props) {
    super(props);
    this.state = {
      team: [
        { id: 1, fullName: 'Sunil Bista' },
        { id: 2, fullName: 'Janardan Banjara' },
        { id: 3, fullName: 'Aatish Shakya' },
        { id: 4, fullName: 'Subash Timilsina' },
        { id: 5, fullName: 'Dipesh Gyawali' },
        { id: 6, fullName: 'Bikram Dahal' },
        { id: 7, fullName: 'Pranjal Dhakal' },
        { id: 8, fullName: 'Pinky Sitikhu' },
      ],
      selectedTeam: [],
      idSelected: [],
      toggleDropDown: false,
      toggleMenu: false,
    };
  }
  UNSAFE_componentWillMount() {
    const { value, option } = this.props;
    {
      value || value === 0
        ? this.setState({
            selectedTeam:
              Object.keys(value).length !== 0
                ? value.map((item) => item.fullName)
                : [],
            idSelected:
              Object.keys(value).length !== 0
                ? value.map((item) => item.id)
                : [],
          })
        : null;
    }
    this.setState({
      team: option,
    });
  }
  handleTeamChange = (selectedTeam) => {
    const { handleChangedValueSubmit, id, filterId, label } = this.props;
    let checkedTeam = [];
    const { team } = this.state;
    for (let i = 0; i < selectedTeam.length; i++) {
      for (let j = 0; j < team.length; j++) {
        if (selectedTeam[i] === team[j].id) {
          checkedTeam.push(team[j].fullName);
        }
      }
    }
    this.setState(
      {
        selectedTeam: checkedTeam,
        idSelected: selectedTeam,
      },
      () => {
        const { team, idSelected } = this.state;
        let assignedMember = [];

        for (let i = 0; i < idSelected.length; i++) {
          for (let j = 0; j < team.length; j++) {
            if (idSelected[i] === team[j].id) {
              assignedMember.push(team[j]);
            }
          }
        }
        handleChangedValueSubmit({
          id: id,
          value: assignedMember,
          filterId: filterId,
          label,
        });
      }
    );
  };

  handleInputChange = (e) => {
    this.setState({
      uiValue: e.target.value,
    });
  };

  handleBlur = () => {
    const { handleChangedValueSubmit, id, filterId, type, label } = this.props;
    handleChangedValueSubmit({
      id: id,
      value:
        type === 'number' ? parseInt(this.state.uiValue) : this.state.uiValue,
      filterId: filterId,
      label,
    });
  };

  addNewKeyWithValue = (array) => {
    const keyMap = {
      label: 'title',
      id: 'id',
      value: 'value',
    };
    const newArray = array.map(function (obj) {
      const newObj = { ...obj, value: obj.label };
      return _.mapKeys(newObj, function (value, key) {
        return keyMap[key];
      });
    });
    return newArray;
  };

  handleChange = (selectedItems) => {
    this.handleTeamChange(selectedItems?.map((item) => item?.id));
  };

  toggleDrop = () => this.setState({ toggleDropDown: true });

  toggleMenus = () => this.setState({ toggleMenu: true });

  render() {
    const { label, helpText, fieldClassName } = this.props;
    const { team, selectedTeam, idSelected } = this.state;
    const mainTeam =
      selectedTeam.length < 5 ? selectedTeam : selectedTeam.slice(0, 4);
    const auxTeam =
      selectedTeam.length > 4 ? selectedTeam.slice(4, team.length) : null;

    return (
      <Fragment>
        <div className={cx(styles.teamMember, fieldClassName, 'mb-4')}>
          <label className={styles.teamMember__label} htmlFor={label}>
            {label}
            <p className={cx(styles['teamMember__label--helper'], 'mt-2')}>
              {helpText}
            </p>
          </label>
          <div className={cx(styles.inputWrap)}>
            <Dropdown
              className={cx(styles.dropdown, styles.trainFrom)}
              iconToggle={this.state.toggleDropDown}
              placeholder='Add Team'
              selectionPlaceholder={
                selectedTeam.length ? (
                  <div className={styles.trainFrom__row}>
                    {mainTeam.slice(0, 4).map((item, index) => {
                      return (
                        <div className={styles.addTeam__initial} key={index}>
                          <Tooltip
                            placement='bottom'
                            label={_.capitalize(item)}
                          >
                            <div
                              className={styles['trainFrom__selection--name']}
                            >
                              <p>{item?.charAt(0).toUpperCase()}</p>
                            </div>
                          </Tooltip>
                        </div>
                      );
                    })}
                    {auxTeam && auxTeam.length ? (
                      <Tooltip
                        size='sm'
                        placement='bottom'
                        label={`${auxTeam.join(', ')}`}
                      >
                        <p className={cx(styles.addTeam__morePeople)}>
                          {selectedTeam.length - 4} More+
                        </p>
                      </Tooltip>
                    ) : (
                      ''
                    )}
                  </div>
                ) : (
                  <span className={styles.placeholder}>Add Team</span>
                )
              }
              multiSelect={true}
              optionLabelKey='fullName'
              optionValueKey='id'
              data={team}
              onChange={this.handleChange}
              selectedValues={this.props.value}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default TeamMember;
