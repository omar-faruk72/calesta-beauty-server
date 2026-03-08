const Shipping = require("../models/Shipping");

// ১. নতুন শিপিং/অর্ডার তৈরি (POST)
exports.createShipping = async (req, res) => {
  try {
    const newOrder = new Shipping(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, data: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ২. সব শিপিং ডাটা দেখা (GET ALL)
exports.getAllShippings = async (req, res) => {
  try {
    const shippings = await Shipping.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: shippings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ৩. ইমেইল অনুযায়ী ইউজারের অর্ডার দেখা (GET by Email)
exports.getMyOrders = async (req, res) => {
  try {
    const email = req.params.email;
    const orders = await Shipping.find({ "customerInfo.email": email });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};