const request = require('supertest');
const mongoose = require('mongoose');
const { Customer } = require('../../models/customer');
const { User } = require('../../models/user');

let server;
let url = '/api/customers';


describe(url, () => {
    let token;

    beforeAll(() => {
        server = require('../../index');
    });
    afterAll(async () => {
        await server.close();
        mongoose.connection.close()

    });

    beforeEach(() => {
        token = new User().generateAuthToken();
    });

    afterEach(async () => {
        await Customer.deleteMany({});
    });

    describe('GET /', () => {
        it('should return all customers', async () => {

            await Customer.collection.insertOne({ name: 'Juan Perez', phone: '12345678' });
            const result = await request(server).get(url).set('x-auth-token', token);

            expect(result.status).toBe(200);
            //expect(result.body.length).toBeGreaterThan(0);
        });
    });
});