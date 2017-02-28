const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const SECRET_PATH = './SECRET';
if (!process.env.SECRET && !fs.existsSync(SECRET_PATH)) {
  fs.writeFileSync(SECRET_PATH, crypto.randomBytes(48).toString('hex'));
}

const SECRET = process.env.SECRET || fs.readFileSync(SECRET_PATH);

module.exports = {
  JSONError: (obj) => new Error(JSON.stringify(obj)),
  jwt: {
    sign: (payload) => jwt.sign(payload, SECRET, {expiresIn: '365 days'}),
    safeDecode: (token) => jwt.verify(token, SECRET) && jwt.decode(token)
  }
};