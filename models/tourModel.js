const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

//create tour schema
const tourSchema = new mongoose.Schema({
    name: {
      type:String,
      required: [true, 'a tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'a tour name must have less or equal 40 characters'],
      minlength: [10, 'a tour name must have less or equal 10 characters'],
      //validate: [validator.isAlpha, 'tour name nust only contain charachters']
    },
    slug: String,
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
      required: [true, 'tour must have a difficulty'],
      enum:{
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty is either: easy, medium or difficult'
      }
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1,'Rating must be above 1.0'],
      max: [5,'Rating must be above 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'a tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val){
        return val < this.price;
      },
        message:'discount price ({VALUE}) should be below regular price'
    }
    },
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
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  });

//virual property
tourSchema.virtual('durationWeeks').get(function(){
  return this.duration / 7;
})

//document middleware pre/post hook
tourSchema.pre('save', function(next){
  this.slug = slugify(this.name, {lower:true})
  next();
})

tourSchema.post('save', function(doc, next){
  console.log(doc)
  next();
})

//query middleware
tourSchema.pre(/^find/,function(next){
  this.find({secretTour: {$ne: true}});
  next();
})

//aggregation middleware
tourSchema.pre('aggregate',function(next){
  this.pipeline().unshift({$match: {secretTour: {$ne: true}}})
  next()
})

//create a model from the schema
const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour;
  