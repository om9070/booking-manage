require('dotenv').config();
const express = require("express");
const connectDB = require('./config/database');
const authRoutes = require("./routes/authRoutes");
const providerRoutes = require("./routes/providerRoutes");
const clientRoutes = require("./routes/clientRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cors = require('cors');
const { stripe } = require('./config/stripe');
const bookingSlot = require('./model/bookingSlot');
const client = require('./config/redis');
require("./config/redis")


const app = express();
const PORT = process.env.PORT || 5000;
connectDB()

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/providers', providerRoutes);
app.use('/client', clientRoutes);
app.use('/admin', adminRoutes);

app.get('/success', async (req, res) => {
  try {

    const sessionId = req.query.session_id;

    const bookingId = req.query.booking_id;

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentId = session.payment_intent;
    const id = {
      _id: bookingId
    }
    const update = {
      $set: {
        paymentId: paymentId,
        status: 'completed',
        updatedAt: new Date()
      }
    }

    const updatePayment = await bookingSlot.findByIdAndUpdate(id, update, { new: true })

    const cached = await client.get('bookedSlot');

    if (cached) {
      const parseSlot = JSON.parse(cached) || [];

      parseSlot.push(updatePayment);

      await client.setEx('bookedSlot', 300, JSON.stringify(parseSlot));
    }


    res.json({
      message: "payment has been done.",
      id: paymentId,
      bookingId: bookingId
    })
  } catch (err) {
    res.json({ message: err })
  }
})

app.get('/cancel', async (req, res) => {
  try {

    const sessionId = req.query.session_id;

    const bookingId = req.query.booking_id;

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentId = session.payment_intent;
    const id = {
      _id: bookingId
    }
    const update = {
      $set: {
        paymentId: paymentId,
        status: 'cancelled',
        updatedAt: new Date()
      }
    }

    const updatePayment = await bookingSlot.findByIdAndUpdate(id, update, { new: true })

    res.json({
      message: "payment has been cancle.",
      id: paymentId,
      bookingId: bookingId
    })
  } catch (err) {
    res.json({ message: err })
  }
})
app.get("/", (req, res) => {
  res.send("backend running on the", PORT)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});