const mongoose = require("mongoose");
const { Schema } = mongoose;
const crypto = require("crypto");
const { User } = require("./user");
const { sendMail } = require("../util/email");
const { email, getEmailHtml } = require("../messages/email");

const generateTokenData = () => ({
  token: generateToken(),
  endOfValidity: generateEndOfValidity(),
});

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
        token: { type: String, unique: true, sparse: true, required: true },
        endOfValidity: { type: Number, required: true },
      },
    },
    resetUsername: {
      type: {
        token: { type: String, unique: true, sparse: true, required: true },
        endOfValidity: { type: Number, required: true },
      },
    },
    activation: {
      type: {
        token: { type: String, unique: true, sparse: true, required: true },
        endOfValidity: { type: Number, required: true },
      },
      default: generateTokenData,
    },
    creator: { type: Schema.Types.ObjectId, required: true, unique: true },
  },
  { versionKey: false }
);

OneTimeTokenSchema.methods.hasTokenExpired = function (tokenType) {
  const now = Date.now();
  return now > this[tokenType].endOfValidity;
};

OneTimeTokenSchema.methods.makeValid = async function (tokenType) {
  this[tokenType] = generateTokenData();
  const updatedOneTimeToken = await this.save();
  return updatedOneTimeToken;
};

OneTimeTokenSchema.methods.createLink = function (tokenType) {
  const frontendUrl = process.env.FRONTEND_URL;
  let endpoint = tokenType.toLowerCase().replace("reset", "");
  endpoint =
    endpoint === "activation" ? "auth/" + endpoint : "reset/" + endpoint;
  const token = this[tokenType].token;
  return `${frontendUrl}/${endpoint}/${token}`;
};

OneTimeTokenSchema.methods.createEmailData = async function (tokenType) {
  const owner = await User.findOne({ _id: this.creator });
  const link = this.createLink(tokenType);

  const html = getEmailHtml(link, tokenType);
  const subject = email.subject[tokenType];
  const from = `Poliglot ${process.env.GMAIL}`;
  const to = owner.email;

  return {
    from,
    to,
    subject,
    html,
  };
};

OneTimeTokenSchema.methods.sendEmailWithToken = async function (tokenType) {
  const email = await this.createEmailData(tokenType);
  sendMail(email);
};

exports.OneTimeToken = mongoose.model("OneTimeToken", OneTimeTokenSchema);
