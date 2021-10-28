module.exports = {
    global: {
        invalidData: 'Invalid request data.',
    },
    oneTimeToken: {
        invalidData: 'Token does not exist.',
        tokenHasBeenUsedSuccessfully: 'The user has been activated successfully.',
        newTokenHasBeenCreated: 'Check your email.',
        newTokenHasBeenGenerated: 'The previous token has expired. Check the email and go to the new link.',
    },
    user: {
        invalidData: 'User does not exist.',
        usernameTaken: 'Username is already taken.',
        invalidUsername: 'Username or password is invalid.',
        passwordWasChanged: 'Password has been changed successfully.',
        samePassword: 'The password is the same as the previous one.'
    },
    jwtToken: {
        invalidRefreshToken: 'Invalid refresh token.',
        invalidAccessToken: 'Invalid authorization.'
    }
}