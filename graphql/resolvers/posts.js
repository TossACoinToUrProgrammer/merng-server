const { UserInputError, AuthenticationError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../utils/check-auth");

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(parent, { id }) {
      try {
        const post = await Post.findById(id);
        if (post) return post;
        else throw new Error("Post not found");
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createPost(_, { body }, context) {
      const user = checkAuth(context);

      if(body.trim() === '') throw new Error('Post body must not be empty');

      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();

      context.pubsub.publish('NEW_POST', {
        newPost: post
      });

      return post;
    },
    async deletePost(_, { id }, context) {
      const user = checkAuth(context);
      try {
        let post = await Post.findById(id);

        if (user.id == post.user) {
          await post.delete();
          return post;
        } else {
          throw new Error("You are not allowed to delete this post");
        }
      } catch (err) {
        throw new Error("Post not found");
      }
    },
    async likePost(_, { postId }, context) {
      const { username } = checkAuth(context);

      try {
        const post = await Post.findById(postId);

        if (post.likes.find((like) => like.username === username)) {
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          post.likes.unshift({ username, createdAt: new Date().toISOString() });
        }

        await post.save();
        return post;
      } catch (err) {
        throw new UserInputError("Post not found");
      }
    },
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
    }
  }
};
