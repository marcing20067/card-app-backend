const {} = require('./testApi.js');
const app = require('../app.js');
const mongoose = require('mongoose');
const User = require('../models/user');
const user = require('../errorTexts/modelsTexts/user.js');
afterAll(done => {
    mongoose.connection.close()
    done()
})

const resetPasswordRequest = (data) => {
    return httpPostByAppWithOptions(app, {
        endpoint: '/refresh',
        data: data
    });
}

describe('/resetPassword POST', () => {
    describe('correct request', () => {
        let response;
        // let userData;
        beforeAll(async () => {
            const userData = {
                username: 'userxyz',
                password: 'passwordxyz'
            }
            const newUser = new User(userData);
            const createdUser = newUser.save();
            
        })
        beforeAll(async () => {
            response = await resetPasswordRequest();
        })
    })
})