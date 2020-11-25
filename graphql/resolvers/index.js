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
    User: {
        followsCount(parent) {
            return parent.follows.length;
        },
        followersCount(parent) {
            return parent.followers.length;
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