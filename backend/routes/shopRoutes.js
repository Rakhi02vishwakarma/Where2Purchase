const express = require('express');
const SellerApproved = require('../models/SellerApproved'); // Adjust the path as per your project structure

const router = express.Router();

// GET all approved shops
router.get('/', async (req, res) => {
  try {
    const shops = await SellerApproved.find({}, {
      shopName: 1,
      shopAddress: 1,
      shopCategory: 1,
      shopDescription: 1,
      shopPhone: 1,
      shopkeeper_id: 1

    });

    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;

