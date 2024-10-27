import {Hono} from "hono";
import { serve } from '@hono/node-server'

const auth = process.env.AUTH_TOKEN;

const app = new Hono();

app.get('/', (c) => c.text("Alright, you found me. Happy?"))

app.post(
  '/readings',
  (c) => {
    const token = c.req.query('t')
    if (token !== auth) {
      return c.text('', 401)
    }

    const reading = c.req.query('r')

    store(r)

    return c.text('', 201)
})

serve({
  fetch: app.fetch,
  port: 8787,
});
