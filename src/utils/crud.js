// item.model >> Creating Generic CRUD controllers for all the models [3]
// Closures, the async fn has access to the model

export const getOne = model => async (req, res) => {
  try {
    // Crawling the model for one item, _id created by mongoose?
    // exec() is sort of like a return for the promise created for the model data
    // lean() converts the data to json, or trims spaces?? not sure..
    const doc = await model
      .findOne({ createdBy: req.user._id, _id: req.params.id })
      .lean()
      .exec()

    if (!doc) {
      return res.status(400).end()
    }
    // Retrives and responds with a status 200 and '{ data: doc }' avoids namespace issues
    // Returned as a json to pass the test, can be passed directly as 'doc'
    // Status is 200 by defualt for good responses, explicitly setting status for tests
    // The status codes have no consequence in dev env, however they help browser handle responses effectively

    res.status(200).json({ data: doc })
  } catch (e) {
    console.error(e)
    // end() or send() is mandatory to end the response
    res.status(400).end()
  }
}

export const getMany = model => async (req, res) => {
  try {
    const docs = await model
      .find({ createdBy: req.user._id })
      .lean()
      .exec()

    res.status(200).json({ data: docs })
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

export const createOne = model => async (req, res) => {
  // user._id auto-created by mongoDB
  const createdBy = req.user._id
  try {
    const doc = await model.create({ ...req.body, createdBy })
    res.status(201).json({ data: doc })
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

export const updateOne = model => async (req, res) => {
  try {
    const updatedDoc = await model
      .findOneAndUpdate(
        {
          createdBy: req.user._id,
          _id: req.params.id
        },
        req.body,
        // ***********Does not update the object without new:true***********
        { new: true }
      )
      .lean()
      .exec()

    if (!updatedDoc) {
      return res.status(400).end()
    }

    res.status(200).json({ data: updatedDoc })
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

export const removeOne = model => async (req, res) => {
  try {
    const removed = await model.findOneAndRemove({
      createdBy: req.user._id,
      _id: req.params.id
    })

    if (!removed) {
      return res.status(400).end()
    }

    return res.status(200).json({ data: removed })
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

// Exporting Generic CRUD controllers [4] >> respective routers

export const crudControllers = model => ({
  removeOne: removeOne(model),
  updateOne: updateOne(model),
  getMany: getMany(model),
  getOne: getOne(model),
  createOne: createOne(model)
})
