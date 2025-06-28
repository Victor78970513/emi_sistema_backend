import {Pool} from 'pg';
import { envs } from '../../config';

export const pool = new Pool({
    user: envs.DB_USER,
    host: envs.DB_HOST,
    database: envs.DB_NAME,
    password: envs.DB_PASSWORD,
    port: envs.DB_PORT,
})

pool.on('connect', () => {
    console.log('✅ Conexión a base de datos establecida correctamente');
});

pool.on('error', (err) =>{
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
})