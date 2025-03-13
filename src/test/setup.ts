import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

declare global {
  // eslint-disable-next-line no-var
  var signin: () => Promise<string[] | undefined>;
}

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'opinion-trading-super-secret';
  mongo = new MongoMemoryServer();
  await mongo.start();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = async () => {
  const email = 'test@gmail.com';
  const password = 'test123';
  const username = 'testuser';

  const response = await request(app)
    .post('/api/auth/register')
    .send({
      username,
      email,
      password,
    })
    .expect(201);

  return response.get('Set-Cookie'); // return the cookie
};
