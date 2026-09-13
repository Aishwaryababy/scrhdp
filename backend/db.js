const { Pool } = require("pg");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();


// ---------------------------
// PostgreSQL Connection
// ---------------------------

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    };

const pool = new Pool(poolConfig);

const isSupabaseDb = Boolean(process.env.DATABASE_URL);

pool.query("SELECT 1")
    .then(() => {
        if (isSupabaseDb) {
            console.log("--> Connected to Supabase PostgreSQL Database");
        } else {
            console.log("--> Connected to Local PostgreSQL Database");
        }
    })
    .catch((err) => {
        const target = isSupabaseDb ? "Supabase PostgreSQL" : "Local PostgreSQL";
        console.error(`--> ${target} Connection Error:`, err.message);
    });

// ---------------------------
// Supabase Client for Storage
// ---------------------------

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log(`--> Connected to Supabase Storage Bucket (${process.env.SUPABASE_BUCKET || "uploads"})`);
    } catch (err) {
        console.error("--> Supabase Storage Error:", err.message);
    }
} else {
    console.log("--> Supabase Storage Key not set (Using Local File Storage Fallback)");
}

module.exports = {
    pool,
    supabase
};