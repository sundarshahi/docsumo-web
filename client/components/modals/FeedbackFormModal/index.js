import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from '@redux/app/actions';
import { actions as requestActions } from '@redux/requests/actions';
import { actions as usersActions } from '@redux/users/actions';
import { showToast } from 'client/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { sendFeedback } from 'client/api';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'client/components/widgets/buttons';
import { Checkbox } from 'client/components/widgets/checkbox';
import { ReactComponent as CheckIcon } from 'images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';
import _ from 'lodash';

import { PageMetadata } from 'components/layout/page';
//import Modal from 'react-responsive-modal';
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader,
} from 'components/shared/Modal';
import { ErrorText } from 'components/widgets/typography';

import styles from './index.scss';

const SCORES = [
  {
    value: 'excellent',
  },
  {
    value: 'good',
  },
  {
    value: 'neutral',
  },
  {
    value: 'poor',
  },
];

class FeedbackFormPage extends Component {
  state = {
    isFetchingData: false,
    user: null,
    config: null,
    isUpdatingForm: true,

    uiScoreValue: '',
    uiScoreError: '',

    uiFeedValue: '',
    uiFeedError: '',

    savingData: false,
  };

  isMounted = false;
  nameInputRef = React.createRef();

  componentDidMount() {
    this.isMounted = true;

    if (this.nameInputRef && this.nameInputRef.current) {
      this.nameInputRef.current.focus();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { isUpdatingForm } = this.state;
    const { isUpdatingForm: prevIsEditingForm } = prevState;

    if (isUpdatingForm && isUpdatingForm !== prevIsEditingForm) {
      // Focus name input
      if (this.nameInputRef && this.nameInputRef.current) {
        this.nameInputRef.current.focus();
      }
    }
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    const inputName = _.capitalize(name);
    this.setState({
      [`ui${inputName}Value`]: value,
      [`ui${inputName}Error`]: '',
    });
  };

  // handleOne = (e) => {
  //     let checkboxes = document.getElementsByName('check');
  //     checkboxes.forEach( item => {
  //         if(item.id !== e.target.id ){
  //             item.checked = false;
  //         }else {
  //             this.setState({
  //                 uiScoreValue: e.target.value
  //             });
  //         }

  //     }
  //     );

  // }
  handleCheckboxChange = (data) => {
    this.setState(
      {
        uiScoreValue: data.value,
        uiScoreError: '',
      },
      () => {
        if (!data.checked) {
          this.setState({
            uiScoreValue: '',
          });
        }
      }
    );
  };
  handleFormSubmit = async () => {
    const { uiFeedValue, uiScoreValue } = this.state;
    let formError = '';

    if (!uiFeedValue) {
      formError = {
        uiFeedError: 'Please enter your feedback',
      };
    }

    if (!uiScoreValue) {
      formError = {
        uiScoreError: 'Please select your rating',
      };
    }

    if (formError) {
      this.setState({ ...formError });
      return;
    }
    this.setState({
      savingData: true,
    });
    try {
      await sendFeedback({
        payload: {
          score: uiScoreValue,
          product_sentiment: uiFeedValue,
        },
      });
      showToast({
        title: 'Thank you for your feedback!',
        success: true,
      });
      this.handleCancelFeedback();
    } catch (e) {
      const error = 'Something went wrong. Try again!';
      this.setState({
        uiFeedError: error,
      });
    } finally {
      this.setState({
        savingData: false,
      });
    }
  };
  handleCancelFeedback = () => {
    this.setState(
      {
        isFetchingData: false,
        user: null,
        config: null,

        isUpdatingForm: true,

        uiScoreValue: '',
        uiScoreError: '',

        uiFeedError: '',
        uiFeedValue: '',

        savingData: false,
      },
      () => {
        this.props.appActions.showFeedback({
          showFeedback: false,
        });
      }
    );
  };

  renderFormContent = () => {
    const {
      uiFeedValue,
      uiFeedError,

      uiScoreValue,
      uiScoreError,

      isUpdatingForm,
    } = this.state;

    return (
      <Fragment>
        <div className={styles.feedQuestion}>How do you like our product?</div>
        <Checkbox
          name='check'
          id='Excellent'
          label='Excellent'
          checked={uiScoreValue === 'excellent' || false}
          value={SCORES[0].value}
          labelClassName={styles.label}
          onChange={this.handleCheckboxChange}
        />
        <br />
        <Checkbox
          name='check'
          id='Good'
          label='Good'
          checked={uiScoreValue === 'good' || false}
          value={SCORES[1].value}
          labelClassName={styles.label}
          onChange={this.handleCheckboxChange}
        />
        <br />
        <Checkbox
          name='check'
          id='Neutral'
          label='Neutral'
          checked={uiScoreValue === 'neutral' || false}
          value={SCORES[2].value}
          labelClassName={styles.label}
          onChange={this.handleCheckboxChange}
        />
        <br />
        <Checkbox
          name='check'
          id='Poor'
          label='Poor'
          checked={uiScoreValue === 'poor' || false}
          value={SCORES[3].value}
          labelClassName={styles.label}
          onChange={this.handleCheckboxChange}
        />
        <br />
        {/* <label className={styles.formFieldCheck} htmlFor="Excellent">
                    <input 
                        className={styles.checkboxInput} 
                        type="checkbox" name="check" id="Excellent"  
                        value={ SCORES[0].value } 
                        onClick={(e)=>this.handleOne(e)}
                    />
                    <div className={styles.checkboxText}></div>
                    <p className={styles.feedText}>Excellent</p>
                    </label> 
                <label className={styles.formFieldCheck} htmlFor="Good">
                    <input 
                        className={styles.checkboxInput} 
                        type="checkbox" 
                        name="check" 
                        id="Good" 
                        value={ SCORES[1].value } 
                        onClick={(e)=>this.handleOne(e)}
                    />
                    <div className={styles.checkboxText}></div>
                    <p className={styles.feedText}>Good</p>
                </label>
                <label className={styles.formFieldCheck} htmlFor="Neutral">
                    <input 
                        className={styles.checkboxInput} 
                        type="checkbox" 
                        name="check" 
                        id="Neutral" 
                        value={ SCORES[2].value } 
                        onClick={(e)=>this.handleOne(e)}
                    />
                    <div className={styles.checkboxText}></div>
                    <p className={styles.feedText}>Neutral</p>
                </label>
                <label className={styles.formFieldCheck} htmlFor="Poor">
                    <input 
                        className={styles.checkboxInput} 
                        type="checkbox" 
                        name="check" 
                        id="Poor" 
                        value={ SCORES[3].value } 
                        onClick={(e)=>this.handleOne(e)}
                    />
                    <div className={styles.checkboxText}></div>
                    <p className={styles.feedText}>Poor</p>
                </label>  */}
        {isUpdatingForm && uiScoreError ? (
          <ErrorText className={styles.errorAbs}>{uiScoreError}</ErrorText>
        ) : null}

        <div className={styles.feedQuestion}>Please write your feedback</div>
        <textarea
          id='feedbackText'
          type='text area'
          name='feed'
          className={styles.text}
          rows='8'
          cols='81'
          placeholder='Your Answer'
          value={uiFeedValue}
          onChange={this.handleInputChange}
        />
        {isUpdatingForm && uiFeedError ? (
          <ErrorText className={styles.errorAbs}>{uiFeedError}</ErrorText>
        ) : null}
      </Fragment>
    );
  };

  render() {
    const { isFetchingData, savingData } = this.state;

    const { showFeedback } = this.props;
    const showForm = !isFetchingData;
    if (!showFeedback) return null;
    // return (
    //     <Fragment>
    //         <Modal
    //             classNames={{
    //                 modal:styles.modal
    //             }}
    //             center={true}
    //             closeOnEsc={false}
    //             open={ showFeedback }
    //             onClose={this.handleCancelFeedback}
    //             blockScroll={true}
    //         >
    //             <PageMetadata
    //                 title={'Give Feedback'}
    //             />

    //             <ModalHeader className={styles.modalHeader} title={'We listen to you'}/>

    //             <ModalContent className={styles.modalContent}>
    //                 <p className={styles.paraContent}>
    //                 Every feature suggestion, bug report, or issue you raise
    //                 is reviewed in our product meeting by all members of our team. On average,
    //                 we push out 3 new features each week, all from users like yourself.
    //                 </p>
    //                 { showForm ? this.renderFormContent() : null }</ModalContent>
    //             <ModalFooter className={styles.modalFooterLeft}>
    //                 <Button isLoading={savingData} iconLeft={CheckIcon} onClick={ this.handleFormSubmit } >
    //                     Submit
    //                 </Button>
    //                 <Button disabled={savingData} iconLeft={CloseIcon} appearance={BUTTON_APPEARANCES.PRIMARY_REVERSED}  onClick={this.handleCancelFeedback} pre>
    //                     Cancel
    //                 </Button>
    //             </ModalFooter>
    //         </Modal>
    //     </Fragment>
    // );
    return (
      <Fragment>
        <Modal
          className={styles.root}
          onExit={this.handleCancelFeedback}
          rootProps={{
            titleText: 'We listen to you',
          }}
        >
          <PageMetadata title={'Give Feedback'} />
          <ModalHeader
            title='We listen to you'
            titleClassName={cx('ellipsis', styles.title)}
            className={styles.header}
            closeBtnClassName={styles.closeBtnClassName}
            onCloseBtnClick={this.handleCancelFeedback}
          />

          <ModalContent className={styles.modalContent}>
            <p className={styles.paraContent}>
              Every feature suggestion, bug report, or issue you raise is
              reviewed in our product meeting by all members of our team. On
              average, we push out 3 new features each week, all from users like
              yourself.
            </p>
            {showForm ? this.renderFormContent() : null}
          </ModalContent>
          <ModalFooter className={styles.modalFooterLeft}>
            <Button
              disabled={savingData}
              iconLeft={CloseIcon}
              className={styles.cancelButton}
              appearance={BUTTON_APPEARANCES.PRIMARY_REVERSED}
              onClick={this.handleCancelFeedback}
              pre
            >
              Cancel
            </Button>
            <Button
              isLoading={savingData}
              iconLeft={CheckIcon}
              className={styles.submitButton}
              onClick={this.handleFormSubmit}
            >
              Submit
            </Button>
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  }
}

function mapStateToProp(state) {
  const { showFeedback } = state.app;

  return {
    showFeedback,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
    requestActions: bindActionCreators(requestActions, dispatch),
    usersActions: bindActionCreators(usersActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(FeedbackFormPage)
);
