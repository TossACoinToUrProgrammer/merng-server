const UserInputError = require("apollo-server");

const Post = require("../../models/Post");
const User = require("../../models/User");
const checkAuth = require("../../utils/check-auth");

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { username } = checkAuth(context);

      if (body.trim() === "") {
        throw new Error('Comment must not be empty');
      }

      try {
        const post = await Post.findById(postId);

        const comment = {
          body,
          username,
          createdAt: new Date().toISOString(),
        };

        post.comments.unshift(comment);
        await post.save();
        return post;
      } catch (err) {
        throw new UserInputError("Post not found");
      }
    },
    deleteComment: async (_, { postId, commentId }, context) => {
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);
      if (post) {
        const commentIndex = post.comments.findIndex(c => c.id == commentId);

        if (commentIndex >= 0) {

          if (post.comments[commentIndex].username === username || post.username === username) {

            post.comments.splice(commentIndex, 1);
            await post.save();
            return post;

          } 
          else throw new Error("You are not allowed to delete this comment");
        } 
        else throw new Error("Comment not found");
      } 
      else throw new UserInputError("Post not found");
    },
  },
};
