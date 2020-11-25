const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utils/validators");
const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");
const checkAuth = require("../../utils/check-auth");

const generateToken = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
  return token;
};

module.exports = {
  Query: {
    async getUser(_, { username }) {
      try {
        const user = await User.findOne({username});
        if (user) return user;
        else throw new Error("User not found");
      } catch (err) {
        throw new Error(err);
      }
    },
    async getUsers(_, { usernames }){
      const users = await usernames.map(username => User.findOne({username}));
      return users;
    }
  },
  Mutation: {
    async follow(_, { id }, context) {
      const user = checkAuth(context);
      try {
        const follower = await User.findById(user.id);
        const follow = await User.findById(id);

        if(follower.follows.indexOf(follow.username) < 0) {
          follower.follows.unshift(follow.username);
          follow.followers.unshift(user.username);
        } else {
          const followIndex = follower.follows.indexOf(follow.username);
          const followerIndex = follow.followers.indexOf(follower.username);
          follower.follows.splice(followIndex, 1);
          follow.followers.splice(followerIndex, 1);
        }

        await follow.save();
        return await follower.save();

      } catch (err) {
        throw new Error(err);
      }
    },
    async register(
      _,
      { registerInput: { username, password, email, confirmPassword } }
    ) {
      //Проверяем валидность входных данных
      const { errors, isValid } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!isValid) {
        throw new UserInputError("Errors", { errors });
      }
      //ищем нет ли пользователей с таким именем
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }
      //расшифровали
      password = await bcrypt.hash(password, 12);
      //создаем нового пользователся
      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });
      //сохраняем в бд
      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
    async login(_, { loginInput: { username, password } }) {
      const { errors, isValid } = validateLoginInput(username, password);
      if (!isValid) {
        throw new UserInputError("Error", { errors });
      }
      const user = await User.findOne({ username });

      const match = await bcrypt.compare(password, user.password);

      if (!user || !match) {
        throw new UserInputError("incorrect password or login");
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
  },
};
