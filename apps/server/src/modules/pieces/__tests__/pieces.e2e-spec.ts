import type { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';

describe('Pieces Endpoints (e2e)', () => {
  let app: INestApplication;
  let piecesModel: any;
  let token: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          process.env.MONGO_URL || 'mongodb://localhost/test-db',
        ),
        AppModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    piecesModel = moduleFixture.get('PieceModel');

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
    // Purge la collection Piece avant chaque test
    await piecesModel.deleteMany({});
  });

  it('/api/v1/pieces (GET) - liste vide', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/pieces')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items).toHaveLength(0);
  });

  it('/api/v1/pieces (POST) - création', async () => {
    const newPiece = {
      _id: new Types.ObjectId().toHexString(),
      ref: '3001',
      name: 'Brick 2x4',
      color: 'Red',
    };
    const res = await request(app.getHttpServer())
      .post('/api/v1/pieces')
      .set('Authorization', `Bearer ${token}`)
      .send(newPiece);
    expect(res.status).toBe(201);
    const body = res.body as { _id: string; name: string };
    expect(body._id).toBeDefined();
    expect(body.name).toBe('Brick 2x4');
  });

  it('/api/v1/pieces (GET) - filtre par couleur', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/pieces?color=Red')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
  });

  it('/api/v1/pieces (GET) - pagination', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/pieces?page=1&limit=1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { items: any[]; page: number; limit: number };
    expect(body.items.length).toBeLessThanOrEqual(1);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(1);
  });

  it('/api/v1/pieces (GET) - tri par nom', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/pieces?sort=name')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
  });

  it('/api/v1/pieces/:id (GET) - récupération', async () => {
    const pieceId = new Types.ObjectId().toHexString();
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/pieces')
      .set('Authorization', `Bearer ${token}`)
      .send({ _id: pieceId, ref: '3023', name: 'Plate 1x2', color: 'Blue' });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .get(`/api/v1/pieces/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { name: string };
    expect(body.name).toBe('Plate 1x2');
  });

  it('/api/v1/pieces/:id (PUT) - mise à jour', async () => {
    const pieceId = new Types.ObjectId().toHexString();
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/pieces')
      .set('Authorization', `Bearer ${token}`)
      .send({ _id: pieceId, ref: '3070b', name: 'Tile 1x1', color: 'Yellow' });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .put(`/api/v1/pieces/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        _id: pieceId,
        ref: '3070b',
        name: 'Tile 1x1 Updated',
        color: 'Yellow',
      });
    expect(res.status).toBe(200);
    const body = res.body as { name: string };
    expect(body.name).toBe('Tile 1x1 Updated');
  });

  it('/api/v1/pieces/:id (DELETE) - suppression', async () => {
    const pieceId = new Types.ObjectId().toHexString();
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/pieces')
      .set('Authorization', `Bearer ${token}`)
      .send({
        _id: pieceId,
        ref: '3039',
        name: 'Slope 45 2x2',
        color: 'Black',
      });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .delete(`/api/v1/pieces/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const body = res.body as { _id: string };
    expect(body._id).toBe(id);
  });

  afterAll(async () => {
    await app.close();
  });
});
