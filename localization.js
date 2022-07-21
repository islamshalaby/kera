const i18n = require("i18n")

i18n.configure({
    locales: ['en', 'ar'],
    cookie: 'lang',
    defaultLocale: 'en',
    directory: __dirname + '/locales'
  })


module.exports = i18n
