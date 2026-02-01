import { newClient } from '../../packages/db/src/index'
import { createClient, type RedisArgument } from 'redis'

const client = createClient();
client.on('error', function(error){
    console.log("Redis client error: ")
    console.log(error)
})

await client.connect()

const BATCH_SIZE = 1000
const STREAM_KEY = process.env["STREAM_KEY"] as RedisArgument
if (!STREAM_KEY) throw new Error("STREAM_KEY not set")


async function loadWebsites(){
    try {
        const websites = await newClient.website.findMany({
            select: {
                url: true
            }
        })
        return websites
    } catch(err) {
        console.log({
            err,
            message: "Error while loading website Retrying"
        })
        return []
    }
}

async function bulkAddDataToStream() {
    try {
        const entriesToAdd = await loadWebsites()
        if (!entriesToAdd.length) return 

        for (let i = 0; i < entriesToAdd.length; i += BATCH_SIZE) {
            const batch: { url: string}[] = entriesToAdd.slice(i, i + BATCH_SIZE);
            const pipeline = client.multi();

            batch.forEach(entry=> {
                pipeline.xAdd(STREAM_KEY, '*', entry)
            })
            await pipeline.exec()
        }
    } catch (error) {
        console.log('An error occurred during Redis operation:', error)
    }
}

setInterval(async () => {
    await client.xTrim(STREAM_KEY, 'MAXLEN', 0)
    await client.xGroupSetId(STREAM_KEY, 'workers', '0-0')
    await bulkAddDataToStream()
}, 3 * 60 * 1000)