const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

const db = new sqlite3.Database(__dirname + "/data.db", (error: any) => {
    if (error) {
        console.log("An error occured:\n" + error.message);
        throw error;
    } else {
        let dbScript = readFile(__dirname + "/db.sql");
        let insertsScript = readFile(__dirname + "/inserts.sql");

        // create database
        db.serialize(() => {
            dbScript.forEach(query => {
                query += ";"; // get back what .split() erased before
                query = query.replace("\n", "");
                if (query == ";") return;
    
                db.run(query, (error: any) => {
                    if (error)
                        throw error;
                });
            });
        });

        // populate database
        db.serialize(() => {
            insertsScript.forEach(query => {
                query += ";"; // get back what .split() erased before
                query = query.replace("\n", "");
                if (query == ";") return;
    
                db.run(query, (error: any) => {
                    if (error)
                        throw error;
                });
            });
        });
    }   
});



function readFile(fileName: string): string[] {
    let data: string = fs.readFileSync(fileName).toString();

    return data.split(";");
}



export default db;