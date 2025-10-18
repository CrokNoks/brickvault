import type { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { disconnect } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';

describe('UserSet e2e', () => {
  let app: INestApplication;
  let server: any;
  let token: string;
  let setId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          process.env.MONGO_URL || 'mongodb://localhost/test-db-userset',
        ),
        AppModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();

    // Clean DB

    await moduleFixture.get('SetModel').deleteMany({});
    await moduleFixture.get('ManufacturerModel').deleteMany({});
    await moduleFixture.get('UserSetModel').deleteMany({});
    await moduleFixture.get('UserModel').deleteMany({});

    // Register and login user
    await request(server)
      .post('/api/v1/auth/register')
      .send({ email: 'user@set.com', password: 'Str0ng!Pass' });
    const loginRes = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: 'user@set.com', password: 'Str0ng!Pass' });
    token = loginRes.body.access_token;

    // Create a manufacturer
    const manuRes = await request(server)
      .post('/api/v1/manufacturers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Manufacturer',
        country: 'Testland',
        website: 'https://test.com',
      });
    const manufacturerId = manuRes.body._id;
    // Create a set (simulate, replace with real endpoint if exists)
    const setRes = await request(server)
      .post('/api/v1/sets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Set',
        number: '12345',
        manufacturer: manufacturerId,
        manufacturer_reference: 'REF12345',
      });
    setId = setRes.body._id;
  });

  afterAll(async () => {
    await app.close();
    await disconnect();
  });

  it('should assign a set to user and retrieve it', async () => {
    const assignRes = await request(server)
      .post('/api/v1/user-sets')
      .set('Authorization', `Bearer ${token}`)
      .send({ setRef: setId });
    expect(assignRes.status).toBe(201);
    const body = assignRes.body;
    expect(body.setRef).toBe(setId);

    const getRes = await request(server)
      .get('/api/v1/user-sets')
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.length).toBeGreaterThan(0);
    expect(getRes.body[0].setRef._id).toBe(setId);
  });

  it('should remove a set from user', async () => {
    const delRes = await request(server)
      .delete(`/api/v1/user-sets/${setId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.deletedCount).toBe(1);
  });
});
