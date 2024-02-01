import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { showToast } from 'new/redux/helpers';

import cx from 'classnames';
import {
  Archive,
  Cancel,
  Check,
  Folder,
  InfoEmpty,
  Plus,
  Search,
} from 'iconoir-react';
import _, { get } from 'lodash';
import { createNewFolder, getDocuments, moveFiles } from 'new/api';
import { ROOT_FOLDER_ID } from 'new/constants/document';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Input from 'new/ui-elements/Input/Input';
import Modal from 'new/ui-elements/Modal/Modal';
import Spinner from 'new/ui-elements/Spinner/Spinner';

import styles from './MoveInFiles.scss';

const MoveInFiles = ({
  showMoveInFolderModal,
  closeMoveInModalHandler,
  currentFolderName = 'My documents',
  selectedFileIds = [],
  sourceFolderId = ROOT_FOLDER_ID,
  singleSelectedFileName = '',
}) => {
  const [searchFolderName, setSearchFolderName] = useState('');
  const [foldersLists, setFoldersLists] = useState([]);
  const [newFolderName, setIsNewFolderName] = useState('');
  const [isNewFolderVisible, setIsNewFolderVisible] = useState(false);
  const [inputError, setInputError] = useState('');
  const [pagination, setPagination] = useState({
    offset: 0,
    q: '',
  });
  const [noOfFolders, setNoOfFolders] = useState(0);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isMovingFiles, setIsMovingFiles] = useState(false);
  const [destinationFolderId, setDestinationFolderId] = useState(null);
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const newFolderRef = useRef();

  useEffect(() => {
    getFolderListApiHandler(pagination);
  }, [pagination]);

  const getFolderListApiHandler = async ({ offset, q = '' }) => {
    setIsLoadingFolders(true);
    const payload = {
      view: 'folder_only',
      offset,
      q,
    };
    const folderListResponse = await getDocuments({
      queryParams: _.omitBy(payload, (value) => value === ''),
    });
    const { documents = [], total = 0 } = get(
      folderListResponse,
      'responsePayload.data'
    );
    const keys = ['folderId', 'folderName'];
    const folderList = _.map(documents, (item) => _.pick(item, keys));
    if (!offset) {
      setFoldersLists(folderList);
    } else {
      setFoldersLists((prevState) => [...prevState, ...folderList]);
    }
    setIsLoadingFolders(false);
    setNoOfFolders(total);
  };

  const createNewFolderHandler = async () => {
    if (!newFolderName) {
      setInputError('Folder name cannot be empty');
      return;
    }

    setIsCreatingNewFolder(true);

    try {
      const newFolderResponse = await createNewFolder({
        payload: { folder_name: newFolderName },
      });
      const { folderName, folderId } = get(
        newFolderResponse,
        'responsePayload.data'
      );
      setFoldersLists((prevState) => [{ folderName, folderId }, ...prevState]);
      setDestinationFolderId(folderId);
      setIsNewFolderVisible(false);
      setIsNewFolderName('');
    } catch (err) {
      const errorMessage =
        err?.responsePayload?.message ?? 'Error creating folder name!';
      showToast({
        title: errorMessage,
        error: true,
        duration: 3000,
      });
    } finally {
      setIsCreatingNewFolder(false);
    }
  };

  const searchHandler = () =>
    getFolderListApiHandler({ offset: 0, q: searchFolderName });

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter')
      getFolderListApiHandler({ offset: 0, q: searchFolderName });
  };

  const handleNewFolderKeyDown = (e) => {
    if (e.key === 'Enter') createNewFolderHandler();
  };

  const handleMoveKeyDown = (e) => {
    if (e.key === 'Enter') handleMoveFiles();
  };

  const closeNewFolderHandler = () => {
    setIsNewFolderVisible(false);
    setIsNewFolderName('');
    setInputError('');
  };

  const folderListScrollHandler = (e) => {
    const NEXT_PAGE = 20;
    const { scrollHeight, scrollTop, clientHeight } = e.target;
    const bottom = scrollHeight - scrollTop === clientHeight;
    const { offset } = pagination;
    if (bottom && !isLoadingFolders && offset + NEXT_PAGE < noOfFolders) {
      setPagination((prevState) => ({
        ...prevState,
        offset: prevState.offset + NEXT_PAGE,
      }));
    }
  };

  const modalCloseHandler = () => {
    if (!newFolderName) {
      setIsNewFolderVisible(false);
    }
    closeMoveInModalHandler();
  };

  const openNewFolderHandler = () => {
    setIsNewFolderVisible(true);
    newFolderRef.current?.scrollIntoView({ block: 'nearest' });
  };

  const inputChangeHandler = (value) => {
    setInputError('');
    setIsNewFolderName(value);
  };

  const handleFolderClick = (folderId) => {
    setDestinationFolderId(folderId);
  };

  const handleMoveFiles = async () => {
    if (!destinationFolderId) return;

    setIsMovingFiles(true);

    try {
      const response = await moveFiles({
        source_folder_id: sourceFolderId,
        dest_folder_id: destinationFolderId,
        doc_ids: selectedFileIds,
      });

      const message = get(
        response,
        'responsePayload.message',
        'Files moved Successfully'
      );
      showToast({
        title: message,
        success: true,
      });
      setDestinationFolderId(null);
      closeMoveInModalHandler();
    } catch (e) {
      const message = get(e, 'responsePayload.message', 'Failed to move Files');
      showToast({
        title: message,
        error: true,
      });
    } finally {
      setIsMovingFiles(false);
    }
  };

  return (
    <Modal
      animation='fade'
      size='sm'
      show={showMoveInFolderModal}
      className={styles.moveinFiles}
      onCloseHandler={modalCloseHandler}
    >
      <div className={styles.moveinFiles__header}>
        <p className='heading-6 font-weights-bold ellipsis'>
          Move&nbsp;
          {selectedFileIds.length === 1
            ? `"${singleSelectedFileName}"`
            : `${selectedFileIds.length} items`}
        </p>
        <IconButton icon={Cancel} onClick={modalCloseHandler} variant='ghost' />
      </div>
      <div className={cx(styles.moveinFiles__body, 'mt-6')}>
        <p>Current Location:</p>
        <div className={styles['moveinFiles__filemove']}>
          <div>
            {currentFolderName.toLowerCase() === 'my documents' ? (
              <Archive
                className='clr-gray-800'
                width={'1.25rem'}
                height={'1.25rem'}
              />
            ) : (
              <Folder
                className='clr-gray-800'
                width={'1.25rem'}
                height={'1.25rem'}
              />
            )}
          </div>
          <p className='ml-1'>{currentFolderName}</p>
        </div>
      </div>
      <div
        className={styles.moveinFiles__search}
        tabIndex={-1}
        role={'button'}
        onKeyDown={handleSearchKeyDown}
      >
        <Input
          className={styles.moveinFiles__input}
          type='text'
          placeholder='Ex: Invoice'
          value={searchFolderName}
          onChange={(e) => {
            setSearchFolderName(e.target.value);
          }}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={true}
        />
        <Button
          onClick={searchHandler}
          variant='outlined'
          icon={Search}
          size='small'
          tabIndex={0}
        >
          Search
        </Button>
      </div>
      <div
        onScroll={folderListScrollHandler}
        className={styles['moveinFiles__folder-scroll']}
        role='button'
        tabIndex={-1}
        onKeyDown={handleMoveKeyDown}
      >
        <div ref={newFolderRef}>
          {isNewFolderVisible && (
            <div
              className={styles['moveinFiles__folder-new']}
              role='button'
              tabIndex={0}
              onKeyDown={handleNewFolderKeyDown}
            >
              <div className={styles['moveinFiles__scroll-box']}>
                <div>
                  <Folder
                    className={cx(styles['moveinFiles__scroll-icon'])}
                    width={'1.25rem'}
                    height={'1.25rem'}
                  />
                </div>
                <Input
                  className={cx(styles['moveinFiles__scroll-input'], 'ml-2')}
                  onChange={(e) => inputChangeHandler(e.target.value)}
                  placeholder='Enter folder name'
                  type='text'
                  value={newFolderName}
                />
                <span className={styles['moveinFiles__scroll-action']}>
                  <IconButton
                    className={cx(
                      styles['moveinFiles__scroll-action-btn'],
                      styles['moveinFiles__scroll-action-btn--success']
                    )}
                    icon={Check}
                    disabled={isCreatingNewFolder}
                    onClick={createNewFolderHandler}
                  />
                  <IconButton
                    className={cx(
                      styles['moveinFiles__scroll-action-btn'],
                      styles['moveinFiles__scroll-action-btn--error']
                    )}
                    icon={Cancel}
                    onClick={closeNewFolderHandler}
                  />
                </span>
              </div>
              {inputError && (
                <p className={cx(styles['moveinFiles__scroll-err'], 'mb-1')}>
                  <InfoEmpty
                    className={cx(
                      styles['moveinFiles__scroll-err-icon'],
                      'mr-1'
                    )}
                  />
                  {inputError}
                </p>
              )}
            </div>
          )}
        </div>

        {currentFolderName?.toLowerCase() !== 'my documents' ? (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <div
            tabIndex={0}
            role='button'
            className={cx(styles['moveinFiles__scroll-box'], {
              [styles['moveinFiles__scroll-selected']]:
                ROOT_FOLDER_ID === destinationFolderId,
            })}
            onClick={() => handleFolderClick(ROOT_FOLDER_ID)}
          >
            <div>
              <Archive
                className={cx(styles['moveinFiles__folder-scroll__box-icon'])}
                width={'1.25rem'}
                height={'1.25rem'}
              />
            </div>

            <p className='ml-2'>My Documents</p>
          </div>
        ) : (
          ''
        )}
        {foldersLists &&
          foldersLists.map(({ folderName = '', folderId }) => {
            return (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <div
                tabIndex={0}
                role='button'
                key={folderId}
                className={cx(styles['moveinFiles__scroll-box'], {
                  [styles['moveinFiles__scroll-selected']]:
                    folderId === destinationFolderId,
                })}
                onClick={() => handleFolderClick(folderId)}
              >
                <div>
                  {folderName?.toLowerCase() === 'my documents' ? (
                    <Archive
                      className={cx(styles['moveinFiles__scroll-icon'])}
                      width={'1.25rem'}
                      height={'1.25rem'}
                    />
                  ) : (
                    <Folder
                      className={cx(styles['moveinFiles__scroll-icon'])}
                      width={'1.25rem'}
                      height={'1.25rem'}
                    />
                  )}
                </div>
                <p className='ml-2 ellipsis' title={folderName}>
                  {folderName}
                </p>
              </div>
            );
          })}
        {/* End of This will be end of folder list */}
        {isLoadingFolders && (
          <div className={styles.loader__container}>
            <Spinner size='sm' />
          </div>
        )}
      </div>
      <div className={styles['moveinFiles__action-btns']}>
        {sourceFolderId === ROOT_FOLDER_ID ? (
          <Button
            icon={Plus}
            variant='outlined'
            size='small'
            onClick={openNewFolderHandler}
          >
            Create New Folder
          </Button>
        ) : (
          <span />
        )}

        <div className={styles['moveinFiles__btns-move']}>
          <Button variant='outlined' size='small' onClick={modalCloseHandler}>
            Cancel
          </Button>
          <Button
            className='ml-5'
            variant='contained'
            size='small'
            onClick={handleMoveFiles}
            isLoading={isMovingFiles}
            disabled={destinationFolderId === null}
          >
            Move
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default withRouter(MoveInFiles);
