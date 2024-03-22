const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

// Función para verificar contraseña
function checkPassword(password, hash) {
  return crypto.bcrypt.compare(password, hash);
}

// Función para generar token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Función para guardar usuario y contraseña en la base de datos
function saveUser(username, password) {
  const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log('Base de datos creada');

    db.serialize(() => {
      db.run('CREATE TABLE users (username TEXT, password TEXT)', (err) => {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log('Tabla "users" creada');

        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log('Usuario ingresado');
        });
      });
    });
  });
}

// Función para validar inicio de sesión
function validateLogin(username, password) {
  const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log('Base de datos creada');

    db.serialize(() => {
      db.run('CREATE TABLE users (username TEXT, password TEXT)', (err) => {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log('Tabla "users" creada');

        db.run('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, result) => {
          if (err || result.length === 0) {
            console.error('Usuario o contraseña incorrectos');
            return;
          }
          console.log('Inicio de sesión exitoso');
          const token = generateToken();
          console.log('Token:', token);
        });
      });
    });
  });
}

// Ejecutar comando para borrar base de datos
exec('rm -f :memory:', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Base de datos borrada');
  }
});

// Preguntar al usuario por los datos para guardar
console.log('Inserta el usuario:');
const username = readline();
console.log('Inserta la contraseña:');
const password = readline();

// Validar contraseña
if (!checkPassword(password, password)) {
  console.error('Contraseña incorrecta');
  return;
}

// Guardar datos en base de datos
saveUser(username, password);

// Iniciar sesión
const timer = setTimeout(() => {
  console.log('El tiempo para confirmar el token ha expirado');
}, 30000);

console.log('Confirma tu acceso con el token:');
const token = readline();
clearTimeout(timer);

// Validar token
if (token !== generateToken()) {
  console.error('Token incorrecto');
} else {
  console.log('Sesión iniciada exitosamente');
}
