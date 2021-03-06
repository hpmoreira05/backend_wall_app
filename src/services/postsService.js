const { ObjectId } = require('mongodb');
const Posts = require('../models/postsModel');

const createPost = async ({ title, description, userId, name }) => {
  if (!description || !title) {
    return { err: { code: 400, message: { message: 'Invalid entries. Try again.' } } };
  }
  const post = await Posts.createPost({ title, description, userId, name });
  return post;
};

const getPosts = async () => {
  const posts = await Posts.getPosts();
  return posts;
};

const getPostsByUserId = async (_id) => {
  if (!ObjectId.isValid(_id)) {
    return { err: { code: 404, message: { message: 'Posts by user not found' } } };
  }
  const posts = await Posts.getPostsByUserId(_id);
  return posts;
};

const editPost = async ({ id, title, description }) => {
  if (!title || !description) {
    return { err: { code: 400, message: { message: 'Invalid entries. Try again.' } } };
  }
  const editedPost = await Posts.editPost({ id, title, description });
  return editedPost;
};

const deletePost = async (id) => {
  if (!ObjectId.isValid(id)) return { err: { code: 404, message: { message: 'Post not found' } } };
  const data = await Posts.deletePost(id);
  if (!data) return { err: { code: 404, message: { message: 'Post not found' } } };
  return data;
};

module.exports = { createPost, getPosts, getPostsByUserId, editPost, deletePost };