export const passIfLogged = (req, res, next) => req.isAuthenticated() ? next() : res.redirect('/login')
export const passIfNotLogged = (req, res, next) => req.isAuthenticated() ? res.redirect('/') : next()