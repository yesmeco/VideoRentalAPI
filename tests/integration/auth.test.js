const mongoose = require('mongoose');
const request = require('supertest');
const { User } = require('../../models/user')
const { Genre } = require('../../models/genre');

describe('auth middleware', () => {
    let server;
    beforeAll(() => {
        server = require('../../index');
    });
    afterAll(async () => {
        await server.close();
        mongoose.connection.close()

    })

    beforeEach(() => {
        token = new User().generateAuthToken();
    });
    afterEach(async () => {
        await Genre.deleteMany({});
    });

    let token;
    let name;
    const exec = function () {
        return request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name });
    }

    it('should return a 401 if no token is provided', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
    });

    it('should return a 400 if token is invalid', async () => {
        token = 'e';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return a 200 if token is valid', async () => {
        name = 'romance';
        const res = await exec();
        expect(res.status).toBe(200);
    });
});