const mongoose = require('mongoose');
const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');

let server;
let url = '/api/genres';


describe(url, () => {
    beforeAll(() => {
        server = require('../../index');
    });
    afterAll(async () => {
        await server.close();
        mongoose.connection.close()

    })


    afterEach(async () => {
        await Genre.deleteMany({});
    });

    describe('GET /', () => {
        it('should return all genres', async () => {

            await Genre.collection.insertMany([
                { name: 'horror', status: true },
                { name: 'fantasy', status: true }
            ])
            const result = await request(server).get(url);

            expect(result.status).toBe(200);
            expect(result.body.length).toBeGreaterThan(0);
            expect(result.body.some(g => g.name === 'horror')).toBeTruthy();
            expect(result.body.some(g => g.name === 'fantasy')).toBeTruthy();

        });
    });

    describe('GET /:id', () => {
        it('should return a genre if a valid id is send', async () => {

            const genre = await new Genre({
                name: 'horror', status: true
            });
            await genre.save();

            const result = await request(server).get(`${url}/${genre._id}`);
            expect(result.body).toHaveProperty('name', genre.name);
            expect(result.status).toBe(200);

        });

        it('should return 404 not found error if not existing id is send', async () => {

            const result = await request(server).get(`${url}/639a5f0d9d8f889bd1e4621d`);
            expect(result.status).toBe(404);
            expect(result.text).toMatch(/not found/);
        });
        it('should return 404 not found error if not valid objectid is send', async () => {

            const result = await request(server).get(`${url}/1`);
            expect(result.status).toBe(404);
            expect(result.text).toMatch(/not found/);
        });
    });

    describe('POST /', () => {
        let token;
        let name;
        const exec = async () => {

            return await request(server).post(url)
                .set('x-auth-token', token)
                .send({ name });

        };

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'biographic';
        })

        it('should return a 401 if the client is not logged in', async () => {
            token = '';
            const response = await exec();
            expect(response.status).toBe(401);
        });

        it('should return a 400 if the genre is less than 5 characters', async () => {
            name = 'n';
            const response = await exec();
            expect(response.status).toBe(400);
        });

        it('should return a 400 if the genre is more than 50 characters', async () => {
            name = new Array(50).join('hola');

            const response = await exec();

            expect(response.status).toBe(400);

        });
        it('should save the genre if it is valid', async () => {


            await exec();

            const genre = await Genre.findOne({ name: 'biographic' });

            expect(genre).not.toBeNull();
        });
        it('should return the genre if its valid', async () => {
            const response = await exec();

            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('name');
        });
    });

    describe('PUT /', () => {
        let token;
        let name;
        let genreId;

        const exec = () => {
            return request(server).put(`${url}/${genreId}`)
                .set('x-auth-token', token)
                .send({ name: name });

        };

        beforeEach(async () => {
            const genre = new Genre({ name: 'biographic' });
            await genre.save()
            genreId = genre._id

            name='fantasy';
            
            token = new User().generateAuthToken();
        })

        it('should return a 401 if the client is not logged in', async () => {
            token = '';
            const response = await exec();
            expect(response.status).toBe(401);
        });

        it('should return a 404 if the id doesnt exist', async () => {
            genreId = mongoose.Types.ObjectId().toHexString();
            const response = await exec();
            expect(response.status).toBe(404);
        });

        it('should return a 400 if the genre is less than 5 characters', async () => {

            name = 'n';
            const response = await exec();
            expect(response.status).toBe(400);
        });

        it('should return a 400 if the genre is more than 50 characters', async () => {


            name = new Array(50).join('ho');
            const response = await exec();

            expect(response.status).toBe(400);

        });

        it('should update the genre if it is valid', async () => {
            await exec();

            const genreDB = await Genre.findById(genreId);
            expect(genreDB).not.toBeNull();
        });

        it('should return the genre if its valid', async () => {

            const response = await exec();
            console.log(response.body);
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('name');
        });
    });
});
