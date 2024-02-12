import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { v4 as uuid, validate } from 'uuid';
import * as dotenv from 'dotenv';
import { User } from 'types/user-type';
import { BASEURL, BASEURL_REGEX, URL_REGEX } from './utils/urls';
import { hasAllFields } from './utils/helpers';

dotenv.config({ path: `../.env` });

export let users: User[] = [];

export const server = createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    const { url, method } = req;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Content-Type', 'application/json');

    if (URL_REGEX.test(url as string)) {
      const isOnlyBaseProvided = BASEURL_REGEX.test(url as string);

      switch (method) {
        case 'GET':
          if (isOnlyBaseProvided) {
            res.statusCode = 200;
            res.end(JSON.stringify({ data: users }));
            return;
          }

          const userId = url?.replace(BASEURL, '');
          if (validate(userId as string)) {
            const user = users.find((user) => user.id === userId);
            res.statusCode = user ? 200 : 404;
            res.end(
              JSON.stringify(
                user ? { data: user } : { message: "User doesn't exist" },
              ),
            );
            return;
          }

          res.statusCode = 400;
          res.end(JSON.stringify({ message: 'Invalid user id' }));
          break;
        case 'POST':
          if (isOnlyBaseProvided) {
            let requestBody = '';

            req.on('data', (chunk) => {
              requestBody += chunk.toString();
            });

            req.on('end', () => {
              let parsedBody;
              try {
                parsedBody = JSON.parse(requestBody);
                if (hasAllFields(parsedBody)) {
                  const newUser = { id: uuid(), ...parsedBody };
                  users.push(newUser);
                  res.statusCode = 201;
                  res.end(JSON.stringify({ data: newUser }));
                } else {
                  res.statusCode = 400;
                  res.end(
                    JSON.stringify({
                      message: 'Request body does not contain required fields',
                    }),
                  );
                }
              } catch (error) {
                console.error('Error parsing JSON:', error);
                res.statusCode = 400;
                res.end(JSON.stringify({ message: 'Invalid JSON' }));
                return;
              }
            });
          }
          break;
        case 'PUT':
          if (isOnlyBaseProvided) {
            res.statusCode = 400;
            res.end(JSON.stringify({ message: 'Invalid user id' }));
          }

          const id = url?.replace(BASEURL, '');
          const userIndex = users.findIndex((user) => user.id === id);

          if (userIndex !== -1) {
            let requestBody = '';

            req.on('data', (chunk) => {
              requestBody += chunk.toString();
            });

            req.on('end', () => {
              let parsedBody;
              try {
                parsedBody = JSON.parse(requestBody);
                users[userIndex] = { ...users[userIndex], ...parsedBody };
                res.statusCode = 200;
                res.end(JSON.stringify({ data: users[userIndex] }));
              } catch (error) {
                console.error('Error parsing JSON:', error);
                res.statusCode = 400;
                res.end('Invalid JSON');
                return;
              }
            });
          }
          break;
        case 'DELETE':
          if (isOnlyBaseProvided) {
            res.statusCode = 400;
            res.end(JSON.stringify({ message: 'Invalid user id' }));
            return;
          }
          const iD = url?.replace(BASEURL, '');
          if (iD) {
            const userIndex = users.findIndex((user) => user.id === iD);
            if (userIndex !== -1) {
              users = users.filter((user) => user.id !== iD);
              res.statusCode = 204;
              res.end(JSON.stringify({ message: 'User deleted' }));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ message: "User doesn't exist" }));
            }
          }
          break;
      }
    } else {
      res.statusCode = 404;
      res.end(
        JSON.stringify({ message: 'Requests to non-existing endpoints' }),
      );
    }
  },
);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
