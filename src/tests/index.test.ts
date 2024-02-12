import * as dotenv from 'dotenv';
import { server } from 'index';
import request from 'supertest';
import { BASEURL } from 'utils/urls';

dotenv.config({ path: `../.env` });

const newUser = {
  username: 'Maks',
  age: 20,
  hobbies: ['sport', 'films'],
};

describe('CRUD API tests', () => {
  afterAll(() => {
    server.close();
  });

  let userId: string;

  test('GET all users', async () => {
    const response = await request(server).get(BASEURL);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  test('POST new user', async () => {
    const response = await request(server).post(BASEURL).send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject(newUser);

    userId = response.body.data.id;
  });

  test('PUT update user', async () => {
    const response = await request(server)
      .put(`${BASEURL}${userId}`)
      .send({ username: 'Ivan' });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ ...newUser, username: 'Ivan' });

    userId = response.body.data.id;
  });
});
