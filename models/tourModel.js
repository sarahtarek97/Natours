const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
      type:String,
      required: [true, 'a tour must have a name'],
      unique: true,
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'tour must have a difficulty']
    },
    ratingAverage: {
      type: Number,
      default: 4.5
    },
    ratingQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'a tour must have a price']
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true, // will remove all white spaces before and afte the string
      required: [true, 'a tour must have a discrpition']
    },
    description: {
      type: String,
      trim: true 
    },
    imageCover: {
      type: String,
      required: [true, 'a tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date]
  });
  
  const Tour = mongoose.model('Tour', tourSchema)

  module.exports = Tour;
  