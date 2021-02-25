if (process.env.NODE_ENV == 'production') {
    module.exports = {mongoURI: process.env.DB_PROD_URI}
} else {
    module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
}