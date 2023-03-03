const request = require('supertest');
const moment = require('moment');
const mongoose = require('mongoose');
const { Rental } = require('../../models/rental')
const { Movie } = require('../../models/movie')
const { User } = require('../../models/user')


describe('/api/returns', () => {
    let server;
    let customerId;
    let movieId;
    let movie;
    let rental;
    let token;

    const exec = () => {
        return request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId });
    }
    beforeAll(() => {
        server = require('../../index');
    });
    afterAll(async () => {
        await server.close();
        mongoose.connection.close()
    })


    beforeEach(async () => {

        customerId = mongoose.Types.ObjectId().toHexString();
        movieId = mongoose.Types.ObjectId().toHexString();

        movie = new Movie({
            _id: movieId,
            title: 'atitle',
            numberInStock: 2,
            dailyRentalRate: 3,
            genre: { _id: mongoose.Types.ObjectId().toHexString(), name: 'fantasy' }
        });
        await movie.save();


        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345',
            },
            movie: {
                _id: movieId,
                title: 'atitle',
                dailyRentalRate: 2
            }
        });

        await rental.save();
        token = new User().generateAuthToken();
    })

    afterEach(async () => {

        await Rental.deleteMany({});
    });

    it('should 401 if client is not logged in', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
    });

    it('should 400 if customerId is not provided', async () => {
        customerId = '';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should 400 if movieId is not provided', async () => {
        movieId = '';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should 404 if no rental found for this customer/movie', async () => {
        await Rental.deleteMany({});
        const res = await exec();

        expect(res.status).toBe(404);
    });

    it('should 400 if rental is already process', async () => {
        rental.dateReturned = new Date();
        await rental.save();
        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 if valid request', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
    });

    it('should set the return date if input is valid', async () => {
        await exec();
        const rentalDB = await Rental.findById(rental._id);
        const diff = new Date() - rentalDB.dateReturned;
        expect(diff).toBeLessThan(10 * 1000);
    });

    it('should calculate the rental fee if input is valid', async () => {
        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();

        await exec();
        const rentalDB = await Rental.findById(rental._id);
        expect(rentalDB.rentalFee).toBe(14);
    });

    it('should increase movie the stock if input is valid', async () => {
        await exec();
        const movieDB = await Movie.findById(movieId);

        expect(movieDB.numberInStock).toBe(movie.numberInStock + 1);
    });

    it('should return the rental if input is valid', async () => {
        const res = await exec();


        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(["_id", "customer", "movie", "dateOut", "dateReturned", "rentalFee"])
        )
    });

})