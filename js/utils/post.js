import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { setTextContent, truncateText } from './common';
dayjs.extend(relativeTime);

function createPostElement(post, templateId) {
  if (!post) return;
  try {
    // find and clone template
    const postTemplate = document.getElementById(templateId);
    if (!postTemplate) return;

    const liElement = postTemplate.content.firstElementChild.cloneNode(true);
    if (!liElement) return;

    // update title, description, author
    setTextContent(liElement, '[data-id="title"]', post.title);
    if (typeof post?.description === 'string') {
      setTextContent(liElement, '[data-id="description"]', truncateText(post?.description, 115));
    } else {
      setTextContent(
        liElement,
        '[data-id="description"]',
        truncateText(post?.description[0].insert, 115)
      );
    }
    setTextContent(liElement, '[data-id="author"]', post.author);

    // update thumbnail
    const thumbnailElement = liElement.querySelector('[data-id="thumbnail"]');
    if (thumbnailElement) {
      thumbnailElement.src = post.imageUrl;
      thumbnailElement.addEventListener('error', (event) => {
        // event.error = null;
        thumbnailElement.src = 'https://via.placeholder.com/1368x400?text=thumbnail';
      });
    }

    // calculate timespan
    setTextContent(liElement, '[data-id="timeSpan"]', `- ${dayjs(post.updatedAt).fromNow()}`);

    // attach events
    // go to post detail when click on div.post-item
    const divElement = liElement.firstElementChild;
    if (divElement) {
      divElement.addEventListener('click', (event) => {
        // if event triggered from menu -> ignore
        const menu = liElement.querySelector('[data-id="menu"]');
        if (menu && menu.contains(event.target)) return;

        window.location.assign(`/post-detail.html?id=${post.id}`);
      });
    }

    // add click event to edit button
    const editButton = liElement.querySelector('[data-id="edit"]');
    if (editButton) {
      editButton.addEventListener('click', (event) => {
        // prevent event bubbling to parent (don't use it when using analytics!)
        // event.stopPropagation();
        window.location.assign(`/add-edit-post.html?id=${post.id}`);
      });
    }

    // add remove event to remove button
    const removeButton = liElement.querySelector('[data-id="remove"]');
    if (removeButton) {
      removeButton.addEventListener('click', (event) => {
        const customEvent = new CustomEvent('post-delete', {
          bubbles: true,
          detail: post,
        });
        removeButton.dispatchEvent(customEvent);
      });
    }

    return liElement;
  } catch (error) {
    console.log('failed to create post item', error);
  }
}

export function renderPostList(element, postList) {
  const ulElement = document.getElementById(element.LIST_ID);
  if (!ulElement || !Array.isArray(postList)) return;

  // clear current list
  ulElement.textContent = '';

  postList.forEach((post, idx) => {
    const liElement = createPostElement(post, element.TEMPLATE_ID);
    ulElement.appendChild(liElement);
  });
}
