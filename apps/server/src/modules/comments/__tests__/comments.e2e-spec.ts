import type { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';

describe('Comments Endpoints (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          process.env.MONGO_URL || 'mongodb://localhost/test-db-comments',
        ),
        AppModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    await app.get('UserModel').deleteMany({});

    // Création utilisateur partagé
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'test@e2e.com', password: 'Str0ng!Pass' });
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@e2e.com', password: 'Str0ng!Pass' });
    token = loginRes.body.access_token;

    // Création utilisateur admin
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'admin@e2e.com', password: 'Str0ng!Pass', role: 'admin' });
    const adminLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@e2e.com', password: 'Str0ng!Pass' });
    adminToken = adminLoginRes.body.access_token;
  });

  beforeEach(async () => {
    await app.get('CommentModel').deleteMany({});
  });

  it('/api/v1/comments (GET) - liste vide', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/comments')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body;
    expect(body.items).toBeDefined();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items).toHaveLength(0);
  });

  it('/api/v1/comments (POST) - création', async () => {
    const newComment = {
      user_id: new Types.ObjectId().toHexString(),
      target_type: 'set',
      target_id: new Types.ObjectId().toHexString(),
      content: 'Super set!',
    };
    const res = await request(app.getHttpServer())
      .post('/api/v1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send(newComment);
    expect(res.status).toBe(201);
    const body = res.body as { _id: string };
    expect(body._id).toBeDefined();
  });

  it('/api/v1/comments (GET) - filtre par set', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/comments?set=setId`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body;
    expect(body.items).toBeDefined();
  });

  it('/api/v1/comments (GET) - pagination', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/comments?page=1&limit=1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body;
    expect(body.items.length).toBeLessThanOrEqual(1);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(1);
  });

  it('/api/v1/comments (GET) - tri par date', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/comments?sort=created_at')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body;
    expect(body.items).toBeDefined();
  });

  it('/api/v1/comments/:id (GET) - récupération', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user_id: new Types.ObjectId().toHexString(),
        target_type: 'set',
        target_id: new Types.ObjectId().toHexString(),
        content: 'Test comment',
      });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .get(`/api/v1/comments/${id}`)
      .set('Authorization', `Bearer ${token}`);
    const body = res.body as { content: string };
    expect(res.status).toBe(200);
    expect(body.content).toBe('Test comment');
  });

  it('/api/v1/comments/:id (PUT) - mise à jour', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user_id: new Types.ObjectId().toHexString(),
        target_type: 'set',
        target_id: new Types.ObjectId().toHexString(),
        content: 'Old comment',
      });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .put(`/api/v1/comments/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        user_id: new Types.ObjectId().toHexString(),
        target_type: 'set',
        target_id: new Types.ObjectId().toHexString(),
        content: 'Updated comment',
      });
    expect(res.status).toBe(200);
    const body = res.body as { content: string };
    expect(body.content).toBe('Updated comment');
  });

  it('/api/v1/comments/:id (DELETE) - suppression', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user_id: new Types.ObjectId().toHexString(),
        target_type: 'set',
        target_id: new Types.ObjectId().toHexString(),
        content: 'To delete',
      });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .delete(`/api/v1/comments/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const body = res.body as { _id: string };
    expect(body._id).toBe(id);
  });

  afterAll(async () => {
    await app.close();
  });
});
