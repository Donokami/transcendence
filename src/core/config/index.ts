import { registerAs } from '@nestjs/config';
import { z } from 'zod';
import { generateErrorMessage, type ErrorMessageOptions } from 'zod-error';
import 'dotenv/config';

export default registerAs('transcendence-config', () => {
  const values = {
    nodeEnv: process.env.NODE_ENV,
    port: parseInt(process.env.PORT),
    frontendUrl: process.env.FRONTEND_URL,

    dbHost: process.env.DB_HOST,
    dbPort: parseInt(process.env.DB_PORT),
    dbUser: process.env.DB_USER,
    dbPass: process.env.DB_PASSWORD,

    cookieSessionKey: process.env.COOKIE_SESSION_KEY,

    socketPort: parseInt(process.env.SOCKET_PORT),
    socketOrigin: process.env.SOCKET_ORIGIN,
  };

  const schema = z.object({
    nodeEnv: z.string(),
    port: z.number(),
    frontendUrl: z.string(),

    dbHost: z.string(),
    dbPort: z.number(),
    dbUser: z.string(),
    dbPass: z.string(),

    cookieSessionKey: z.string(),

    socketPort: z.number(),
    socketOrigin: z.string(),
  });

  const options: ErrorMessageOptions = {
    delimiter: {
      error: '\n',
    },
    transform: ({ errorMessage, index }) =>
      `Error #${index + 1}: ${errorMessage}`,
  };

  try {
    schema.parse(values);
  } catch (err) {
    const errorMessage = generateErrorMessage(err.issues, options);
    console.error(errorMessage);
    process.exit(1);
  }

  return values;
});
