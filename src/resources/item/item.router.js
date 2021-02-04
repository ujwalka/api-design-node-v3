// Router needs controllers and (Router from express)

import { Router } from 'express'
import controllers from './item.controllers'

// Setting up router for item model [5]

const router = Router()

// /api/item
router
  .route('/')
  .get(controllers.getOne)
  .post(controllers.createOne)

// /api/item/:id
router
  .route('/:id')
  .get(controllers.getOne)
  .put(controllers.updateOne)
  .delete(controllers.removeOne)
// Router Exported as default >> server.js
export default router
