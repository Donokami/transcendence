import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { SocketIoAdapter } from '@/core/websockets/auth-adapter'
import * as express from 'express'
import * as fs from 'fs/promises'
import { AppService } from './app.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)

  app.enableShutdownHooks()

  app.enableCors({
    allowedHeaders: ['content-type'],
    origin: configService.get('FRONTEND_URL'),
    credentials: true
  })

  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ limit: '10mb', extended: true }))

  app.useWebSocketAdapter(new SocketIoAdapter(app, configService))

  app.setGlobalPrefix('api')

  const config = new DocumentBuilder()
    .setTitle('Transcendence API')
    .setDescription('Transcendence API description')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  const dir = './uploads'
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }

  app.get(AppService).subscribeToShutdown(() => app.close())

  await app.listen(configService.get('PORT'))
}
bootstrap()
