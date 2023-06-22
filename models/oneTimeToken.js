const mongoose = require("mongoose");
const { Schema } = mongoose;
const crypto = require("crypto");
const { User } = require("./user");
const { getMailData } = require("../messages/email");
const { sendMail } = require("../util/email");

const generateTokenData = () => {
  return {
    token: generateToken(),
    endOfValidity: generateEndOfValidity(),
  };
};

const generateToken = () => {
  const tokenLength = +process.env.ONE_TIME_TOKEN_LENGTH;
  const token = crypto.randomBytes(tokenLength / 2).toString("hex");
  return token;
};

const generateEndOfValidity = () => {
  const oneTimeTokenExpiresInWeeks =
    process.env.ONE_TIME_TOKEN_EXPIRES_IN_WEEKS;
  const now = new Date();
  const endOfValidity = new Date().setDate(
    now.getDate() + oneTimeTokenExpiresInWeeks * 7
  );
  return endOfValidity;
};

const OneTimeTokenSchema = new Schema(
  {
    resetPassword: {
      type: {
        token: { type: String, unique: true, required: true },
        endOfValidity: { type: Number, required: true },
      },
    },
    resetUsername: {
      type: {
        token: { type: String, unique: true, required: true },
        endOfValidity: { type: Number, required: true },
      },
    },
    activation: {
      type: {
        token: { type: String, unique: true, required: true },
        endOfValidity: { type: Number, required: true },
      },
      default: generateTokenData,
    },
    creator: { type: Schema.Types.ObjectId, required: true, unique: true },
  },
  { versionKey: false }
);

OneTimeTokenSchema.methods.createUrl = function (tokenType) {
  const frontendUrl = process.env.FRONTEND_URL;
  const token = this[tokenType].token;
  if (tokenType.includes("Username") || tokenType.includes("Password")) {
    const correctTokenType = tokenType.replace("U", "/u").replace("P", "/p");
    return `${frontendUrl}/${correctTokenType}/${token}`;
  }
  return `${frontendUrl}/auth/${tokenType}/${token}`;
};

OneTimeTokenSchema.methods.hasTokenExpired = function (tokenType) {
  const now = Date.now();
  return now > this[tokenType].endOfValidity;
};

OneTimeTokenSchema.methods.makeValid = async function (tokenType) {
  this[tokenType] = generateTokenData();
  const updatedOneTimeToken = await this.save();
  return updatedOneTimeToken;
};

OneTimeTokenSchema.methods.sendEmailWithToken = async function (tokenType) {
  const url = this.createUrl(tokenType);
  const owner = await User.findOne({ _id: this.creator });
  const html = getMailData.html[tokenType](url).html;
  const subject = getMailData.subject[tokenType];
  sendMail({
    from: `Poliglot ${process.env.GMAIL}`,
    to: owner.email,
    subject: subject,
    html: html,
  });
};

exports.OneTimeToken = mongoose.model("OneTimeToken", OneTimeTokenSchema);
