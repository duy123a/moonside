import postApi from './api/postApi';
import { POST_ELEMENT } from './constants';
import { initPostForm, setTextContent, toast } from './utils';

function removeUnusedFields(formValues) {
  const payload = { ...formValues };
  if (payload.imageSource === 'upload') {
    delete payload.imageUrl;
  } else {
    delete payload.image;
  }

  if (!payload.id) delete payload.id;

  delete payload.imageSource;
  return payload;
}

function jsonToFormData(jsonObject) {
  const formData = new FormData();
  for (const key in jsonObject) {
    formData.set(key, jsonObject[key]);
  }
  return formData;
}

async function handleFormSubmit(formValues) {
  try {
    const payload = removeUnusedFields(formValues);
    let savedPost = {};
    if (payload.imageUrl) {
      savedPost = formValues.id ? await postApi.update(payload) : await postApi.add(payload);
    } else {
      const formData = jsonToFormData(payload);
      savedPost = formValues.id
        ? await postApi.updateFormData(formData)
        : await postApi.addFormData(formData);
    }
    toast.success('Save post successfully!');
    // redirect to detail page
    setTimeout(() => {
      window.location.assign(`/post-detail.html?id=${savedPost.id}`);
    }, 3000);
  } catch (error) {
    console.log('failed to save post', error);
    toast.error('Failed to save post, please try again later!');
  }
}

(() => {
  // Add focus event for quill div
  const editor = document.getElementById('editor');
  if (!editor) return;
  const editorText = editor.querySelector('.ql-editor');
  if (!editorText) return;
  const divEditor = document.getElementById('div-editor');
  if (!divEditor) return;
  editorText.addEventListener('focusin', (e) => {
    divEditor.classList.add('editor-focus');
  });
  editorText.addEventListener('focusout', (e) => {
    divEditor.classList.remove('editor-focus');
  });
})();

(async () => {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const postId = searchParams.get('id');
    const title = postId ? 'Edit a post' : 'Add a post';
    setTextContent(document, '#postDetailTitle', title);
    const defaultValues = postId
      ? await postApi.getById(postId)
      : {
          title: '',
          description: '',
          author: '',
          imageUrl: '',
        };
    initPostForm({
      formId: POST_ELEMENT.FORM_ID,
      defaultValues,
      onSubmit: handleFormSubmit,
    });
  } catch (error) {
    console.log('failed to fetch post information', error);
    toast.error('Something went wrong, please try again later!');
  }
})();
