const { Restaurant, User, Category } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')

const adminController = { // 修改這裡

  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      raw: true,
      nest: true, // 增加這裡
      include: [Category] // 增加這裡
    })
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
      .catch(err => next(err))
  },
  createRestaurant: (req, res, next) => {
    return Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/create-restaurant', { categories }))
      .catch(err => next(err))
  },
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body // 從 req.body 拿出表單裡的資料
    if (!name) throw new Error('Restaurant name is required!') // name 是必填，若發先是空值就會終止程式碼，並在畫面顯示錯誤提示
    const { file } = req // 把檔案取出來，也可以寫成 const file = req.file
    imgurFileHandler(file) // 把取出的檔案傳給 file-helper 處理後
      .then(filePath => Restaurant.create({ // 再 create 這筆餐廳資料
        name,
        tel,
        address,
        openingHours,
        description,
        image: filePath || null,
        categoryId
      }))
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully created') // 在畫面顯示成功提示
        res.redirect('/admin/restaurants') // 新增完成後導回後台首頁
      })
      .catch(err => next(err))
  },

  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, { // 去資料庫用 id 找一筆資料
      raw: true // 找到以後整理格式再回傳
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!") //  如果找不到，回傳錯誤訊息，後面不執行
        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },

  editRestaurant: (req, res, next) => { // 新增這段
    return Promise.all([
      Restaurant.findByPk(req.params.id, { raw: true }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('admin/edit-restaurant', { restaurant, categories })
      })
      .catch(err => next(err))
  },

  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required!')
    const { file } = req // 把檔案取出來
    Promise.all([ // 非同步處理
      Restaurant.findByPk(req.params.id), // 去資料庫查有沒有這間餐廳
      imgurFileHandler(file) // 把檔案傳到 file-helper 處理
    ])
      .then(([restaurant, filePath]) => { // 以上兩樣事都做完以後
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.update({ // 修改這筆資料
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image,
          categoryId
        })
      })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully to update')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },

  deleteRestaurant: (req, res, next) => { // 新增以下
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.destroy()
      })
      .then(() => res.redirect('/admin/restaurants'))
      .catch(err => next(err))
  },

  getUsers: (req, res, next) => {
    return User.findAll({
      raw: true,
      nest: true
    })
      .then(users => {
        return res.render('admin/users', { users: users })
      })
      .catch(err => next(err))
  },
  patchUser: (req, res, next) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (user.email === 'root@example.com') {
          req.flash('error_messages', '禁止變更 root 權限')
          return res.redirect('back')
        }
        if (user.isAdmin) {
          return user.update({ isAdmin: false })
        }
        if (user.isAdmin === false) {
          return user.update({ isAdmin: true })
        }
      })
      .then(() => {
        req.flash('success_messages', '使用者權限變更成功')
        return res.redirect('/admin/users')
      })
      .catch(err => next(err))
  }
}

module.exports = adminController
