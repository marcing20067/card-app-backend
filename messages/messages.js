exports.messages = {
  global: {
    invalidData: "Invalid request data.",
    internalError: "Unexpected error occurred. Please try again later.",
  },
  oneTimeToken: {
    invalidData: "Token does not exist.",
    tokenHasBeenUsedSuccessfully: "The user has been activated successfully.",
    newTokenHasBeenCreated: "Check your email.",
    newTokenHasBeenGenerated:
      "The previous token has expired. Check the email and go to the new link.",
  },
  user: {
    invalidData: "User does not exist.",
    usernameTaken: "Username is already taken.",
    invalidUsername: "Username or password is invalid.",
    usernameWasChanged: "Username has been changed successfully.",
    passwordWasChanged: "Password has been changed successfully.",
    samePassword: "The password is the same as the previous one.",
    logoutSuccessfully: "Logout successfully.",
  },
  jwtToken: {
    invalidRefreshToken: "Invalid refresh token.",
    invalidAccessToken: "Invalid authorization.",
  },
  sets: {
    nameTaken: "Name is already taken.",
  },
};
