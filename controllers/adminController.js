const client = require("../config/redis");
const bookingSlot = require("../model/bookingSlot");

exports.getAllSlots = async (req, res, next) => {
    try {
        // // await client.setEx("bookedSlot", 300, JSON.stringify(getBookedSlot)); // 5 minutes

        // const cachedData = await client.get("bookedSlot");
        // if (!cachedData) {
        //   const getBookedSlot = await bookingSlot.find({ bookingStatus: true });
        //   await client.setEx("bookedSlot", 300, JSON.stringify(getBookedSlot));
        // }
        // return res
        //   .status(200)
        //   .json({ message: "Get all booked slot.", data: getBookedSlot });

        let getBookedSlot;

        const cachedData = await client.get("bookedSlot");

        if (!cachedData) {
            getBookedSlot = await bookingSlot.find({ bookingStatus: true });
            await client.setEx("bookedSlot", 300, JSON.stringify(getBookedSlot));
        } else {
            getBookedSlot = JSON.parse(cachedData);
        }

        return res.status(200).json({
            message: "Get all booked slot.",
            data: getBookedSlot
        });

    } catch (err) {
        next(err);
    }
};
