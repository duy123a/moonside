import axiosClient from './axiosClient';
const postApi = {
  getAll(params) {
    const url = '/posts';
    return axiosClient.get(url, { params });
  },
  getById(id) {
    const url = `/posts/${id}`;
    return axiosClient.get(url);
  },
  remove(id) {
    const url = `posts/${id}`;
    return axiosClient.delete(url);
  },
  // JSON data
  add(data) {
    const url = '/posts';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/posts/${data.id}`;
    return axiosClient.patch(url, data);
  },
  // Form data
  addFormData(data) {
    const url = '/with-thumbnail/posts/';
    return axiosClient.post(url, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateFormData(data) {
    const url = `/with-thumbnail/posts/${data.get('id')}`;
    return axiosClient.patch(url, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default postApi;
