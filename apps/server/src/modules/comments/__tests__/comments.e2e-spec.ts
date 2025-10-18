import type { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import * as request from 'supertest';
import { CommentsModule } from '../comments.module';

describe('Comments Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          process.env.MONGO_URL || 'mongodb://localhost/test-db',
        ),
        CommentsModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await app.get('CommentModel').deleteMany({});
  });

  it('/api/v1/comments (GET) - liste vide', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/comments');
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
      .send(newComment);
    expect(res.status).toBe(201);
    const body = res.body as { _id: string };
    expect(body._id).toBeDefined();
  });

  it('/api/v1/comments (GET) - filtre par set', async () => {
    const res = await request(app.getHttpServer()).get(
      `/api/v1/comments?set=setId`,
    );
    expect(res.status).toBe(200);
    const body = res.body;
    expect(body.items).toBeDefined();
  });

  it('/api/v1/comments (GET) - pagination', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/v1/comments?page=1&limit=1',
    );
    expect(res.status).toBe(200);
    const body = res.body;
    expect(body.items.length).toBeLessThanOrEqual(1);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(1);
  });

  it('/api/v1/comments (GET) - tri par date', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/v1/comments?sort=created_at',
    );
    expect(res.status).toBe(200);
    const body = res.body;
    expect(body.items).toBeDefined();
  });

  it('/api/v1/comments/:id (GET) - récupération', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/comments')
      .send({
        user_id: new Types.ObjectId().toHexString(),
        target_type: 'set',
        target_id: new Types.ObjectId().toHexString(),
        content: 'Test comment',
      });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer()).get(
      `/api/v1/comments/${id}`,
    );
    const body = res.body as { content: string };
    expect(res.status).toBe(200);
    expect(body.content).toBe('Test comment');
  });

  it('/api/v1/comments/:id (PUT) - mise à jour', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/comments')
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
      .send({
        user_id: new Types.ObjectId().toHexString(),
        target_type: 'set',
        target_id: new Types.ObjectId().toHexString(),
        content: 'To delete',
      });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer()).delete(
      `/api/v1/comments/${id}`,
    );
    expect(res.status).toBe(200);
    const body = res.body as { _id: string };
    expect(body._id).toBe(id);
  });

  afterAll(async () => {
    await app.close();
  });
});
