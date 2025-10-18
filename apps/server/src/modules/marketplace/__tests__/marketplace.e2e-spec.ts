import type { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';

describe('Marketplace Endpoints (e2e)', () => {
  let app: INestApplication;
  let marketplaceModel: any;
  let token: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          process.env.MONGO_URL || 'mongodb://localhost/test-db-marketplace',
        ),
        AppModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    marketplaceModel = moduleFixture.get('MarketplaceLinkModel');

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
    // Purge la collection MarketplaceLink avant chaque test
    await marketplaceModel.deleteMany({});
  });

  it('/api/v1/marketplace (GET) - liste vide', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/marketplace')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items).toHaveLength(0);
  });

  it('/api/v1/marketplace (POST) - création', async () => {
    const newLink = {
      piece_id: new Types.ObjectId().toHexString(),
      url: 'https://lego.com',
      price: 99.99,
    };
    const res = await request(app.getHttpServer())
      .post('/api/v1/marketplace')
      .set('Authorization', `Bearer ${token}`)
      .send(newLink);
    expect(res.status).toBe(201);
    const body = res.body as { _id: string };
    expect(body._id).toBeDefined();
  });

  it('/api/v1/marketplace (GET) - filtre par piece_id', async () => {
    const pieceId = new Types.ObjectId().toHexString();
    await request(app.getHttpServer())
      .post('/api/v1/marketplace')
      .set('Authorization', `Bearer ${token}`)
      .send({ piece_id: pieceId, url: 'https://lego.com', price: 99.99 });
    const res = await request(app.getHttpServer())
      .get(`/api/v1/marketplace?piece_id=${pieceId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
    expect(body.items.length).toBeGreaterThan(0);
  });

  it('/api/v1/marketplace (GET) - pagination', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/marketplace?page=1&limit=1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { items: any[]; page: number; limit: number };
    expect(body.items.length).toBeLessThanOrEqual(1);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(1);
  });

  it('/api/v1/marketplace (GET) - tri par prix', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/marketplace?sort=price')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
  });

  it('/api/v1/marketplace/:id (GET) - récupération', async () => {
    const pieceId = new Types.ObjectId().toHexString();
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/marketplace')
      .set('Authorization', `Bearer ${token}`)
      .send({ piece_id: pieceId, url: 'https://lego.com', price: 49.99 });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .get(`/api/v1/marketplace/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { url: string };
    expect(body.url).toBe('https://lego.com');
  });

  it('/api/v1/marketplace/:id (PUT) - mise à jour', async () => {
    const pieceId = new Types.ObjectId().toHexString();
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/marketplace')
      .set('Authorization', `Bearer ${token}`)
      .send({ piece_id: pieceId, url: 'https://lego.com', price: 49.99 });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .put(`/api/v1/marketplace/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ piece_id: pieceId, url: 'https://lego.com', price: 59.99 });
    expect(res.status).toBe(200);
    const body = res.body as { price: number };
    expect(body.price).toBe(59.99);
  });

  it('/api/v1/marketplace/:id (DELETE) - suppression', async () => {
    const pieceId = new Types.ObjectId().toHexString();
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/marketplace')
      .set('Authorization', `Bearer ${token}`)
      .send({ piece_id: pieceId, url: 'https://lego.com', price: 39.99 });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .delete(`/api/v1/marketplace/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const body = res.body as { _id: string };
    expect(body._id).toBe(id);
  });

  afterAll(async () => {
    await app.close();
  });
});
