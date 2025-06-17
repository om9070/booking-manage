const { getDatesFromDayType, getDateOfMonth } = require("../config/helper");
const availabilitySlot = require("../model/availabilitySlot");
const bookingSlot = require("../model/bookingSlot");
const { stripe } = require('../config/stripe');


exports.bookSlot = async (req, res, next) => {
    try {
        const { _id, bookingDate, bookingStatus } = req.body;

        const bookingCheck=await bookingSlot.aggregate([
            {
                $match:{
                    "bookingDate":new Date(bookingDate),
                    "bookingStatus":true
                }
            }
        ])

        if(!!bookingCheck.length){
            return res.status(400).json({message:"this slot is already booked."})
        }

        const bodyData = {
            ...req.body,
            userId: req.user.id,
            availabilitySlotId: _id
        }
        delete bodyData._id;

        const createSlot = new bookingSlot(bodyData);
        await createSlot.save();
        // res.status(201).json({ message: "The slot has booked.",data:bookingCheck })

        const findProviderFee=await availabilitySlot.findOne({_id})
      const  session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Consultation Fee',
                        },
                        unit_amount: Math.round(parseFloat(findProviderFee.providerFee) * 100), 
                    },
                    quantity: 1,
                }
            ],
            success_url: `http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${createSlot._id}`,
            cancel_url: `http://localhost:5000/cancel??session_id={CHECKOUT_SESSION_ID}&booking_id=${createSlot._id}`,
        });

        res.json({ id: session.id, url: session.url });


    } catch (err) {
        next(err)
    }
};

exports.getAvailableSlot = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const getAvailableSlot = await availabilitySlot.aggregate([
            {

                $lookup: {
                    from: "bookingslots",
                    let: { availabilitySlotId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$availabilitySlotId", "$$availabilitySlotId"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "bookingInfo"
                }


            },
            {
                $match: {
                    $or: [
                        { bookingInfo: { $eq: [] } },
                        {
                            $expr: {
                                $not: {
                                    $anyElementTrue: {
                                        $map: {
                                            input: "$bookingInfo",
                                            as: "booking",
                                            in: "$$booking.bookingStatus"
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            },
            { $skip: skip },
            { $limit: limit }
        ]);


        const getAddDate = getAvailableSlot.map((d) => {
            if (d.dayOfType === 'week') {
                return {
                    ...d,
                    startDate: getDatesFromDayType(d.dayOfType, d.day, { count: 3 })
                }
            } else if (d.dayOfType === 'month') {
                return {
                    ...d,
                    startDate: getDatesFromDayType(d.dayOfType, d.day)
                }
            } else {
                return {
                    ...d,
                    startDate: [getDateOfMonth(d.day)]
                }
            }
        })

        res.status(200).json({ message: "Get all active slot successfully.", data: getAddDate })
    } catch (err) {
        next(err);
    }
};
