import {Hono} from "hono";

const app = new Hono();

app.get('/', (c) => c.text("Alright, you found me. Happy?"))

app.post('/readings', (c) => {

})

export default app;
