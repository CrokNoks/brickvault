import type { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import type { Manufacturer } from '../../../common/entities/manufacturer.type';
import type { Set } from '../../../common/entities/set.type';

describe('Sets Endpoints (e2e)', () => {
  let app: INestApplication;
  let setsModel: Model<Set>;
  let manufacturerModel: Model<Manufacturer>;
  let token: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          process.env.MONGO_URL || 'mongodb://localhost/test-db-sets',
        ),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    setsModel = moduleFixture.get('SetModel');
    manufacturerModel = moduleFixture.get('ManufacturerModel');

    moduleFixture.get('UserModel').deleteMany({});

    // Création utilisateur partagé
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'test@e2e.com', password: 'Str0ng!Pass' });
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@e2e.com', password: 'Str0ng!Pass' });
    token = loginRes.body.access_token;
  });

  beforeEach(async () => {
    // Purge la collection Set et Manufacturer avant chaque test
    await setsModel.deleteMany({});
    await manufacturerModel.deleteMany({});
  });

  it('/api/v1/sets (GET) - liste vide', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/sets')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body;
    expect(body.items).toBeDefined();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items).toHaveLength(0);
  });

  it('/api/v1/sets (POST) - création avec manufacturer', async () => {
    // Crée un fabricant
    const manufacturerRes = await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cobi', country: 'Pologne', website: 'https://cobi.pl' });
    expect(manufacturerRes.status).toBe(201);
    const manufacturerBody = manufacturerRes.body as { _id: string };
    expect(manufacturerBody._id).toBeDefined();
    const manufacturerId = manufacturerBody._id;

    // Crée un set lié à ce fabricant
    const newSet = {
      _id: new Types.ObjectId().toHexString(),
      name: 'Cobi Tank',
      manufacturer_reference: 'COBI-1234',
      theme: 'Military',
      year: 2022,
      piece_count: 800,
      manufacturer: manufacturerId,
    };
    const setRes = await request(app.getHttpServer())
      .post('/api/v1/sets')
      .set('Authorization', `Bearer ${token}`)
      .send(newSet);
    expect(setRes.status).toBe(201);
    const setBody = setRes.body as {
      _id: string;
      name: string;
      manufacturer: { _id: string; name: string };
    };
    expect(setBody._id).toBeDefined();
    expect(setBody.name).toBe('Cobi Tank');
    expect(setBody.manufacturer).toBeDefined();
    expect(setBody.manufacturer._id).toBe(manufacturerId);
    expect(setBody.manufacturer.name).toBe('Cobi');
  });

  it('/api/v1/sets (POST) - unicité manufacturer/manufacturer_reference', async () => {
    // Crée un fabricant
    const manufacturerRes = await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Mega', country: 'Canada', website: 'https://mega.com' });
    expect(manufacturerRes.status).toBe(201);
    const manufacturerBody = manufacturerRes.body as { _id: string };
    expect(manufacturerBody._id).toBeDefined();
    const manufacturerId = manufacturerBody._id;

    // Crée un set avec une référence
    const setData = {
      name: 'Mega Jet',
      manufacturer_reference: 'MEGA-999',
      theme: 'Aviation',
      year: 2023,
      piece_count: 500,
      manufacturer: manufacturerId,
    };
    const setRes1 = await request(app.getHttpServer())
      .post('/api/v1/sets')
      .set('Authorization', `Bearer ${token}`)
      .send(setData);
    expect(setRes1.status).toBe(201);

    // Tente de créer un set avec la même référence pour le même fabricant
    const setRes2 = await request(app.getHttpServer())
      .post('/api/v1/sets')
      .set('Authorization', `Bearer ${token}`)
      .send(setData);
    expect(setRes2.status).toBe(400);
    const body = setRes2.body as { message: string };
    expect(body).toBeDefined();
    expect(body.message).toMatch(/already exists/i);
  });

  it('/api/v1/sets (GET) - filtre par thème', async () => {
    // Crée un fabricant
    const manufacturerRes = await request(app.getHttpServer())
      .post('/api/v1/manufacturers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Lego', country: 'Danemark', website: 'https://lego.com' });
    expect(manufacturerRes.status).toBe(201);
    const manufacturerBody = manufacturerRes.body as { _id: string };
    expect(manufacturerBody._id).toBeDefined();
    const manufacturerId = manufacturerBody._id;

    // Crée un set avec le thème à tester
    const setRes = await request(app.getHttpServer())
      .post('/api/v1/sets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Millennium Falcon',
        manufacturer_reference: 'SW-0001',
        theme: 'Star Wars',
        year: 2020,
        piece_count: 7541,
        manufacturer: manufacturerId,
      });
    expect(setRes.status).toBe(201);

    // Test du filtre
    const res = await request(app.getHttpServer())
      .get('/api/v1/sets?theme=Star Wars')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { items: { theme: string }[] };
    expect(body.items[0].theme).toBe('Star Wars');
  });

  it('/api/v1/sets (GET) - pagination', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/sets?page=1&limit=1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body;
    expect(body.items.length).toBeLessThanOrEqual(1);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(1);
  });

  it('/api/v1/sets (GET) - tri par année', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/sets?sort=year')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body;
    expect(body.items).toBeDefined();
    // Vérifie que le tri est correct si plusieurs sets
  });

  it('/api/v1/sets/:id (GET) - récupération', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/sets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'X-Wing',
        theme: 'Star Wars',
        year: 2019,
        piece_count: 731,
        manufacturer: '60d5ec49f47acb001f647f3b', // Remplace par un ID de fabricant valide
        manufacturer_reference: 'SW-1234',
      });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .get(`/api/v1/sets/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { name: string };
    expect(body.name).toBe('X-Wing');
  });

  it('/api/v1/sets/:id (PUT) - mise à jour', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/sets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'TIE Fighter',
        theme: 'Star Wars',
        year: 2018,
        piece_count: 519,
        manufacturer: '60d5ec49f47acb001f647f3b', // Remplace par un ID de fabricant valide
        manufacturer_reference: 'SW-5678',
      });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .put(`/api/v1/sets/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'TIE Fighter Updated',
        theme: 'Star Wars',
        year: 2018,
        piece_count: 519,
        manufacturer: '60d5ec49f47acb001f647f3b', // Remplace par un ID de fabricant valide
        manufacturer_reference: 'SW-5678',
      });
    expect(res.status).toBe(200);
    const body = res.body as { name: string };
    expect(body.name).toBe('TIE Fighter Updated');
  });

  it('/api/v1/sets/:id (DELETE) - suppression', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/sets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Slave I',
        theme: 'Star Wars',
        year: 2017,
        piece_count: 1996,
        manufacturer: '60d5ec49f47acb001f647f3b', // Remplace par un ID de fabricant valide
        manufacturer_reference: 'SW-9012',
      });
    const createBody = createRes.body as { _id: string };
    const id = createBody._id;
    const res = await request(app.getHttpServer())
      .delete(`/api/v1/sets/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { _id: string };
    expect(body._id).toBe(id);
  });

  // Ajoute ici des tests CRUD, filtres, pagination, sort

  afterAll(async () => {
    await app.close();
  });
});
