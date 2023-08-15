import { registerAs } from '@nestjs/config'
import { z } from 'zod'
import { generateErrorMessage, type ErrorMessageOptions } from 'zod-error'
import { config } from 'dotenv'

config({
  path: __dirname + `/../../../envs/.env.${process.env.NODE_ENV || 'development'}`
})
export default registerAs('transcendence-config', () => {
  const values = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT),
    frontendUrl: process.env.FRONTEND_URL,

    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbUser: process.env.DB_USER,
    dbPass: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dbPath: process.env.DB_PATH,

    cookieSessionKey: process.env.COOKIE_SESSION_KEY,

    fortyTwoAppId: process.env.FORTYTWO_APP_ID,
    fortyTwoAppSecret: process.env.FORTYTWO_APP_SECRET,
    fortyTwoAppRedirectURI: process.env.FORTYTWO_APP_REDIRECT_URI,

    uploadDir: process.env.UPLOAD_DIR,

    socketPort: parseInt(process.env.SOCKET_PORT),
    socketOrigin: process.env.SOCKET_ORIGIN
  }

  const schema = z.object({
    nodeEnv: z.string(),
    port: z.number(),
    frontendUrl: z.string(),

    dbHost: process.env.NODE_ENV === 'production' ? z.string() : z.string().optional(),
    dbPort: process.env.NODE_ENV === 'production' ? z.string() : z.string().optional(),
    dbUser: process.env.NODE_ENV === 'production' ? z.string() : z.string().optional(),
    dbPass: process.env.NODE_ENV === 'production' ? z.string() : z.string().optional(),
    dbName: z.string(),
    dbPath: z.string().optional(),

    cookieSessionKey: z.string(),

    fortyTwoAppId: z.string(),
    fortyTwoAppSecret: z.string(),
    fortyTwoAppRedirectURI: z.string(),

    uploadDir: z.string(),

    socketPort: z.number(),
    socketOrigin: z.string()
  })

  const options: ErrorMessageOptions = {
    delimiter: {
      error: '\n'
    },
    transform: ({ errorMessage, index }) =>
      `Error #${index + 1}: ${errorMessage}`
  }

  try {
    schema.parse(values)
  } catch (err) {
    const errorMessage = generateErrorMessage(err.issues, options)
    console.error(errorMessage)
    process.exit(1)
  }

  return values
})
