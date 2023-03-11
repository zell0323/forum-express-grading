const express = require('express')
const router = express.Router()

// 新增，載入 controller

const restController = require('../controllers/restaurant-controller')
const admin = require('./modules/admin') // 新增這行，載入 admin.js
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middleware/error-handler') // 加入這行
const passport = require('../config/passport')
const { authenticated, authenticatedAdmin } = require('../middleware/auth')

router.use('/admin', authenticatedAdmin, admin) // 新增這行
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp) // 注意用 post
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn) // 注意是 post
router.get('/logout', userController.logout)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants', authenticated, restController.getRestaurants)


router.use('/', (req, res) => res.redirect('/restaurants'))
router.use('/', generalErrorHandler) // 加入這行
module.exports = router
