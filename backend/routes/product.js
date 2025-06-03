const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Search products with shopname and location
router.get('/search/all', async (req, res) => {
  const searchQuery = req.query.search || '';

  try {
    const regex = new RegExp(searchQuery, 'i');

    const products = await Product.aggregate([
      {
        $match: {
          $or: [
            { name: regex },
            { description: regex }
          ]
        }
      },
      {
        $lookup: {
          from: 'sellerapproveds',        // join sellerapproveds collection
          localField: 'shopkeeperId',     // product.shopkeeperId (ObjectId)
          foreignField: '_id',            // sellerapproveds._id (ObjectId)
          as: 'shopkeeperData'
        }
      },
      {
        $unwind: { path: '$shopkeeperData', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'locations',
          let: { shopIdObj: '$shopkeeperId' },  // product.shopkeeperId (ObjectId)
          pipeline: [
            {
              $match: {
                $expr: {
                  // Convert location.shopkeeperId string to ObjectId and compare
                  $eq: [
                    { $toObjectId: '$shopkeeperId' }, 
                    '$$shopIdObj'
                  ]
                }
              }
            }
          ],
          as: 'locationData'
        }
      },
      {
        $unwind: { path: '$locationData', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          stockQuantity: 1,
          image: 1,
          available: 1,
          shopname: { $ifNull: ['$shopkeeperData.shopName', 'N/A'] },
          location: { $ifNull: ['$locationData', {}] }  // full location document or empty object
        }
      }
    ]);

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products', error });
  }
});

module.exports = router;
