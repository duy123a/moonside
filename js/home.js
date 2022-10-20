import postApi from './api/postApi';
import { LIMIT_NUM, PARAMS, POST_ELEMENT } from './constants';
import {
  isMobile,
  renderPostList,
  renderPagination,
  toast,
  initPagination,
  initSearch,
  handleDynamicClick,
} from './utils';

async function handleFilterChange(filterName, filterValue) {
  try {
    const url = new URL(window.location);

    if (filterName) {
      url.searchParams.set(filterName, filterValue);
      // reset page if needed
      if (filterName === PARAMS.TITLE_LIKE) url.searchParams.set(PARAMS.PAGE, 1);
      history.pushState({}, '', url);
    }

    // fetch data
    const { data, pagination } = await postApi.getAll(url.searchParams);
    renderPostList(POST_ELEMENT, data);
    renderPagination(POST_ELEMENT.PAGINATION_ID, pagination);
    handleDynamicClick({
      elementId: POST_ELEMENT.PAGINATION_ID,
      onChange: (page) => handleFilterChange(PARAMS.PAGE, page),
    });

    return url;
  } catch (error) {
    // send the error to the main function handle
    return Promise.reject(error);
  }
}

function setDefaultParams() {
  const url = new URL(window.location);
  let isChange = false;
  if (!url.searchParams.get(PARAMS.PAGE)) {
    url.searchParams.set(PARAMS.PAGE, 1);
    isChange = true;
  }
  if (!url.searchParams.get(PARAMS.LIMIT)) {
    if (isMobile) {
      url.searchParams.set(PARAMS.LIMIT, LIMIT_NUM.PHONE);
    }
    url.searchParams.set(PARAMS.LIMIT, LIMIT_NUM.ELSE);
    isChange = true;
  }
  if (isChange) history.pushState({}, '', url);
  return isChange;
}

async function deletePost(event) {
  try {
    const post = event.currentTarget.post;
    const deleteModal = event.currentTarget.deleteModal;
    await postApi.remove(post.id);
    await handleFilterChange();
    toast.success('Remove post successfully <3');
    deleteModal.hide();
  } catch (error) {
    console.log('failed to remove post', error);
    toast.error('Failed to remove post, please refresh the page!');
  }
}

function registerPostDeleteEvent() {
  document.addEventListener('post-delete', (event) => {
    const post = event.detail;
    const message = `Are you sure to remove post <span>${post.title}</span>?`;
    // create delete modal
    const modal = document.getElementById(POST_ELEMENT.MODAL_ID);
    if (!modal) return;
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) modalBody.innerHTML = message;
    const deleteModal = new bootstrap.Modal(modal);
    // add event to yes button
    const confirmButton = modal.querySelector('[data-id="confirm"]');
    if (confirmButton) {
      confirmButton.post = post;
      confirmButton.deleteModal = deleteModal;
      confirmButton.addEventListener('click', deletePost);
    }
    // remove event from no/x button
    const closeButtonList = modal.querySelectorAll('[data-bs-dismiss="modal"]');
    closeButtonList.forEach((closeButton) => {
      closeButton.addEventListener('click', () => {
        confirmButton.removeEventListener('click', deletePost);
      });
    });
    deleteModal.show();
  });
}

(async () => {
  try {
    // check params query, if not then set default for it
    setDefaultParams();
    // render post list
    const url = await handleFilterChange();
    // init event
    registerPostDeleteEvent();
    initSearch({
      elementId: POST_ELEMENT.SEARCH_ID,
      defaultParams: url.searchParams,
      onChange: (value) => handleFilterChange(PARAMS.TITLE_LIKE, value),
    });
    initPagination({
      elementId: POST_ELEMENT.PAGINATION_ID,
      onChange: (page) => handleFilterChange(PARAMS.PAGE, page),
    });
  } catch (error) {
    console.log('failed to fetch post list', error);
    toast.error('Failed to fetch the post list, please try again later!');
  }
})();
