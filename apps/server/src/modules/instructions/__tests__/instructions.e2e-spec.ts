import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import * as request from 'supertest';
import { InstructionsModule } from '../instructions.module';

describe('Instructions Endpoints (e2e)', () => {
  let app: INestApplication;
  let setId: string;
  beforeAll(async () => {
    setId = new Types.ObjectId().toHexString();
    const moduleFixture = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          process.env.MONGO_URL || 'mongodb://localhost/test-db',
        ),
        InstructionsModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await app.get('InstructionModel').deleteMany({});
  });

  it('/api/v1/instructions (GET) - liste vide', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/instructions');
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBe(0);
  });

  it('/api/v1/instructions (POST) - création', async () => {
    const newInstruction = {
      set_id: setId,
      steps: [],
    };
    const res = await request(app.getHttpServer())
      .post('/api/v1/instructions')
      .send(newInstruction);
    expect(res.status).toBe(201);
    const body = res.body as { _id: string };
    expect(body._id).toBeDefined();
  });

  it('/api/v1/instructions (GET) - filtre par set', async () => {
    const res = await request(app.getHttpServer()).get(
      `/api/v1/instructions?set_id=${setId}`,
    );
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
  });

  it('/api/v1/instructions (GET) - pagination', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/v1/instructions?page=1&limit=1',
    );
    expect(res.status).toBe(200);
    const body = res.body as { items: any[]; page: number; limit: number };
    expect(body.items.length).toBeLessThanOrEqual(1);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(1);
  });

  it('/api/v1/instructions (GET) - tri par date', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/v1/instructions?sort=created_at',
    );
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
  });

  it('/api/v1/instructions/:id (GET) - récupération', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/instructions')
      .send({ set_id: setId, steps: [] });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer()).get(
      `/api/v1/instructions/${id}`,
    );
    expect(res.status).toBe(200);
    const body = res.body as { set_id: string };
    expect(body.set_id).toBe(setId);
  });

  it('/api/v1/instructions/:id (PUT) - mise à jour', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/instructions')
      .send({ set_id: setId, steps: [] });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .put(`/api/v1/instructions/${id}`)
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
      .send({ set_id: setId, steps: [] });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer()).delete(
      `/api/v1/instructions/${id}`,
    );
    expect(res.status).toBe(200);
    const body = res.body as { _id: string };
    expect(body._id).toBe(id);
  });

  afterAll(async () => {
    await app.close();
  });
});
