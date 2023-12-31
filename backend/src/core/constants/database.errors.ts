import { TypeOrmConfigService } from '../config/database.config'

export const dbConfig = new TypeOrmConfigService().createTypeOrmOptions()

export const CONSTRAINS =
  dbConfig.type === 'sqlite'
    ? {
      UNIQUE_VIOLATION: 'SQLITE_CONSTRAINT'
    }
    : {
      UNIQUE_VIOLATION: '23505'
    }
