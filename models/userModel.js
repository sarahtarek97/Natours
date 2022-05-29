const crypto = require("crypto");
const bcrypt = require("bcryptjs/dist/bcrypt");
const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

//create user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email!"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "admin", "guide", "lead-guide"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    //this only use when create or save methods
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: "passwords should be the same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

//use this hook to hash the password before saving it
userSchema.pre("save", async function(next) {
  //will use this function if password actually modified in save or update
  if (!this.isModified("password")) return next();

  // 12 mean salting the password to make it more secure before hashing it
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.checkPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changeTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
console.log(" this.passwordResetToken", this.passwordResetToken)
console.log(" resetToken", resetToken)
  return resetToken;
};

//create a model from the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
