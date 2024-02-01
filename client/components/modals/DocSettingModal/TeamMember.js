import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import { CheckboxUserGroup } from 'client/components/widgets/checkbox';
import Popover from 'client/components/widgets/popover';
import { ReactComponent as AddIcon } from 'images/icons/addition.svg';

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
        //'Subash Timilsina', 'Ch Ch', 'Dipesh Gyawali', 'Bikram Dahal', 'Pranjal Dhakal', 'Pinky Sitikhu'],
      ],
      selectedTeam: [],
      //team:[],
    };
  }
  UNSAFE_componentWillMount() {
    const { value, option } = this.props;
    {
      value || value === 0
        ? this.setState({
            //dropDownValue:label || option && option[0].label,
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
      //dropDownValue:label || option && option[0].label,
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
        // assignedMember = selectedTeam.map(item =>{

        //     var company = team.filter(teamItem => teamItem.fullName === item);
        //     return {company};

        // });
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
    const { handleChangedValueSubmit, id, filterId, type } = this.props;
    handleChangedValueSubmit({
      id: id,
      value:
        type === 'number' ? parseInt(this.state.uiValue) : this.state.uiValue,
      filterId: filterId,
    });
  };
  render() {
    const { label, helpText, fieldClassName, link } = this.props;
    const { team, selectedTeam, idSelected } = this.state;
    const mainTeam =
      selectedTeam.length < 6 ? selectedTeam : selectedTeam.slice(0, 5);
    const auxTeam =
      selectedTeam.length > 5 ? selectedTeam.slice(5, team.length) : null;
    var colors = ['#3D9F75', '#7AABB7', '#717677', '#337281', '#4FBED9'];

    return (
      <Fragment>
        <div className={cx(styles.generalMainField, fieldClassName)}>
          <label htmlFor={label}>
            {label}
            <p className={styles.helpText}>
              {helpText}{' '}
              {link ? (
                <a target='_blank' rel='noopener noreferrer' href={link}>
                  Learn More
                </a>
              ) : null}
            </p>
          </label>

          <div className={styles.inputWrap}>
            {!selectedTeam.length ? (
              <Popover
                content={
                  <>
                    <CheckboxUserGroup
                      options={team}
                      checked={idSelected}
                      onChange={this.handleTeamChange}
                    />
                  </>
                }
                containerClassName={styles.container}
              >
                <button
                  className={cx('unstyled-btn', styles.addTeam)}
                  // eslint-disable-next-line no-console
                  //onClick={() => addNewFolder()}
                >
                  <AddIcon className={styles.icon} />
                  <p className={styles.label}>Add Team</p>
                </button>
              </Popover>
            ) : (
              <Popover
                content={
                  <>
                    <CheckboxUserGroup
                      options={team}
                      checked={idSelected}
                      onChange={this.handleTeamChange}
                    />
                  </>
                }
                containerClassName={styles.container}
              >
                <button
                  className={cx('unstyled-btn', styles.addTeam)}
                  // eslint-disable-next-line no-console
                  //onClick={() => addNewFolder()}
                >
                  {mainTeam.map((item) => {
                    let nameArray = item && item.split(' ');
                    let firstInitial = '';
                    let lastInitial = '';
                    if (nameArray.length > 1) {
                      firstInitial = nameArray[0].substring(0, 1).toUpperCase();
                      lastInitial = nameArray[nameArray.length - 1]
                        .substring(0, 1)
                        .toUpperCase();
                    } else {
                      firstInitial = nameArray[0].substring(0, 1).toUpperCase();
                      lastInitial = null;
                    }

                    return (
                      <>
                        <div
                          className={styles.initial}
                          style={{
                            backgroundColor:
                              colors[Math.floor(Math.random() * colors.length)],
                          }}
                        >
                          {firstInitial}
                          {lastInitial}
                          <div className={styles.tooltip}>
                            {item}
                            <div className={styles.arrow} />
                          </div>
                        </div>
                      </>
                    );
                  })}
                  {auxTeam && auxTeam.length ? (
                    <div
                      className={styles.moreTeam}
                      style={{
                        backgroundColor:
                          colors[Math.floor(Math.random() * colors.length)],
                      }}
                    >
                      {`${auxTeam.length} +`}
                      <div className={styles.tooltip}>
                        {auxTeam.map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                        <div className={styles.arrow} />
                      </div>
                    </div>
                  ) : null}
                  <AddIcon className={styles.icon} />
                </button>
              </Popover>
            )}
          </div>
        </div>
      </Fragment>
    );
  }
}

export default React.memo(TeamMember);
