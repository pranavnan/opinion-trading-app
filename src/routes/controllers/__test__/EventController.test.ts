import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../../../app';
import { IAuthService } from '../../../application/services/interfaces/IAuthService';
import { TYPES } from '../../../config/types';
import { container } from '../../../config/inversify.config';

describe('Event Controller', () => {
  let adminToken: string;
  let userToken: string;
  let testEvent: any;
  const adminId = new mongoose.Types.ObjectId().toString();
  
  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opinion-trading-test');
    }
    
    // Clear database before tests
    await mongoose.connection.db.dropDatabase();
    
    // Register a regular user for testing
    const authService = container.get<IAuthService>(TYPES.AuthService);
    const userRegistration = await authService.register(
      'testuser',
      'test@example.com',
      'password123'
    );
    userToken = userRegistration.token;
    
    // Create an admin user directly in the database using mongoose
    await mongoose.connection.db.collection('users').insertOne({
      _id: new mongoose.Types.ObjectId(adminId),
      username: 'admin',
      email: 'admin@example.com',
      password: 'hashed_password',
      role: 'admin',
      balance: 1000,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Generate token for admin
    const JWT_SECRET = process.env.JWT_SECRET || 'opinion-trading-secret';
    adminToken = jwt.sign(
      { id: adminId, role: 'admin' },
      JWT_SECRET
    );
    
    console.log('Admin token:', adminToken);
    console.log('Admin token decoded:', jwt.decode(adminToken));
    
    // Create test event data
    testEvent = {
      title: 'Test Event',
      description: 'This is a test event',
      category: 'Sports',
      options: [
        { name: 'Option 1', odds: 50 },
        { name: 'Option 2', odds: 50 }
      ],
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000), // 1 day from now
      status: 'upcoming'
    };
  });

  beforeEach(async () => {
    // Clear events collection before each test
    await mongoose.connection.db.collection('events').deleteMany({});
  });

  describe('GET /api/events', () => {
    it('should return empty array when no events exist', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);
      
      expect(response.body).toEqual([]);
    });

    it('should return all events', async () => {
      // Create an event first
      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEvent)
        .expect(201);
      
      const response = await request(app)
        .get('/api/events')
        .expect(200);
      
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('title', testEvent.title);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return event by id', async () => {
      // Create an event first
      const createResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEvent)
        .expect(201);
      
      const eventId = createResponse.body._id;
      
      const response = await request(app)
        .get(`/api/events/${eventId}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('_id', eventId);
      expect(response.body).toHaveProperty('title', testEvent.title);
    });

    it('should return 404 for non-existent event', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toHexString();
      
      await request(app)
        .get(`/api/events/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('GET /api/events/category/:category', () => {
    it('should return events by category', async () => {
      // Create an event first
      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEvent)
        .expect(201);
      
      const response = await request(app)
        .get(`/api/events/category/${testEvent.category}`)
        .expect(200);
      
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('category', testEvent.category);
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/api/events/category/nonexistent')
        .expect(200);
      
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/events', () => {
    it('should create new event when admin is authenticated', async () => {
      console.log('Test event data:', JSON.stringify(testEvent, null, 2));
      
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEvent)
        .expect(201);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', testEvent.title);
      expect(response.body).toHaveProperty('description', testEvent.description);
      expect(response.body).toHaveProperty('options');
      expect(response.body.options).toHaveLength(2);
      expect(response.body.options[0]).toHaveProperty('name', testEvent.options[0].name);
      expect(response.body.options[0]).toHaveProperty('odds', testEvent.options[0].odds);
      
      // Check event was saved to database
      const eventCount = await mongoose.connection.db.collection('events').countDocuments();
      expect(eventCount).toBe(1);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .post('/api/events')
        .send(testEvent)
        .expect(401);
    });

    it('should return 403 if authenticated but not admin', async () => {
      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testEvent)
        .expect(403);
    });

    it('should return 400 if required fields are missing', async () => {
      // Missing title
      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: testEvent.description,
          category: testEvent.category,
          startTime: testEvent.startTime,
          endTime: testEvent.endTime,
          options: testEvent.options
        })
        .expect(400);
      
      // Missing options
      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: testEvent.title,
          description: testEvent.description,
          category: testEvent.category,
          startTime: testEvent.startTime,
          endTime: testEvent.endTime
        })
        .expect(400);
    });
  });

  describe('PUT /api/events/:id', () => {
    let eventId: string;

    beforeEach(async () => {
      // Create an event to update
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEvent);
      
      eventId = response.body._id;
    });

    it('should update event when admin is authenticated', async () => {
      const updates = {
        title: 'Updated Event Title',
        description: 'Updated event description'
      };
      
      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(200);
      
      expect(response.body).toHaveProperty('_id', eventId);
      expect(response.body).toHaveProperty('title', updates.title);
      expect(response.body).toHaveProperty('description', updates.description);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .put(`/api/events/${eventId}`)
        .send({ title: 'Updated Title' })
        .expect(401);
    });

    it('should return 403 if authenticated but not admin', async () => {
      await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title' })
        .expect(403);
    });

    it('should return 404 for non-existent event', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toHexString();
      
      await request(app)
        .put(`/api/events/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe('PUT /api/events/:id/settle', () => {
    let eventId: string;
    let winningOptionId: string;

    beforeEach(async () => {
      // Create an event to settle
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEvent);
      
      eventId = response.body._id;
      winningOptionId = response.body.options[0]._id;
    });

    it('should settle event when admin is authenticated', async () => {
      const response = await request(app)
        .put(`/api/events/${eventId}/settle`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ winningOptionId })
        .expect(200);
      
      expect(response.body).toHaveProperty('_id', eventId);
      expect(response.body).toHaveProperty('status', 'settled');
      
      // Check that the winning option has result=true
      const winningOption = response.body.options.find((option: any) => option._id === winningOptionId);
      expect(winningOption).toBeDefined();
      expect(winningOption.result).toBe(true);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .put(`/api/events/${eventId}/settle`)
        .send({ winningOptionId })
        .expect(401);
    });

    it('should return 403 if authenticated but not admin', async () => {
      await request(app)
        .put(`/api/events/${eventId}/settle`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ winningOptionId })
        .expect(403);
    });

    it('should return 400 if winningOptionId is missing', async () => {
      await request(app)
        .put(`/api/events/${eventId}/settle`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });

    it('should return 404 for non-existent event', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      await request(app)
        .put(`/api/events/${nonExistentId}/settle`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ winningOptionId })
        .expect(404);
    });
  });

  describe('DELETE /api/events/:id', () => {
    let eventId: string;

    beforeEach(async () => {
      // Create an event to delete
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEvent);
      
      eventId = response.body._id;
    });

    it('should delete event when admin is authenticated', async () => {
      await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      // Verify the event was deleted
      const response = await request(app)
        .get(`/api/events/${eventId}`)
        .expect(404);
      
      expect(response.body).toHaveProperty('message', 'Event not found');
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .delete(`/api/events/${eventId}`)
        .expect(401);
    });

    it('should return 403 if authenticated but not admin', async () => {
      await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent event', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toHexString();
      
      await request(app)
        .delete(`/api/events/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
}); 