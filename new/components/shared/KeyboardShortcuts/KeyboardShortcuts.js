/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';

import cx from 'classnames';
import {
  ArrowLeft,
  ArrowRight,
  Book,
  Cancel,
  LightBulbOn,
  Minus,
  PageFlip,
  Play,
  Plus,
  QuestionMark,
} from 'iconoir-react';
import _ from 'lodash';
import { YT_VIDEOS } from 'new/constants/videos';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import { getOS, getValidPageQueryParams } from 'new/utils';
import {
  customMixpanelTracking,
  mixpanelTrackingAllEvents,
} from 'new/utils/mixpanel';
import OutsideClickHandler from 'react-outside-click-handler';

import styles from './KeyboardShortcuts.scss';
function getKeyboardShortcuts(type, slug) {
  const isMacOS = getOS() === 'MacOS';

  const saveShortcut =
    type === 'spreadsheet'
      ? [
          {
            label: 'Save document',
            keys: [
              {
                label: isMacOS ? 'Cmd' : 'Ctrl',
              },
              {
                label: 'S',
              },
            ],
          },
        ]
      : [];

  const splitScreenShortcut =
    type === 'spreadsheet'
      ? [
          {
            label: 'Split document',
            keys: [
              {
                label: isMacOS ? 'Cmd' : 'Ctrl',
              },
              {
                label: 'Shift',
              },
              {
                label: 'S',
              },
            ],
          },
        ]
      : !slug
      ? [
          {
            label: 'Split document',
            keys: [
              {
                label: isMacOS ? 'Cmd' : 'Ctrl',
              },
              {
                label: 'Shift',
              },
              {
                label: 'S',
              },
            ],
          },
        ]
      : [];

  const editFieldsShortcut =
    type === 'document' && !slug
      ? [
          {
            label: 'Edit fields',
            keys: [
              {
                label: isMacOS ? 'Cmd' : 'Ctrl',
              },
              {
                label: 'Shift',
              },
              {
                label: 'E',
              },
            ],
          },
        ]
      : [];

  return [
    {
      label: 'Next option',
      keys: [
        {
          label: 'Tab',
        },
      ],
    },
    type === 'document' && !slug
      ? {
          label: 'Confirm document',
          keys: [
            {
              label: isMacOS ? 'Cmd' : 'Ctrl',
            },
            {
              label: 'Shift',
            },
            {
              label: 'Enter',
            },
          ],
        }
      : {},
    type === 'document' && !slug
      ? {
          label: 'Skip',
          keys: [
            {
              label: isMacOS ? 'Cmd' : 'Ctrl',
            },
            {
              label: <ArrowRight width={16} height={16} />,
            },
          ],
        }
      : {},
    type === 'document' && !slug
      ? {
          label: 'Re-run',
          keys: [
            {
              label: isMacOS ? 'Cmd' : 'Ctrl',
            },
            {
              label: isMacOS ? 'Opt' : 'Alt',
            },
            {
              label: 'R',
            },
          ],
        }
      : {},
    ...saveShortcut,
    {
      label: 'Next document',
      keys: [
        {
          label: isMacOS ? 'Cmd' : 'Ctrl',
        },
        {
          label: 'Shift',
        },
        {
          label: <ArrowRight width={16} height={16} />,
        },
      ],
    },
    {
      label: 'Previous document',
      keys: [
        {
          label: isMacOS ? 'Cmd' : 'Ctrl',
        },
        {
          label: 'Shift',
        },
        {
          label: <ArrowLeft width={16} height={16} />,
        },
      ],
    },
    ...editFieldsShortcut,
    ...splitScreenShortcut,
    {
      label: 'Search document',
      keys: [
        {
          label: isMacOS ? 'Cmd' : 'Ctrl',
        },
        {
          label: 'F',
        },
      ],
    },
    {
      label: 'Zoom in',
      keys: [
        {
          label: isMacOS ? 'Cmd' : 'Ctrl',
        },
        {
          label: <Plus width={16} height={16} />,
        },
      ],
    },
    {
      label: 'Zoom out',
      keys: [
        {
          label: isMacOS ? 'Cmd' : 'Ctrl',
        },
        {
          label: <Minus width={16} height={16} />,
        },
      ],
    },
    {
      label: 'Zoom to fit',
      keys: [
        {
          label: isMacOS ? 'Opt' : 'Alt',
        },
        {
          label: 'F',
        },
      ],
    },
    type === 'document' && !slug
      ? {
          label: 'Undo the last action',
          keys: [
            {
              label: isMacOS ? 'Cmd' : 'Ctrl',
            },
            {
              label: 'Z',
            },
          ],
        }
      : {},
    type === 'document' && !slug
      ? {
          label: 'Redo the last action',
          keys: [
            {
              label: isMacOS ? 'Cmd' : 'Ctrl',
            },
            {
              label: 'Shift',
            },
            {
              label: 'Z',
            },
          ],
        }
      : {},
    type === 'document' && !slug
      ? {
          label: 'Deselect Field',
          keys: [
            {
              label: 'Esc',
            },
          ],
        }
      : {},
  ];
}

function getSharedLinkKeyboardShortcutsList(type, isClientTool) {
  const isMacOS = getOS() === 'MacOS';

  return [
    isClientTool
      ? {
          label: 'Confirm document',
          keys: [
            {
              label: isMacOS ? 'Cmd' : 'Ctrl',
            },
            {
              label: 'Shift',
            },
            {
              label: 'Enter',
            },
          ],
        }
      : {},
    isClientTool
      ? {
          label: 'Skip',
          keys: [
            {
              label: isMacOS ? 'Cmd' : 'Ctrl',
            },
            {
              label: <ArrowRight width={16} height={16} />,
            },
          ],
        }
      : {},
    {
      label: 'Re-run',
      keys: [
        {
          label: isMacOS ? 'Cmd' : 'Ctrl',
        },
        {
          label: isMacOS ? 'Opt' : 'Alt',
        },
        {
          label: 'R',
        },
      ],
    },
    type === 'spreadsheet'
      ? {
          label: 'Save document',
          keys: [
            {
              label: isMacOS ? 'Cmd' : 'Ctrl',
            },
            {
              label: 'S',
            },
          ],
        }
      : {},
    {
      label: 'Search document',
      keys: [
        {
          label: isMacOS ? 'Cmd' : 'Ctrl',
        },
        {
          label: 'F',
        },
      ],
    },
    {
      label: 'Zoom in',
      keys: [
        {
          label: isMacOS ? 'Cmd' : 'Ctrl',
        },
        {
          label: <Plus width={16} height={16} />,
        },
      ],
    },
    {
      label: 'Zoom out',
      keys: [
        {
          label: isMacOS ? 'Cmd' : 'Ctrl',
        },
        {
          label: <Minus width={16} height={16} />,
        },
      ],
    },
    {
      label: 'Zoom to fit',
      keys: [
        {
          label: isMacOS ? 'Opt' : 'Alt',
        },
        {
          label: 'F',
        },
      ],
    },
    type === 'document'
      ? {
          label: 'Undo the last action',
          keys: [
            {
              label: isMacOS ? 'Cmd' : 'Ctrl',
            },
            {
              label: 'Z',
            },
          ],
        }
      : {},
    type === 'document'
      ? {
          label: 'Redo the last action',
          keys: [
            {
              label: isMacOS ? 'Cmd' : 'Ctrl',
            },
            {
              label: 'Shift',
            },
            {
              label: 'Z',
            },
          ],
        }
      : {},
  ];
}

function KeyboardShortcutsTip(props) {
  const { showTip, isMenuOpen, closeKeyboardTip = null } = props;

  if (!showTip || isMenuOpen) return <></>;

  return (
    <div className={styles.tip}>
      <div className={styles.tip_container}>
        <LightBulbOn width={18} height={18} />
        <p className={styles.tip_text}>
          Use <span className={styles.command_key}>Enter</span> /{' '}
          <span className={styles.command_key}>Tab</span> to navigate between
          fields
        </p>
        <IconButton
          variant='text'
          icon={Cancel}
          className={styles.closeBtn}
          onClick={closeKeyboardTip}
        />
      </div>
    </div>
  );
}

function HelpMenuOption(props) {
  const { closeMenu, handleKeyboardMenu, slug, type } = props;
  let link =
    type === 'spreadsheet'
      ? YT_VIDEOS.DOCSUMO_YOUTUBE
      : type === 'document' && slug === 'editField'
      ? YT_VIDEOS.CONFIGURE_KEY_VALUE_PAIR
      : YT_VIDEOS.REVIEW_APPROVE_INVOICE;
  const menuOption = [
    {
      id: 1,
      name: 'Watch Tutorial',
      icon: <Play width={'16px'} height={'16px'} />,
      action: () => {
        window.open(link, '_blank');
        closeMenu();
      },
    },

    {
      id: 2,
      name: 'Documentation',
      icon: <Book width={'16px'} height={'16px'} />,
      action: () => {
        window.open('https://support.docsumo.com/docs', '_blank');
        closeMenu();
      },
    },
    {
      id: 3,
      name: 'Keyboard Shortcuts',
      icon: <PageFlip width={'16px'} height={'16px'} />,
      action: () => {
        closeMenu();
        mixpanelTrackingAllEvents(MIXPANEL_EVENTS.helpsection_keyboardshortcut);
        handleKeyboardMenu();
      },
    },
  ];
  return (
    <div className={styles.option}>
      {menuOption.map((item) => {
        return (
          <div
            key={item.id}
            className={cx(styles.option__item, 'd-flex')}
            onClick={item.action}
          >
            <span className={styles.option__icon}>{item.icon}</span>
            <span className={styles.option__name}>{item.name}</span>
          </div>
        );
      })}
    </div>
  );
}

function KeyboardShortcuts(props) {
  const {
    type = '',
    showTip = false,
    closeKeyboardTip = () => {},
    slug,
    isFreeTool,
    isClientTool,
  } = props;

  const [showMenu, setMenuDisplay] = useState(false);
  const [showKeyboardMenu, setKeyboardMenuDisplay] = useState(false);

  let keyboardShorcutsList;
  if (isFreeTool || isClientTool) {
    keyboardShorcutsList = getSharedLinkKeyboardShortcutsList(
      type,
      isClientTool
    );
  } else {
    keyboardShorcutsList = getKeyboardShortcuts(type, slug);
  }

  function mixpanelTracking() {
    const {
      user: { email = '' } = {},
      config: { canSwitchToOldMode = false } = {},
      documents = {},
    } = props || {};

    const { docType = '' } = getValidPageQueryParams(location?.search, {
      docType: '',
    });

    customMixpanelTracking(MIXPANEL_EVENTS.keyboard_help_floating_button, {
      canSwitchUIVersion: canSwitchToOldMode,
      email,
      docId: documents?.reviewTool?.docId || documents?.docId,
      docType,
    });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <OutsideClickHandler
          onOutsideClick={() => {
            setMenuDisplay(false);
            setKeyboardMenuDisplay(false);
          }}
        >
          {showMenu ? (
            <HelpMenuOption
              closeMenu={() => setMenuDisplay(false)}
              handleKeyboardMenu={() => setKeyboardMenuDisplay(true)}
              slug={slug}
              type={type}
            />
          ) : (
            <></>
          )}
          {showKeyboardMenu ? (
            <div className={styles.menu}>
              <div className={styles.menu_header}>
                <div>
                  <h2 className={styles.menu_heading}>Keyboard Shortcuts</h2>
                  <span className={styles.menu_subHeading}>
                    Supercharge your productivity with these helpful shortcuts.
                  </span>
                </div>
                <IconButton
                  variant='text'
                  icon={Cancel}
                  className={styles.closeBtn}
                  onClick={() => setKeyboardMenuDisplay(false)}
                />
              </div>
              <div className={styles.menu_body}>
                <ul className={styles.menu_list}>
                  {keyboardShorcutsList.map((item) => {
                    if (_.isEmpty(item)) {
                      return <></>;
                    }

                    return (
                      <li key={item.label} className={styles.command}>
                        <span className={styles.command_name}>
                          {item.label}
                        </span>
                        <div className={styles.command_combo}>
                          {item.keys.map((key, index) => {
                            return (
                              <Fragment key={`commandCombination${index}`}>
                                <span className={styles.command_key}>
                                  {key.label}
                                </span>
                                {index === item.keys.length - 1 ? null : (
                                  <span>+</span>
                                )}
                              </Fragment>
                            );
                          })}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : null}
          <KeyboardShortcutsTip
            showTip={showTip}
            isMenuOpen={showKeyboardMenu}
            closeKeyboardTip={closeKeyboardTip}
          />
          <IconButton
            variant='text'
            icon={QuestionMark}
            className={styles.ctaBtn}
            onClick={() => {
              setMenuDisplay(!showMenu);
              type !== 'spreadsheet' && closeKeyboardTip();
              mixpanelTracking();
            }}
          />
        </OutsideClickHandler>
      </div>
    </div>
  );
}

const mapStateToProps = ({ app, documents }) => {
  return {
    user: app?.user,
    config: app?.config,
    documents,
  };
};

export default connect(mapStateToProps, null)(KeyboardShortcuts);
