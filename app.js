import {Hono} from "hono"
import {bearerAuth} from 'hono/bearer-auth'
import {basicAuth} from 'hono/basic-auth'
import {serve} from '@hono/node-server'
import {DatabaseSync} from "node:sqlite"

const token = process.env.MERCURY_AUTH_TOKEN
const username = process.env.MERCURY_USERNAME
const password = process.env.MERCURY_PASSWORD

if (!token || !username || !password) {
  throw new Error(`Env vars MERCURY_AUTH_TOKEN, MERCURY_USERNAME, MERCURY_PASSWORD are required.`)
}

const db = new DatabaseSync('db.sqlite')
db.exec(`
    CREATE TABLE IF NOT EXISTS readings
    (
        value      REAL    NOT NULL,
        created_at INTEGER NOT NULL
    ) STRICT
`)

const app = new Hono();

app.get('/', (c) => c.text("Alright, you found me. Happy?"))

app.post(
  '/readings',
  bearerAuth({token}),
  (c) => {
    const reading = c.req.query('r')
    const ts = c.req.query('ts')

    const insert = db.prepare('INSERT INTO readings (value, created_at) VALUES (?, ?)')
    const result = insert.run(reading, ts)

    return c.text(result.changes, 201)
  })

app.get(
  '/chart',
  basicAuth({username, password}),
  (c) => {
    const query = db.prepare(`SELECT *
                              FROM readings`);
    const readings = query.all();

    const html = `
      <div><canvas id="myChart"></canvas></div>

      <script src="https://cdn.jsdelivr.net/npm/chart.js@^3"></script>
      <script src="https://cdn.jsdelivr.net/npm/luxon@^2"></script>
      <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon@^1"></script>
      
      <script>
        const ctx = document.getElementById('myChart');
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ${JSON.stringify(readings.map(r => r.created_at * 1000))},
            datasets: [{
              label: "Temperature",
              data: ${JSON.stringify(readings.map(r => r.value))},
              borderColor: 'rgb(75, 192, 192)',
            }],
          },
          options: {
            scales: {
              x: {
                type: 'timeseries',
                time: {
                    unit: 'second',
                }
              }
            }
          }
        });
      </script>
    `;

    return c.html(html);
  }
)

serve({
  fetch: app.fetch,
  port: 8787,
});
