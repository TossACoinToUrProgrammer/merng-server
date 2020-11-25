const postsResolvers = require('./posts');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');

module.exports = {
    Post: {
        likesCount(parent) {
            return parent.likes.length;
        },
        commentsCount(parent) {
            return parent.comments.length;
        }
    },
    Query: {
        ...postsResolvers.Query,
        ...usersResolvers.Query,
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentsResolvers.Mutation,
    },
    Subscription: {
        ...postsResolvers.Subscription, 
    }
};