module.exports = {
    invalidData: 'Invalid request data.',
    invalidAuth: 'Invalid authorization.',
    controllers: {
        user: {
            invalidUsername: 'Username or password is invalid.',
        },
        signup: {
            usernameTaken: 'Username is already taken.',
        },
        login: {
            invalidData: 'User does not exist.'
        },
        refresh: {
            invalidRefreshToken: 'Invalid refresh token.'
        }
    },
    models: { 
        user: {
            invalidUsername: 'Username or password is invalid.',
        }
    }
}