const router = require('express').Router()
const { User } = require('../db/models')
const { Review } = require('../db/models')
const { isAdmin } = require('../utils')

module.exports = router

router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll()
    res.json(users)
  } catch (err) {
    next(err)
  }
})

router.get('/:userId', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
    res.json(user)
  } catch (err) {
    next(err)
  }
})

router.put('/:userId', isAdmin, async (req, res, next) => {
  try {
    const { data: user } = await User.update(
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        password: req.body.password
      },
      {
        where: { id: req.params.userId },
        returning: true,
        plain: true
      }
    )
    res.json(user)
  } catch (err) {
    next(err)
  }
})

router.delete('/:userId', isAdmin, async (req, res, next) => {
  const userId = +req.params.userId
  try {
    await User.destroy({ where: { id: userId } })
    res.json(userId)
  } catch (err) {
    next(err)
  }
})
