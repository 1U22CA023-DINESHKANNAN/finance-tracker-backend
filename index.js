const express = require("express")
const cors = require("cors")
const mysql = require("mysql")


const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"appDB"
})
const app = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.post("/register", (req, res) => {
    const { fname, sname, email, password } = req.body;

    // Check if email already exists
    const checkEmailQuery = "SELECT * FROM users WHERE EMAIL_ID = ?";
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.log("Error during email check:", err);
            res.status(500).send("Error during email check");
        } else if (results.length > 0) {
            res.send(["Email already exists", "error"]);
        } else {
            // If email doesn't exist, insert the new user
            const RegisterData = [fname, sname, email, password];
            const sql = `INSERT INTO users(FIRST_NAME, SECOND_NAME, EMAIL_ID, PASSWORD) VALUES(?)`;
            db.query(sql, [RegisterData], (err, register_result) => {
                if (err) {
                    console.log("Error during insertion:", err);
                    res.status(500).send("Error during registration");
                } else {
                    console.log("Inserted successfully");
                    res.status(200).send(["Inserted Successfully!", "success", register_result.insertId]);
                }
            });
        }
    });
});

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const sql = `SELECT ID,EMAIL_ID, PASSWORD FROM users WHERE EMAIL_ID = ? AND PASSWORD = ?`;
    db.query(sql, [email, password], (error, result) => {
        if (error) {
            console.log("error:", error);
            res.status(500).send("An error occurred");
        } else if (result.length > 0) {
            res.send({result:result,status:"success"});
        } else {
            res.status(401).send("Invalid email or password");
        }
    });
});

//get all data

app.post("/getAllData", (req, res) => {
    const getData_sql = `SELECT ID, FIRST_NAME FROM users WHERE ID = ?`;
    const id = req.body.id; // Access the specific 'id' property from req.body

    db.query(getData_sql, [id], (err, response) => {
        if (err) {
            res.send("error");
        } else {
            res.json(response);
        }
    });
});

app.get("/getAllTransactionData", (req, res) => {
    const sql = `SELECT TRANSACTION_ID,TRANSACTION_NAME, TRANSACTION_AMOUNT, TRANSACTION_TYPE, DATE FROM transaction_list WHERE USER_ID = ?`;
    
    db.query(sql, [req.query.id], (error, results) => {
        if (error) {
            console.error("Error executing query:", error);
            res.status(500).json({ error: "Database query error" });
            return;
        }
        res.json(results); // Send back the query results as a JSON response
    });
});
app.get("/getUpdateAllTransactionData", (req, res) => {
    const sql = `SELECT TRANSACTION_ID,TRANSACTION_NAME, TRANSACTION_AMOUNT, TRANSACTION_TYPE FROM transaction_list WHERE TRANSACTION_ID = ?`;
    
    db.query(sql, [req.query.id], (error, results) => {
        if (error) {
            console.error("Error executing query:", error);
            res.status(500).json({ error: "Database query error" });
            return;
        }
    });
});

app.post('/addTransaction', (req, res) => {
    const { name, amount, type, userId } = req.body;

    const query = 'INSERT INTO transaction_list (TRANSACTION_NAME, TRANSACTION_AMOUNT, TRANSACTION_TYPE, USER_ID) VALUES (?, ?, ?, ?)';
    
    db.query(query, [name, amount, type, userId], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send('Transaction added successfully.');
        }
    });
});

app.post("/update", (req, res) => {
    const { utid, utname, utamount, uttype } = req.body;
    const sql = `UPDATE transaction_list SET TRANSACTION_NAME = ?, TRANSACTION_AMOUNT = ?, TRANSACTION_TYPE = ? WHERE TRANSACTION_ID = ?`;
    
    db.query(sql, [utname, utamount, uttype, utid], (error, result) => {
        if (error) {
            console.log("Error during update:", error);
            res.status(500).send("Error during update");
        } else {
            res.status(200).send(result);
        }
    });
});

app.delete("/deleteTransaction", (req, res) => {
    const transactionId = req.body.id;
    const sql = "DELETE FROM transaction_list WHERE TRANSACTION_ID = ?";

    db.query(sql, [transactionId], (error, results) => {
        if (error) {
            console.error("Error executing query:", error);
            res.status(500).json({ error: "Database query error" });
            return;
        }
        res.json({ message: "Transaction deleted successfully" });
    });
});

app.listen(2000)