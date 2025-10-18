import type { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';

describe('Instructions Endpoints (e2e)', () => {
  let app: INestApplication;
  let setId: string;
  let token: string;
  let adminToken: string;
  beforeAll(async () => {
    setId = new Types.ObjectId().toHexString();
    const moduleFixture = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          process.env.MONGO_URL || 'mongodb://localhost/test-db-instructions',
        ),
        AppModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    moduleFixture.get('UserModel').deleteMany({});

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
    await app.get('InstructionModel').deleteMany({});
  });

  it('/api/v1/instructions (GET) - liste vide', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/instructions')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items).toHaveLength(0);
  });

  it('/api/v1/instructions (POST) - création', async () => {
    const newInstruction = {
      set_id: setId,
      steps: [],
    };
    const res = await request(app.getHttpServer())
      .post('/api/v1/instructions')
      .set('Authorization', `Bearer ${token}`)
      .send(newInstruction);
    expect(res.status).toBe(201);
    const body = res.body as { _id: string };
    expect(body._id).toBeDefined();
  });

  it('/api/v1/instructions (GET) - filtre par set', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/instructions?set_id=${setId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
  });

  it('/api/v1/instructions (GET) - pagination', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/instructions?page=1&limit=1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { items: any[]; page: number; limit: number };
    expect(body.items.length).toBeLessThanOrEqual(1);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(1);
  });

  it('/api/v1/instructions (GET) - tri par date', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/instructions?sort=created_at')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
  });

  it('/api/v1/instructions/:id (GET) - récupération', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/instructions')
      .set('Authorization', `Bearer ${token}`)
      .send({ set_id: setId, steps: [] });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .get(`/api/v1/instructions/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { set_id: string };
    expect(body.set_id).toBe(setId);
  });

  it('/api/v1/instructions/:id (PUT) - mise à jour', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/instructions')
      .set('Authorization', `Bearer ${token}`)
      .send({ set_id: setId, steps: [] });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .put(`/api/v1/instructions/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        set_id: setId,
        steps: [{ step: 1 }],
      });
    expect(res.status).toBe(200);
    const body = res.body as { steps: any[] };
    expect(Array.isArray(body.steps)).toBe(true);
    expect(body.steps.length).toBeGreaterThan(0);
  });

  it('/api/v1/instructions/:id (DELETE) - suppression', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/instructions')
      .set('Authorization', `Bearer ${token}`)
      .send({ set_id: setId, steps: [] });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .delete(`/api/v1/instructions/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const body = res.body as { _id: string };
    expect(body._id).toBe(id);
  });

  afterAll(async () => {
    await app.close();
  });
});
