const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    originalTitle: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    releaseYear: {
        type: Number,
        required: true
    },
    duration: {
        type: Number, // Thời lượng phim tính bằng phút
        required: true
    },
    posterUrl: {
        type: String,
        required: true
    },
    trailerUrl: String,
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    director: String,
    actors: [String],
    country: String,
    status: {
        type: String,
        enum: ['upcoming', 'showing', 'ended'],
        default: 'showing'
    },
    rating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    episodes: [{
        episodeNumber: Number,
        title: String,
        videoUrl: String,
        duration: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware để tự động cập nhật updatedAt
movieSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie; 