import 'dotenv/config'
import { get } from "env-var";


export const envs = {
    PORT: get('PORT').required().asPortNumber(),
    DB_HOST: get('DB_HOST').required().asString(),
    DB_PORT: get('DB_PORT').required().asPortNumber(),
    DB_USER: get('DB_USER').required().asString(),
    DB_NAME: get('DB_NAME').required().asString(),
    DB_PASSWORD: get('DB_PASSWORD').asString(),
    JWT_SEED: get('JWT_SEED').required().asString(),
    RESEND_API_KEY: get("RESEND_API_KEY").required().asString(),
    RESEND_FROM: get("RESEND_FROM").required().asString(),
    ADMIN_MAIL: get("ADMIN_MAIL").required().asString(),
}