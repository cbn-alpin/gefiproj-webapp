const { report } = require("process");
const jwt = require('jsonwebtoken')

const primaryKeys = { // Nom des identifiants des entités
  "users": "id_u",
  "projects": "id_p",
  "funding": "id_f",
  "financeurs": "id_financeur",
  "receipts": "id_r",
  "amounts": "id_ma",
  "expenses": "id_d",
  "history": "id_h"
};

// Paramètres du Token
const SECRET_KEY = '123456789'
const expiresIn = '1h'

function createToken(payload) { // Création du Token JWT (cf. https://www.techiediaries.com/fake-api-jwt-json-server/)
  return jwt.sign(payload, SECRET_KEY, { expiresIn })
}

module.exports = (req, res, next) => { // Middleware chargé de renvoyer le Token en cas d'appel à /login (cf. https://github.com/typicode/json-server#add-middlewares)
  res.header('X-Debug', 'True'); // Identifie le mode Debug

  if (req.originalUrl === '/login' && req.method === 'POST') { // Renvoie un Token valide
    const { email, password } = req.body
    const access_token = createToken({ email, password })

    res.status(200).jsonp({
      "id": 1,
      "id_u": 1,
      "nom_u": "Azp",
      "prenom_u": "Manu",
      "email_u": "m.a@mail.com",
      "initiales_u": "ma",
      "active_u": true,
      "role": 2,
      "access_token": access_token
    })
  } else { // Gestion de l'identifiant
    const resource = req.path.split('/')[1];
    let id = req.body[primaryKeys[resource]] || req.body.id || null;
    req.body.id = id;
    req.body[primaryKeys[resource]] = id;

    next();
  }
}
