const { report } = require("process");
const jwt = require('jsonwebtoken')

// Paramètres du Token
const SECRET_KEY = '123456789'
const expiresIn = '1h'

function createToken(payload) { // Création du Token JWT (cf. https://www.techiediaries.com/fake-api-jwt-json-server/)
  return jwt.sign(payload, SECRET_KEY, { expiresIn })
}

module.exports = (req, res, next) => { // Middleware chargé de renvoyer le Token en cas d'appel à /login (cf. https://github.com/typicode/json-server#add-middlewares)
  res.header('X-Debug', 'True')

  if (req.originalUrl === '/login' || req.method === 'POST') { // Renvoie un Token valide
    const { email, password } = req.body
    const access_token = createToken({ email, password })

    res.status(200).jsonp({
      "id": 1,
      "nom": "azp",
      "prenom": "manu",
      "mail": "manu.azp@sncf.fr",
      "initiales": "ma",
      "access_token": access_token
    })
  }
  else
    next()
}