const mongoose = require('mongoose');
const request = require('supertest');
const { Rental } = require('../../models/rental');
const { User } = require('../../models/user');

let server;
let url = '/api/rentals';


describe(url, () => {
    beforeAll(() => {
        server = require('../../index');
    });
    afterAll(async () => {
        await server.close();
        mongoose.connection.close()
    })

    let rental;
    let token; 

    beforeEach(async () => {
        rental = new Rental({
            customer: {
                _id: mongoose.Types.ObjectId().toHexString(),
                isGold: false,
                name: 'customer name',
                phone: 'customer.phone'
            },
            movie: {
                _id: mongoose.Types.ObjectId().toHexString(),
                title: 'movie.title',
                dailyRentalRate: 2
            }
        });

        await rental.save();
        token = new User().generateAuthToken();
    });
    afterEach(async () => {
        await Rental.deleteMany({});
    });

    describe('GET /', () => {
        it('should return all rentals', async () => {
            const result = await request(server).get(url).set('x-auth-token', token);

            expect(result.status).toBe(200);
        });
    });
});