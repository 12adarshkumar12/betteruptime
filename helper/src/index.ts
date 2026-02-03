import { client , addConsumer} from '../../packages/redis/redis-client/src'
import { newClient } from '../../packages/db/src'
import { type RedisArgument } from 'redis'

const DB_STREAM_KEY = process.env["DB_STREAM_KEY"] as RedisArgument
if (!DB_STREAM_KEY) throw new Error("DB_STREAM_KEY not found")

async function addDataToWebsiteTickDB() {
    const res = await client.xRead({
        key: DB_STREAM_KEY,
        id: '>'
    }, {
        COUNT: 100,
        BLOCK: 300
    });
    console.log(res)
    // @ts-ignore
    const tickList = res[0].messages.map(({id, message}) => {message})
    
    try {
        await newClient.websiteTicks.createMany({
            data : tickList
        })
    } catch(err) {
        console.log(err)
    }
}

setInterval(() => {
    addDataToWebsiteTickDB()
}, 3 * 60 * 1000)



