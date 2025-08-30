const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../modules/user/repo");

class AuthService {
  async register(userData) {
    try {
      const existingUser = await userRepository.findOne({
        email: userData.email,
      });
      if (existingUser) {
        throw new Error("User already exists");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const user = await userRepository.create({
        ...userData,
        password: hashedPassword,
      });
      const token = this.generateToken(user._id);

      return {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const user = await userRepository.findOne({ email: email });
      if (!user) {
        throw new Error("Invalid credentials");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid credentials");
      }

      const token = this.generateToken(user._id);

      return {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userRepository.findById(decoded.userId);

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (updateData.username && updateData.username !== user.username) {
        const existingUser = await userRepository.findOne({
          username: updateData.username,
        });
        if (existingUser) {
          throw new Error("Username already taken");
        }
      }

      const updatedUser = await userRepository.update(userId, updateData);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(currentUserId) {
    try {
      const users = await userRepository.findAll();
      return users.filter(
        (user) => user._id.toString() !== currentUserId.toString()
      );
    } catch (error) {
      throw error;
    }
  }

  async setUserStatus(userId, isOnline) {
    try {
      const user = await userRepository.update(userId, { online: isOnline });
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  authenticateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    try {
      const user = await this.verifyToken(token);
      req.user = user;
      next();
    } catch (error) {
      console.log(error);
      return res.status(403).json({ error: "Invalid token" });
    }
  };
}

module.exports = new AuthService();
