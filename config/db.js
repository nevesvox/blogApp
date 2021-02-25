if (process.env.NODE_ENV == 'production') {
    module.exports = {mongoURI: 'mongodb+srv://gabrielneves:Gabriel123!@cluster0.dgu60.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'}
} else {
    module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
}