const mongoose = require('mongoose');
const request = require('supertest');
const { Movie } = require('../../models/movie');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');

let url = '/api/movies';


describe('/api/movies', () => {
    let server;
    beforeAll(() => {
        server = require('../../index');
    });
    afterAll(async () => {
        await server.close();
        mongoose.connection.close()
    })

    let movie;
    let genre;
    let token;

    beforeEach(async () => {
        token = new User().generateAuthToken();

        genre = new Genre({ name: 'horror' })
        await genre.save();

        movie = new Movie({
            title: 'movie test',
            numberInStock: 2,
            dailyRentalRate: 3,
            genre: { _id: genre._id, name: genre.name }
        });
        await movie.save();
    })
    afterEach(async () => {
        await Movie.deleteMany({});
    });


    describe('GET /', () => {
        it('should return all movies', async () => {
            const result = await request(server).get(url).set('x-auth-token', token);

            expect(result.status).toBe(200);
            expect(result.body.length).toBeGreaterThan(0);
        });

        it('should return the specify movie', async () => {
            const result = await request(server).get(url).set('x-auth-token', token);

            expect(result.status).toBe(200);
            //expect(result.body.length).toBeGreaterThan(0);
        });
    });
    describe('GET /:id', () => {

        it('should return the specify movie', async () => {
            const result = await request(server).get(url + '/' + movie._id).set('x-auth-token', token);

            expect(result.status).toBe(200);
        });
    });
});