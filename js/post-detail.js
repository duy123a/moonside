import dayjs from 'dayjs';
import postApi from './api/postApi';
import { toast, setTextContent, registerLightbox } from './utils';

function renderPostDetail(post) {
  if (!post) return;

  // render title
  setTextContent(document, '#postDetailTitle', post.title);
  // render description
  let html = '';
  if (typeof post?.description === 'string') {
    html = `<p>${post?.description}</p>`;
  } else {
    quill.setContents(post?.description);
    html = quill.root.innerHTML;
  }
  const postDetailDescription = document.getElementById('postDetailDescription');
  if (postDetailDescription) {
    postDetailDescription.innerHTML = html;
  }
  // render author
  setTextContent(document, '#postDetailAuthor', post.author);
  // render updateAt
  setTextContent(
    document,
    '#postDetailTimeSpan',
    dayjs(post.updatedAt).format(' - DD/MM/YY HH:mm')
  );
  // render hero image (imageUrl)
  const heroImage = document.getElementById('postHeroImage');
  if (heroImage) {
    heroImage.style.backgroundImage = `url("${post.imageUrl}")`;
    // TODO: catch 404 error of heroImage
    // this code won't work
    // heroImage.addEventListener('error', () => {
    //   heroImage.style.backgroundImage = `url("https://via.placeholder.com/1368x400?text=thumbnail")`;
    // });
  }
  // render edit page link
  const editPageLink = document.getElementById('goToEditPageLink');
  if (editPageLink) {
    editPageLink.href = `/add-edit-post.html?id=${post.id}`;
    // const iconEdit = document.createElement('i');
    // iconEdit.classList.add('fas', 'fa-edit');
    // editPageLink.appendChild(iconEdit);
    // const text = document.createElement('span');
    // text.textContent = ' Edit Post';
    // editPageLink.appendChild(text);
    editPageLink.innerHTML = `<i class="fas fa-edit"></i> Edit Post`;
  }
}

(async () => {
  try {
    registerLightbox({
      modalId: 'lightbox',
      imgSelector: 'img[data-id="lightboxImg"]',
      prevSelector: 'button[data-id="lightboxPrev"]',
      nextSelector: 'button[data-id="lightboxNext"]',
    });
    // get post id from URL
    const queryParams = new URLSearchParams(window.location.search);
    // fetch post detail API
    const postId = queryParams.get('id');
    if (!postId) return;
    const post = await postApi.getById(postId);
    renderPostDetail(post);
  } catch (error) {
    console.log('failed to get post detail', error);
    toast.error('Failed to fetch post detail, please try again later!');
  }
})();
