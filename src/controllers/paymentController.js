const SSLCommerzPayment = require('sslcommerz-lts');
const Order = require('../models/Order');

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = false; 

exports.createCheckoutSession = async (req, res) => {
    try {
        const { customerInfo, items, totalAmount, shippingFee } = req.body;
        const transactionId = `TXN-${Date.now()}`;

        // এনভায়রনমেন্ট থেকে ইউআরএল নেওয়া (না থাকলে ডিফল্ট লোকালহোস্ট)
        const backendUrl = process.env.BACKEND_URL || "http://localhost:5001";

        const data = {
            total_amount: parseFloat(totalAmount),
            currency: 'BDT',
            tran_id: transactionId,
            // রাউট অবশ্যই app.js এবং orderRoutes.js এর সাথে মিলতে হবে
            success_url: `${backendUrl}/api/payment/success/${transactionId}`,
            fail_url: `${backendUrl}/api/payment/fail/${transactionId}`,
            cancel_url: `${backendUrl}/api/payment/cancel/${transactionId}`,
            ipn_url: `${backendUrl}/api/payment/ipn`,
            shipping_method: 'Courier',
            product_name: 'Skincare Products',
            product_category: 'Skincare',
            product_profile: 'general',

            cus_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            cus_email: customerInfo.email,
            cus_add1: customerInfo.address || 'N/A',
            cus_city: customerInfo.city || 'Dhaka',
            cus_postcode: customerInfo.zipCode || '1000',
            cus_country: 'Bangladesh',
            cus_phone: customerInfo.phone,

            ship_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            ship_add1: customerInfo.address || 'N/A',
            ship_city: customerInfo.city || 'Dhaka',
            ship_state: customerInfo.state || 'Dhaka',
            ship_postcode: customerInfo.zipCode || '1000',
            ship_country: 'Bangladesh',
        };

        // DB save: Items গুলোকে আপনার মডেলের স্ট্রাকচার অনুযায়ী ম্যাপ করা
        const newOrder = new Order({
            customerInfo,
            items: items.map(item => ({
                productID: item._id, 
                name: item.name,
                price: item.salePrice,
                quantity: item.quantity
            })),
            totalAmount,
            shippingFee,
            transactionId,
            paymentStatus: 'Pending'
        });
        await newOrder.save();

        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        
        sslcz.init(data).then(apiResponse => {
            if (apiResponse?.GatewayPageURL) {
                res.status(200).json({ success: true, url: apiResponse.GatewayPageURL });
            } else {
                res.status(400).json({ success: false, message: "SSLCommerz session failed" });
            }
        });

    } catch (error) {
        console.error("Payment Init Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.paymentSuccess = async (req, res) => {
    const { tranId } = req.params;
    try {
        await Order.findOneAndUpdate({ transactionId: tranId }, { paymentStatus: 'Paid', orderStatus: 'Processing' });
        
        // রিয়েক্ট ফ্রন্টএন্ডের সাকসেস পেজে রিডাইরেক্ট
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/payment/success/${tranId}`);
    } catch (err) {
        res.status(500).json({ message: "Success handling error" });
    }
};

exports.paymentFail = async (req, res) => {
    const { tranId } = req.params;
    await Order.findOneAndUpdate({ transactionId: tranId }, { paymentStatus: 'Failed' });
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/payment/fail`);
};

exports.paymentCancel = async (req, res) => {
    const { tranId } = req.params;
    await Order.findOneAndUpdate({ transactionId: tranId }, { paymentStatus: 'Cancelled' });
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/payment/fail`); // ক্যানসেল হলেও ফেইল পেজে পাঠানো যায়
};