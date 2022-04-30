const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
 
//add custome query
exports.aliasTopTours = (req,res,next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next()
}

//get all tours based on query
exports.getAllTours = catchAsync(async(req, res, next) => {
const query = req.query
  const features = new APIFeatures(Tour.find(),query).filter().sort().limitFields().paginate();
  const tours = await features.query;
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

//get single tour
exports.getTour = catchAsync(async(req, res, next) => {
  const tour = await Tour.findById(req.params.id)
  
  if(!tour){
   return next(new AppError('no tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
      data: {
      tour
    }
      });
});

//add new tour
exports.createTour = catchAsync(async(req, res, next) => {

  const newTour = await Tour.create(req.body)

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

//update existing tour
exports.updateTour = catchAsync(async(req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if(!tour){
    return next(new AppError('no tour found with that ID', 404));
   }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
});

//delete a tour
exports.deleteTour = catchAsync(async(req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id)

  if(!tour){
    return next(new AppError('no tour found with that ID', 404));
   }

    res.status(204).json({
      status: 'success',
    });
});

//get the tour stats calculated
exports.getTourStats = catchAsync(async(req,res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingAverage: {$gte: 4.5}
      }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty'},
        numTours: { $sum: 1},
        numRatings: {$sum: '$ratingQuantity'},
        avgRating: {$avg: '$ratingAverage'},
        avgPrice: {$avg: '$price'},
        minPrice: {$min: '$price'},
        maxPrice: {$max: '$price'},
      }
    },
    {
      $sort: { avgPrice: 1}
    }
  ])

  res.status(200).json({
    status: 'success',
    data: stats
  })
});

//get the busiest month of the year
exports.getMonthlyPlan = catchAsync(async(req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates'},
        numToursStarts: {$sum: 1},
        tours: { $push: '$name'}
      }
    },
    {
      $addFields: { month: '$_id'}
    },
    {
      $project:{
        _id: 0
      }
    },
    {
      $sort: {
        numToursStarts: -1
      }
    },
    {
      $limit: 12
    }
  ])

  res.status(200).json({
    status: 'success',
    data: plan
  })

});