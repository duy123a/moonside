function showImageAtIndex(imageElement, imgList, index) {
  imageElement.src = imgList[index].src;
}

function showModal(modalElement) {
  // check bootstrap script loaded
  if (!window.bootstrap) return;

  const myModal = new window.bootstrap.Modal(modalElement);
  if (myModal) myModal.show();
}

export function registerLightbox({ modalId, imgSelector, prevSelector, nextSelector }) {
  const modalElement = document.getElementById(modalId);
  if (!modalElement) return;
  // stop duplication function
  if (modalElement.dataset.registered) return;

  // selectors
  const imageElement = modalElement.querySelector(imgSelector);
  const prevButton = modalElement.querySelector(prevSelector);
  const nextButton = modalElement.querySelector(nextSelector);
  if (!imageElement || !prevButton || !nextButton) return;
  // lightbox vars
  let imgList = [];
  let currentIndex = 0;
  // handle click for all imgs -> event delegation
  document.addEventListener('click', (event) => {
    const { target } = event;
    if (target.tagName !== 'IMG' || !target.dataset.album) return;
    // img with data-album
    imgList = document.querySelectorAll(`img[data-album=${target.dataset.album}]`);
    currentIndex = [...imgList].findIndex((x) => x === target);

    showImageAtIndex(imageElement, imgList, currentIndex);
    showModal(modalElement);
  });

  // handle prev/ next click
  prevButton.addEventListener('click', () => {
    // show prev img of current album
    currentIndex = Math.abs(currentIndex - 1) % imgList.length;
    showImageAtIndex(imageElement, imgList, currentIndex);
  });
  nextButton.addEventListener('click', () => {
    // show next img of current album
    currentIndex = Math.abs(currentIndex + 1) % imgList.length;
    showImageAtIndex(imageElement, imgList, currentIndex);
  });

  // mark this modal registered
  modalElement.dataset.registered = true;
}
