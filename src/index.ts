import express from 'express';
import lcg from 'tiny-rng';
import { Cardiomon } from './classes/cardiomon';
const app = express();
app.use(express.json());
const port = 3000
const rng = new lcg(0, Math.floor(Date.now() / 1000));

app.post('/newmon', (req, res) => {
    const new_seed = rng.random(1, 10000);
    const mon = new Cardiomon(new_seed, 1);
    const jsonMon = mon.to_json();
    res.send(JSON.stringify(jsonMon));
});

app.post('/levelup', (req, res) => {
    const b = req.body;
    const seed = parseInt(b.seed);
    const level = parseInt(b.level);
    const mon = new Cardiomon(seed, level);
    const jsonMon = mon.to_json();
    res.send(JSON.stringify(jsonMon));
});

app.listen(port, () => {
    console.log(`Cardiomon server listening at http://localhost:${port}`)
});