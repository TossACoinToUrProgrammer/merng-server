const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utils/validators");
const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");

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
}

module.exports = {
  Mutation: {
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
      const user = await User.findOne({username});

      const match = await bcrypt.compare(password, user.password);

      if(!user || !match){
          throw new UserInputError("incorrect password or login")
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
