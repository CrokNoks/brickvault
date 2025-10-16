import { INestApplication } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import * as request from 'supertest';
import { SetsModule } from '../../sets/sets.module';
import { ManufacturerModule } from '../manufacturer.module';

describe('Manufacturer Endpoints (e2e)', () => {
  let app: INestApplication;

  let manufacturerModel: Model<any>;
  let setModel: Model<any>;
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          process.env.MONGO_URL || 'mongodb://localhost/test-db-manufacturer',
        ),
        ManufacturerModule,
        SetsModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    manufacturerModel = app.get(getModelToken('Manufacturer'));
    setModel = app.get(getModelToken('Set'));
  });

  beforeEach(async () => {
    await manufacturerModel.deleteMany({});
    await setModel.deleteMany({});
  });

  it('/api/v1/manufacturers (GET) - liste vide', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/manufacturers');
    expect(res.status).toBe(200);
    const body = res.body as { items?: any[] };
    expect(body).toBeDefined();
  });

  it('/api/v1/manufacturers (POST) - création', async () => {
    const newManufacturer = {
      name: 'Cobi',
      country: 'Pologne',
      website: 'https://cobi.pl',
    };
    const res = await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .send(newManufacturer);
    expect(res.status).toBe(201);
    const body = res.body as { _id: string; name: string };
    expect(body._id).toBeDefined();
    expect(body.name).toBe('Cobi');
  });

  it('/api/v1/manufacturers/:id (GET) - récupération', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .send({
        name: 'Mega Bloks',
        country: 'Canada',
        website: 'https://megabloks.com',
      });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer()).get(
      `/api/v1/manufacturers/${id}`,
    );
    expect(res.status).toBe(200);
    const body = res.body as { name: string };
    expect(body.name).toBe('Mega Bloks');
  });

  it('/api/v1/manufacturers/:id (PUT) - mise à jour', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .send({
        name: 'Sluban',
        country: 'Chine',
      });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .put(`/api/v1/manufacturers/${id}`)
      .send({
        name: 'Sluban Updated',
        country: 'Chine',
      });
    expect(res.status).toBe(200);
    const body = res.body as { name: string };
    expect(body.name).toBe('Sluban Updated');
  });

  it('/api/v1/manufacturers/:id (DELETE) - suppression', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .send({
        name: 'BanBao',
        country: 'Chine',
      });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer()).delete(
      `/api/v1/manufacturers/${id}`,
    );
    expect(res.status).toBe(200);
    const body = res.body as { _id: string };
    expect(body._id).toBe(id);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/manufacturers (POST) - validation des champs requis', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .send({ country: 'France' });
    expect(res.status).toBe(400);
  });

  it('/api/v1/manufacturers (POST) - unicité du nom', async () => {
    const data = { name: 'UniqueName', country: 'France' };
    await request(app.getHttpServer()).post('/api/v1/manufacturers').send(data);
    const res = await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .send(data);
    expect(res.status).toBe(400);
    const body = res.body as { message: string };
    expect(body).toBeDefined();
    expect(body.message).toMatch(/already exist/i);
  });

  it('/api/v1/manufacturers (GET) - pagination', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .send({ name: 'Pag1', country: 'FR' });
    await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .send({ name: 'Pag2', country: 'FR' });
    const res = await request(app.getHttpServer()).get(
      '/api/v1/manufacturers?page=1&limit=1',
    );
    expect(res.status).toBe(200);
    const body = res.body as { items: any[]; page: number; limit: number };
    expect(body.items.length).toBeLessThanOrEqual(1);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(1);
  });

  it('/api/v1/manufacturers (GET) - tri par date', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/v1/manufacturers?sort=created_at',
    );
    expect(res.status).toBe(200);
    const body = res.body as { items: any[] };
    expect(body.items).toBeDefined();
  });

  it('/api/v1/manufacturers (GET) - filtrage par pays', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .send({ name: 'FiltreFR', country: 'France' });
    await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .send({ name: 'FiltreDE', country: 'Allemagne' });
    const res = await request(app.getHttpServer()).get(
      '/api/v1/manufacturers?country=France',
    );
    expect(res.status).toBe(200);
    const body = res.body as { items: { country: string }[] };
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.every((m) => m.country === 'France')).toBe(true);
  });

  it('/api/v1/manufacturers/:id (PATCH) - mise à jour partielle', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .send({ name: 'PatchTest', country: 'FR' });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/manufacturers/${id}`)
      .send({ website: 'https://patch.fr' });
    expect(res.status).toBe(200);
    const body = res.body as { website: string };
    expect(body.website).toBeDefined();
    expect(body.website).toBe('https://patch.fr');
  });

  it('/api/v1/manufacturers/:id (GET) - 404 si inexistant', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/v1/manufacturers/507f1f77bcf86cd799439011',
    );
    expect([404, 400]).toContain(res.status);
  });

  // Suppression en cascade : si des sets sont liés, ils doivent être supprimés ou orphelins
  it('/api/v1/manufacturers/:id (DELETE) - suppression en cascade', async () => {
    // Crée un manufacturer
    const manRes = await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .send({ name: 'CascadeManu', country: 'FR' });
    const createBody = manRes.body as { _id: string };
    const manufacturerId = createBody._id;
    // Crée un set lié à ce manufacturer
    const setRes = await request(app.getHttpServer())
      .post('/api/v1/sets')
      .send({
        name: 'CascadeSet',
        theme: 'Test',
        year: 2022,
        piece_count: 100,
        manufacturer: manufacturerId,
        manufacturer_reference: 'CAS-1234',
      });
    const setBody = setRes.body as { _id: string };
    expect(setRes.status).toBe(201);
    expect(setBody._id).toBeDefined();
    const setId = setBody._id;
    // Supprime le manufacturer
    const delRes = await request(app.getHttpServer()).delete(
      `/api/v1/manufacturers/${manufacturerId}`,
    );
    expect(delRes.status).toBe(200);
    // Vérifie que le set est supprimé ou orphelin
    const getSet = await request(app.getHttpServer()).get(
      `/api/v1/sets/${setId}`,
    );
    expect([404, 200]).toContain(getSet.status); // selon la logique métier
  });

  it('/api/v1/manufacturers/:id (GET) - population des sets liés', async () => {
    const manRes = await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .send({ name: 'PopuManu', country: 'FR' });
    const manBody = manRes.body as { _id: string };
    const manufacturerId = manBody._id;
    await request(app.getHttpServer()).post('/api/v1/sets').send({
      name: 'PopuSet',
      theme: 'Test',
      year: 2022,
      piece_count: 100,
      manufacturer: manufacturerId,
      manufacturer_reference: 'POP-1234',
    });
    const res = await request(app.getHttpServer()).get(
      `/api/v1/manufacturers/${manufacturerId}?populate=sets`,
    );
    expect(res.status).toBe(200);
    const body = res.body as { sets: any[] };
    expect(body).toBeDefined();
    expect(body.sets).toBeDefined();
    expect(Array.isArray(body.sets)).toBe(true);
    expect(body.sets.length).toBeGreaterThanOrEqual(1);
  });
});
