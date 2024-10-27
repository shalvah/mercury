import {Hono} from "hono";
import { bearerAuth } from 'hono/bearer-auth'
import { serve } from '@hono/node-server'
import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync('db.sqlite')
db.exec(`
CREATE TABLE IF NOT EXISTS readings (
    value REAL NOT NULL,
    created_at INTEGER NOT NULL
) STRICT
`)

const token = process.env.AUTH_TOKEN;

const app = new Hono();

app.get('/', (c) => c.text("Alright, you found me. Happy?"))

app.post(
  '/readings',
  bearerAuth({ token }),
  (c) => {
    const reading = c.req.query('r')
    const ts = c.req.query('ts')

    const insert = db.prepare('INSERT INTO readings (value, created_at) VALUES (?, ?)')
    const result = insert.run(reading, ts)

    return c.text(result.changes, 201)
})

serve({
  fetch: app.fetch,
  port: 8787,
});
