// Exports signin, signup, verify token, protect
// Exporting verify token was not necessary, used only in this file. Or, is there any other reason to export the function?
import config from '../config'
import { User } from '../resources/user/user.model'
import jwt from 'jsonwebtoken'

// For auth without overhead, JWT is stateless: It creates a Bearer token for auth. No remembering using sessions or cookies- ref secret API and user as a payload
// More effective than stateful auths and less load on the server according to Scott Moss

// Create new token, pass user
export const newToken = user => {
  return jwt.sign({ id: user.id }, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp
  })
}

// Verify token, pass token
// $$ Have to read jwt documentation. Need to understand payload.

export const verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) return reject(err)
      resolve(payload)
    })
  })

// Creating a new user
export const signup = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: 'need email and password' })
  }

  try {
    // .create is a mongoose method.. Which means _id could have been created by default
    const user = await User.create(req.body)
    const token = newToken(user)
    return res.status(201).send({ token })
  } catch (e) {
    return res.status(500).end()
  }
}

// Signing in an existing user
export const signin = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: 'need email and password' })
  }

  const invalid = { message: 'Invalid email and passoword combination' }

  try {
    const user = await User.findOne({ email: req.body.email })
      .select('email password')
      .exec()

    if (!user) {
      return res.status(401).send(invalid)
    }

    const match = await user.checkPassword(req.body.password)

    if (!match) {
      return res.status(401).send(invalid)
    }

    const token = newToken(user)
    return res.status(201).send({ token })
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
}

// Protect layer between the data (API) and client
// Getting a token from req --> assigning req.user = user (found in the model crawling for payload.id)
// Middleware modifying the request

export const protect = async (req, res, next) => {
  // Get token from the req
  const bearer = req.headers.authorization

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).end()
  }
  // req.headers.authorization is always in this format: "Bearer  asldkfja;sldkjfa;lsdkjfa;sldkfj"
  // Modify token for verification
  const token = bearer.split('Bearer ')[1].trim()

  let payload

  try {
    // Token verified once -> Returns resolve(payload)
    payload = await verifyToken(token)
  } catch (e) {
    return res.status(401).end()
  }
  // Payload has an id?
  const user = await User.findById(payload.id)
    .select('-password')
    .lean()
    .exec()

  if (!user) {
    return res.status(401).end()
  }

  req.user = user
  next()
}
