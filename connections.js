const mongoose = require("mongoose")

function connectToMongo(URI) {
    return mongoose.connect(URI)
}

module.exports = {
    connectToMongo
}