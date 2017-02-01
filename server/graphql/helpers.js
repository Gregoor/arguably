const {PASSWORD} = process.env;

module.exports = {
  isAuthorized: (req) => PASSWORD && req.headers.authorization == PASSWORD
};