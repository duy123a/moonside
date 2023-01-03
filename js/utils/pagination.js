function renderDynamicButton(ulPagination, currentPage, totalPages) {
  // reset class
  const dynamicPageList = ulPagination.querySelectorAll('.dynamic-page');
  if (!dynamicPageList) return;

  dynamicPageList.forEach((dynamicPage, idx) => {
    dynamicPage.classList.remove('d-none');
    dynamicPage.firstElementChild.classList.remove('bg-info');
    const dynamicPageIdx = Number.parseInt(currentPage - 2 + idx);
    if (dynamicPageIdx <= 1 || dynamicPageIdx >= totalPages) {
      dynamicPage.classList.add('d-none');
    }
    dynamicPage.dataset.id = dynamicPageIdx;
    dynamicPage.firstElementChild.textContent = dynamicPageIdx;
    if (dynamicPageIdx === currentPage) {
      dynamicPage.firstElementChild.classList.add('bg-info');
    }
  });

  const spanFirstElement = ulPagination.querySelector('.first-span');
  if (spanFirstElement) {
    spanFirstElement.classList.remove('d-none');
    if (currentPage < 5) spanFirstElement.classList.add('d-none');
  }

  const spanLastElement = ulPagination.querySelector('.last-span');
  if (spanLastElement) {
    spanLastElement.classList.remove('d-none');
    if (currentPage > totalPages - 4) spanLastElement.classList.add('d-none');
  }
}

export function renderPagination(elementId, pagination) {
  const ulPagination = document.getElementById(elementId);
  if (!pagination || !ulPagination) return;

  // calc totalPages
  const { _page, _limit, _totalRows } = pagination;
  const totalPages = Math.ceil(_totalRows / _limit);

  // save page and totalPages to ulPagination
  ulPagination.dataset.page = _page;
  ulPagination.dataset.totalPages = totalPages;

  // render the first page and last page button
  const firstPageButton = ulPagination.querySelector('.first-page');
  if (firstPageButton) {
    firstPageButton.firstElementChild.textContent = 1;
  }

  const lastPageButton = ulPagination.querySelector('.last-page');
  if (lastPageButton) {
    lastPageButton.firstElementChild.textContent = totalPages;
  }

  // doesn't need to render if there is only 1 page
  if (totalPages <= 1) lastPageButton.classList.add('d-none');
  else lastPageButton.classList.remove('d-none');

  // check if disable/enable prev/next link
  if (_page <= 1) {
    ulPagination.firstElementChild?.classList.add('d-none');
    firstPageButton?.firstElementChild.classList.add('bg-info');
  } else {
    ulPagination.firstElementChild?.classList.remove('d-none');
    firstPageButton?.firstElementChild.classList.remove('bg-info');
  }

  if (_page >= totalPages) {
    ulPagination.lastElementChild?.classList.add('d-none');
    lastPageButton?.firstElementChild.classList.add('bg-info');
  } else {
    ulPagination.lastElementChild?.classList.remove('d-none');
    lastPageButton?.firstElementChild.classList.remove('bg-info');
  }

  // render dynamic button
  renderDynamicButton(ulPagination, _page, totalPages);
}

function handlePrevClick(elementId, callback) {
  const ulPagination = document.getElementById(elementId);
  if (!ulPagination) return;
  const page = Number.parseInt(ulPagination.dataset.page) || 1;
  if (page > 1) callback?.(page - 1);
}

function handleNextClick(elementId, callback) {
  const ulPagination = document.getElementById(elementId);
  if (!ulPagination) return;
  const page = Number.parseInt(ulPagination.dataset.page) || 1;
  const totalPages = ulPagination.dataset.totalPages;
  if (page < totalPages) callback?.(page + 1);
}

function handleFirstButtonClick(elementId, callback) {
  const ulPagination = document.getElementById(elementId);
  if (!ulPagination) return;
  callback?.(1);
}

function handleLastButtonClick(elementId, callback) {
  const ulPagination = document.getElementById(elementId);
  if (!ulPagination) return;
  const totalPages = Number.parseInt(ulPagination.dataset.totalPages) || 1;
  callback?.(totalPages);
}

function handleDynamicClickEvent(event) {
  const callback = event.currentTarget.onChange;
  const page = event.currentTarget.page;
  event.preventDefault();
  event.target.blur();
  callback?.(page);
}

export function handleDynamicClick({ elementId, onChange }) {
  const ulPagination = document.getElementById(elementId);
  if (!ulPagination) return;

  const dynamicPageList = ulPagination.querySelectorAll('.dynamic-page');
  if (!dynamicPageList) return;

  dynamicPageList.forEach((dynamicPage, idx) => {
    dynamicPage.removeEventListener('click', handleDynamicClickEvent);
    const page = Number.parseInt(dynamicPage.dataset.id) || 1;
    dynamicPage.page = page;
    dynamicPage.onChange = onChange;
    dynamicPage.addEventListener('click', handleDynamicClickEvent);
  });
}

export function initPagination({ elementId, onChange }) {
  // bind click event for prev/next link
  const ulPagination = document.getElementById(elementId);
  if (!ulPagination) return;

  const prevLink = ulPagination.firstElementChild?.firstElementChild;
  if (prevLink) {
    prevLink.addEventListener('click', (event) => {
      event.preventDefault();
      event.currentTarget.blur();
      handlePrevClick(elementId, onChange);
    });
  }

  const nextLink = ulPagination.lastElementChild?.firstElementChild;
  if (nextLink) {
    nextLink.addEventListener('click', (event) => {
      event.preventDefault();
      event.currentTarget.blur();
      handleNextClick(elementId, onChange);
    });
  }

  // render the first page and last page button
  const firstPageButton = ulPagination.querySelector('.first-page');
  if (firstPageButton) {
    firstPageButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.target.blur();
      handleFirstButtonClick(elementId, onChange);
    });
  }

  const lastPageButton = ulPagination.querySelector('.last-page');
  if (lastPageButton) {
    lastPageButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.target.blur();
      handleLastButtonClick(elementId, onChange);
    });
  }
}
