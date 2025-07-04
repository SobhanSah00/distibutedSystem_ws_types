import { createClient } from "redis"

export const pub = createClient()
export const sub = createClient()

async function startRedis() {
    await pub.connect()
    await sub.connect()

    console.log("Redis PUB/SUB Connected");

}
startRedis()
export { startRedis }