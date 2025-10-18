import type { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import * as request from 'supertest';
import { InventoryModule } from '../inventory.module';

describe('Inventory Endpoints (e2e)', () => {
  let app: INestApplication;

  let userId: string;
  let pieceId: string;
  beforeAll(async () => {
    userId = new Types.ObjectId().toHexString();
    pieceId = new Types.ObjectId().toHexString();
    const moduleFixture = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          process.env.MONGO_URL || 'mongodb://localhost/test-db',
        ),
        InventoryModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await app.get('InventoryModel').deleteMany({});
  });

  it('/api/v1/inventory (GET) - liste vide', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/inventory');
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items).toHaveLength(0);
  });

  it('/api/v1/inventory (POST) - création', async () => {
    const newInventory = {
      user_id: userId,
      pieces: [],
    };
    const res = await request(app.getHttpServer())
      .post('/api/v1/inventory')
      .send(newInventory);
    expect(res.status).toBe(201);
    const body = res.body as { _id: string };
    expect(body._id).toBeDefined();
  });

  it('/api/v1/inventory (GET) - filtre par user', async () => {
    const res = await request(app.getHttpServer()).get(
      `/api/v1/inventory?user_id=${userId}`,
    );
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
  });

  it('/api/v1/inventory (GET) - pagination', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/v1/inventory?page=1&limit=1',
    );
    expect(res.status).toBe(200);
    const body = res.body as { items: any[]; page: number; limit: number };
    expect(body.items.length).toBeLessThanOrEqual(1);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(1);
  });

  it('/api/v1/inventory (GET) - tri par date', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/v1/inventory?sort=created_at',
    );
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
  });

  it('/api/v1/inventory/:id (GET) - récupération', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/inventory')
      .send({ user_id: userId, pieces: [] });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer()).get(
      `/api/v1/inventory/${id}`,
    );
    expect(res.status).toBe(200);
    const body = res.body as { user_id: string };
    expect(body).toBeDefined();
    expect(body.user_id).toBe(userId);
  });

  it('/api/v1/inventory/:id (PUT) - mise à jour', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/inventory')
      .send({ user_id: userId, pieces: [] });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .put(`/api/v1/inventory/${id}`)
      .send({ user_id: userId, pieces: [{ piece_id: pieceId, quantity: 2 }] });
    expect(res.status).toBe(200);
    const body = res.body as { pieces: any[] };
    expect(Array.isArray(body.pieces)).toBe(true);
    expect(body.pieces.length).toBeGreaterThan(0);
  });

  it('/api/v1/inventory/:id (DELETE) - suppression', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/inventory')
      .send({ user_id: userId, pieces: [] });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer()).delete(
      `/api/v1/inventory/${id}`,
    );
    expect(res.status).toBe(200);
    const body = res.body as { _id: string };
    expect(body._id).toBe(id);
  });

  afterAll(async () => {
    await app.close();
  });
});
