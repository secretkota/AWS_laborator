const express = require('express')
const mysql = require('mysql2/promise')
const app = express()
app.use(express.json())

const masterDB = mysql.createPool({
    host: 'project-rds-mysql-prod.c98eqiq806hf.eu-north-1.rds.amazonaws.com',
    user: 'admin',
    password: '12345678gg',
    database: 'project_db'
})


const replicaDB = mysql.createPool({
    host: 'project-rds-mysql-read-replica.c98eqiq806hf.eu-north-1.rds.amazonaws.com',
    user: 'admin',
    password: '1234578gg',
    database: 'project_db'
})


app.post('/todos', async (req, res) => {
    const { title, status, category_id } = req.body;

    try {
        const [result] = await masterDB.query(
            `INSERT INTO todos (title, status, category_id) VALUES (?, ?, ?)`,
            [title, status, category_id]
        );
        res.json({ message: "Todo created", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
})


app.get('/todos', async (req, res) => {
    try {
        const [rows] = await replicaDB.query(`SELECT * FROM todos`);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
})


app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { title, status, category_id } = req.body;

    try {
        await masterDB.query(
            `UPDATE todos SET title = ?, status = ?, category_id = ? WHERE id = ?`,
            [title, status, category_id, id]
        );
        res.json({ message: "Todo updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})


app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await masterDB.query(`DELETE FROM todos WHERE id = ?`, [id]);
        res.json({ message: "Todo deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(3000, '0.0.0.0', () => {
    console.log('App running on port 3000')
})

