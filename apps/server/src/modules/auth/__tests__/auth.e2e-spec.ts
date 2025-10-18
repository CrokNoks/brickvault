import type { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { disconnect } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';

describe('Auth e2e', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          process.env.MONGO_URI || 'mongodb://localhost:27017/brickvault_test',
        ),
        AppModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    await app.get('UserModel').deleteMany({});
  });

  afterAll(async () => {
    await app.close();
    await disconnect();
  });

  it('should register a user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', password: 'Password123!' });
    expect(res.status).toBe(201);
    const body = res.body as { user: { email: string } };
    expect(body.user.email).toBe('test@example.com');
  });

  it('should not register with weak password', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'weak@example.com', password: 'weakpass' });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      'Password must be at least 8 characters long',
    );
  });

  it('should register with a strong password', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'strong@example.com', password: 'Str0ng!Pass' });
    expect(res.status).toBe(201);
    const body = res.body as { user: { email: string } };
    expect(body.user.email).toBe('strong@example.com');
  });

  it('should not register with duplicate email', async () => {
    // On tente de créer deux fois le même utilisateur
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'dupe@example.com', password: 'Str0ng!Pass' });
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'dupe@example.com', password: 'Str0ng!Pass' });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('duplicate');
  });

  it('should login and return JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'Password123!' });
    expect(res.status).toBe(201);
    const body = res.body as { access_token: string };
    expect(body.access_token).toBeDefined();
    token = body.access_token;
  });

  it('should not login with wrong password', async () => {
    // On crée un utilisateur valide
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'wrongpass@example.com', password: 'Str0ng!Pass' });
    // On tente de se connecter avec un mauvais mot de passe
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'wrongpass@example.com', password: 'badpassword1!' });
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid credentials');
  });

  it('should get current user with JWT', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as { email: string };
    expect(body.email).toBe('test@example.com');
  });
});
