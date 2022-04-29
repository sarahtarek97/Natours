const Tour = require('../models/tourModel');


exports.getAllTours = async(req, res) => {
try {

  const queryObj = {...req.query};
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  let query = Tour.find(JSON.parse(queryStr));

  if(req.query.sort){
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(req.query.sort);
  }else{
    query = query.sort('-createdAt');
  }

  const tours = await query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
  
} catch (err) {
  res.status(404).json({
    status: 'fail',
    message: 'invalid data sent!'
  });
}
};

exports.getTour = async(req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
  
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
    
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createTour = async(req, res) => {

try {
  const newTour = await Tour.create(req.body)

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
} catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'invalid data sent!'
    });
  }
};

exports.updateTour = async(req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
  
    res.status(200).json({
      status: 'success',
      data: {
        tour: '<Updated tour here...>'
      }
    });
  } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err
      });
    }
};

exports.deleteTour = async(req, res) => {
  try {

    await Tour.findByIdAndDelete(req.params.id)

    res.status(204).json({
      status: 'success',
      data: tt
    });
  } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err
      });
    }
};