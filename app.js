const {exec} = require('child_process');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose;
const crypto = require('crypto');
const readline = require('readline');
const { log } = require('console');

// Función para verificar contraseña
function checkPassword(user) {
    const passwordToCheck = readline.question('Ingresa la contraseña: ');
    const isMatch = user.compare(passwordToCheck);
    if (isMatch ==passwordToCheck) {return true;
    } else {
        console.error("error")
    }
}


// Función para generar token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Función para guardar usuario y contraseña en la base de datos
function saveUser(username, password) {
    const dbPath = path.join(__dirname, 'user.db');
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log('Base de datos creada');

        db.run('CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT)', (err) => {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log('Tabla "users" creada');

            const hashedPassword = crypto.bcrypt.hashSync(password, 10);
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
                if (err) {
                    console.error(err.message);
                    return;
                }
                console.log('Usuario ingresado');
            });
        });
    });
}

// Función para validar inicio de sesión
function validateLogin(username, password) {
    const dbPath = path.join(__dirname, 'user.db');
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log('Base de datos creada');

        db.run('CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT)', (err) => {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log('Tabla "users" creada');

            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err || !row) {
                    console.error('Usuario o contraseña incorrectos');
                    return;
                }

                if (checkPassword(password, row.password)) {
                    console.log('Inicio de sesión exitoso');
                    const token = generateToken();
                    console.log('Token:', token);
                } else {
                    console.error('Usuario o contraseña incorrectos');
                }
            });
        });
    });
}

// Preguntar al usuario por los datos para guardar
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Inserta el usuario: ', (username) => {
    rl.question('Inserta la contraseña: ', (password) => {
       rl.close();

        // Validar contraseña
        if (checkPassword(password, password)) {
            console.error('Contraseña incorrecta');
            return;
        }

        // // Guardar datos en base de datos
        // saveUser(username, password);

        // // Iniciar sesión
        // const token = generateToken();
        // console.log('Confirma tu acceso con el token:', token);

        // rl.question('Ingresa el token para iniciar sesión: ', (inputToken) => {
        //     if (inputToken === token) {
        //         console.log('Sesión iniciada exitosamente');
        //     } else {
        //         console.error('Token incorrecto');
        //     }
        // });
    });
});