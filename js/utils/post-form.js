import {
  setBackgroundImage,
  setFieldValue,
  setFieldError,
  randomNumber,
  showLoadingSubmitButton,
  hideLoadingSubmitButton,
} from './common';
import * as yup from 'yup';
import { IMAGE_SOURCE } from '../constants';

function getPostSchema() {
  return yup.object().shape({
    title: yup.string().required('Please enter title'),
    author: yup
      .string()
      .required('Please enter author')
      .test(
        'at-least-two-words',
        'Please enter at least two words with three characters',
        (value) => value.split(' ').filter((x) => !!x && x.length >= 3).length >= 2
      ),
    description: yup.string(),
    imageSource: yup
      .string()
      .required('Please select image source')
      .oneOf([IMAGE_SOURCE.PICSUM, IMAGE_SOURCE.UPLOAD], 'Invalid image source'),
    imageUrl: yup.string().when('imageSource', {
      is: IMAGE_SOURCE.PICSUM,
      then: yup
        .string()
        .required('Please random a background image')
        .url('Please enter a valid url'),
    }),
    image: yup.mixed().when('imageSource', {
      is: IMAGE_SOURCE.UPLOAD,
      then: yup
        .mixed()
        .test('required', 'Please select an image to upload', (file) => Boolean(file?.name))
        .test('max-3mb', 'The image is too large (max 3mb)', (file) => {
          const fileSize = file?.size || 0;
          const maxSize = 3 * 1024 * 1024;
          return fileSize <= maxSize;
        }),
    }),
  });
}

function setFormValues(form, formValues) {
  setFieldValue(form, '[name=title]', formValues?.title);
  setFieldValue(form, '[name=author]', formValues?.author);
  setFieldValue(form, '[name=description]', formValues?.description);
  // this is hidden input to get the imageUrl value
  setFieldValue(form, '[name=imageUrl]', formValues?.imageUrl);

  setBackgroundImage(document, '#postHeroImage', formValues?.imageUrl);
}

function getFormValues(form) {
  const formValues = {};

  // ['title', 'author', 'description', 'imageUrl'].forEach((name) => {
  //   const field = form.querySelector(`[name="${name}"]`);
  //   if (field) formValues[name] = field.value;
  // });

  // using form data
  const data = new FormData(form);
  for (const [key, value] of data) {
    formValues[key] = value;
  }

  return formValues;
}

function initRandomImg(form) {
  const randomButton = document.getElementById('postChangeImage');
  if (!randomButton) return;
  randomButton.addEventListener('click', () => {
    // random id
    // build URL
    const imageUrl = `https://picsum.photos/id/${randomNumber(1000)}/1368/400`;
    // set imageURL input & background
    setFieldValue(form, '[name=imageUrl]', imageUrl);
    setBackgroundImage(document, '#postHeroImage', imageUrl);
  });
}

function initRadioImgSource(form) {
  const radioList = form.querySelectorAll('[name="imageSource"]');
  radioList.forEach((radio) => {
    radio.addEventListener('change', (event) => renderImageSourceControl(form, event.target.value));
  });
}

function renderImageSourceControl(form, selectedValue) {
  const controlList = form.querySelectorAll('[data-id="imageSource"]');
  controlList.forEach((control) => {
    control.hidden = control.dataset.imageSource !== selectedValue;
  });
}

function initUploadImage(form) {
  const uploadImage = form.querySelector('[name="image"]');
  if (!uploadImage) return;
  uploadImage.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBackgroundImage(document, '#postHeroImage', imageUrl);

      // trigger validation image right after uploading
      validateFormField(form, { imageSource: IMAGE_SOURCE.UPLOAD, image: file }, 'image');
    }
  });
}

async function validatePostForm(form, formValues) {
  try {
    // reset previous error
    ['title', 'author', 'imageUrl', 'image'].forEach((name) => setFieldError(form, name, ''));
    const schema = getPostSchema();
    await schema.validate(formValues, { abortEarly: false });
  } catch (error) {
    const errorLog = {};
    if (error.name === 'ValidationError' && Array.isArray(error.inner)) {
      for (const validationError of error.inner) {
        const name = validationError.path;

        // ignore if the field is already logged
        if (errorLog[name]) continue;

        // set field error and mark as logged
        setFieldError(form, name, validationError.message);
        errorLog[name] = true;
      }
    }
  }
  // add was-validated class to form element
  const isValid = form.checkValidity();
  if (!isValid) form.classList.add('was-validated');
  return isValid;
}

async function validateFormField(form, formValues, name) {
  try {
    // clear previous error
    setFieldError(form, name, '');

    const schema = getPostSchema();
    await schema.validateAt(name, formValues);
  } catch (error) {
    setFieldError(form, name, error.message);
  }

  // show validation error (if any)
  const field = form.querySelector(`[name="${name}"]`);
  if (field && !field.checkValidity()) {
    field.parentElement.classList.add('was-validated');
  }
}

function initValidationOnBlur(form) {
  ['title', 'author'].forEach((name) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (field) {
      field.addEventListener('blur', (event) => {
        const newValue = event.target.value;
        validateFormField(form, { [name]: newValue }, name);
      });
    }
  });
}

export function initPostForm({ formId, defaultValues, onSubmit }) {
  const form = document.getElementById(formId);
  if (!form) return;

  let submitting = false;

  setFormValues(form, defaultValues);

  // init event
  initRandomImg(form);
  initRadioImgSource(form);
  initUploadImage(form);
  initValidationOnBlur(form);

  // submit event
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;
    showLoadingSubmitButton(form);
    submitting = true;
    // get form values
    const formValues = getFormValues(form);
    formValues.id = defaultValues.id;
    // validation
    // if valid trigger sumbit callback
    // otherwise show validation error
    const isValid = await validatePostForm(form, formValues);
    if (isValid) await onSubmit?.(formValues);

    hideLoadingSubmitButton(form);
    submitting = false;
  });
}
