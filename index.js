const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
app.use(cors());
app.use(express.json()); 

app.get('/cars', (req, res) => {
    const query = 'SELECT * FROM CAR';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results); 
    });
});

app.get('/cars-with-options', (req, res) => {
    const query = `
        SELECT c.SerialNo, c.Brand, c.Model, c.Price, GROUP_CONCAT(o.OptionName) AS Options
        FROM CAR c
        JOIN OPTIONS o ON c.SerialNo = o.SerialNo
        WHERE o.OptionName IN ('Air Bag', 'CD Player')
        GROUP BY c.SerialNo, c.Brand, c.Model, c.Price
        HAVING COUNT(DISTINCT o.OptionName) = 2;
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Database query error' });
        } else {
            res.json(results);
        }
    });
});

app.get('/salesperson-cars-sold', (req, res) => {
    const query = `
        SELECT sp.Name, COUNT(s.SerialNo) AS CarsSold
        FROM SALES s
        JOIN SALESPERSON sp ON s.SalesPersonID = sp.SalesPersonID
        WHERE s.Month = 8 AND s.Year = 2544
        GROUP BY sp.Name
        HAVING COUNT(s.SerialNo) >= 2;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Database query error' });
            return;
        }
        res.json(results); 
    });
});

app.get('/monthly-sales', (req, res) => {
    const query = `
        SELECT s.Month, s.Year, COUNT(s.SerialNo) AS CarsSold, SUM(s.Price) AS TotalSales
        FROM SALES s
        GROUP BY s.Month, s.Year
        ORDER BY CarsSold DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Database query error' });
            return;
        }
        res.json(results); 
    });
});

app.get('/all', (req, res) => {
    const query = `
        SELECT 
            c.SerialNo, 
            c.Brand, 
            c.Model, 
            c.Price AS CarPrice,
            IFNULL(SUM(o.Price), 0) AS OptionsTotalPrice,
            c.Price + IFNULL(SUM(o.Price), 0) AS TotalPrice
        FROM 
            CAR c
        LEFT JOIN 
            OPTIONS o ON c.SerialNo = o.SerialNo
        GROUP BY 
            c.SerialNo, c.Brand, c.Model, c.Price;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Database query error' });
            return;
        }
        res.json(results); 
    });
});

// เปิดให้บริการ API บนพอร์ต 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
