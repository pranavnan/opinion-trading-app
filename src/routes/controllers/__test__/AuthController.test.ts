import request from 'supertest';
import { app } from '../../../app';
import mongoose from 'mongoose';

describe('Auth Controller', () => {
  // Test data
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    // Clear users collection before each test
    await mongoose.connection.db.collection('users').deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201 with user data and token', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
      
      // Check response structure
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user).toHaveProperty('username', testUser.username);
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
      
      // Check user was saved to database
      const userCount = await mongoose.connection.db.collection('users').countDocuments();
      expect(userCount).toBe(1);
    });

    it('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Please provide username, email, and password');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Please provide username, email, and password');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: testUser.username,
          email: testUser.email
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Please provide username, email, and password');
    });

    it('should return 400 if user with same email already exists', async () => {
      // Create a user first
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
      
      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'differentuser',
          email: testUser.email,
          password: 'different123'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user before testing login
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
    });

    it('should login a user and return 200 with user data and token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', testUser.username);
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: testUser.password
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Please provide email and password');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Please provide email and password');
    });

    it('should return 400 if email is incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: testUser.password
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if password is incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/change-password', () => {
    let token: string;

    beforeEach(async () => {
      // Register and login to get the token
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      token = loginResponse.body.token;
    });

    it('should change password successfully and return 200', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: testUser.password,
          newPassword: 'newpassword123'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Password changed successfully');
      
      // Verify we can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'newpassword123'
        })
        .expect(200);
      
      expect(loginResponse.body).toHaveProperty('token');
    });

    it('should return 400 if old password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          newPassword: 'newpassword123'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Please provide old and new passwords');
    });

    it('should return 400 if new password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: testUser.password
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Please provide old and new passwords');
    });

    it('should return 400 if old password is incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'wrongoldpassword',
          newPassword: 'newpassword123'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .post('/api/auth/change-password')
        .send({
          oldPassword: testUser.password,
          newPassword: 'newpassword123'
        })
        .expect(401);
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
