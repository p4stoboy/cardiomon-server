import express from 'express';
import lcg from 'tiny-rng';
import db from 'better-sqlite3';
import {Cardiomon, JSONMon} from './cardiomon';

const sql = new db('cardiomon.db');
const app = express();
app.use(express.json());

const port = 3000

const rng = new lcg(0, Math.floor(Date.now() / 1000));

sql.prepare(`CREATE TABLE IF NOT EXISTS cardiomon(id INTEGER PRIMARY KEY NOT NULL, device_id TEXT NOT NULL, 
                     seed INTEGER NOT NULL, level INTEGER NOT NULL DEFAULT 1)`).run();

const random_mon = (device_id: string): JSONMon => {
    const new_seed = rng.random(1, 10000);
    sql.prepare(`INSERT INTO cardiomon(device_id, seed) VALUES(?, ?)`).run(device_id, new_seed);
    const mon = new Cardiomon(new_seed, 1);
    return mon.to_json();
}

// new mon level 1
app.post('/newmon', (req, res) => {
    console.log(`device: ${req.body.device_id} got a new mon.`);
    res.send(JSON.stringify(random_mon(req.body.device_id)));
});

// return levelled up mon
app.post('/levelup', (req, res) => {
    const b = req.body;
    console.log(`device: ${b.device_id} levelled up.`);
    const seed = parseInt(b.seed);
    const level = parseInt(b.level);
    sql.prepare(`UPDATE cardiomon SET level = level + 1 WHERE device_id = ? AND seed = ? AND level = ?`).run(b.device_id, seed, level);
    const jsonMon = new Cardiomon(seed, level + 1).to_json();
    res.send(JSON.stringify(jsonMon));
});

// reload mon if device shuts off
app.post('/reload', (req, res) => {
    console.log(`device: ${req.body.device_id} is reloading their mon.`);
    const current_mon = sql.prepare(`SELECT * FROM cardiomon WHERE device_id = ? AND level < 5`).get(req.body.device_id);
    if (current_mon) {
        const jsonMon = new Cardiomon(current_mon.seed, current_mon.level).to_json();
        res.send(JSON.stringify(jsonMon));
    } else {
        res.send(JSON.stringify(random_mon(req.body.device_id)));
    }

});

app.listen(port, () => {
    console.log(`Cardiomon server listening at http://localhost:${port}`)
});