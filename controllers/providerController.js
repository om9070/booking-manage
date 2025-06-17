const { default: mongoose } = require("mongoose");
const { monthDayToWeekDay, getMonthDaysForWeekday, compareTimingDate } = require("../config/helper");
const providerAvailabilitySlot = require("../model/availabilitySlot");



exports.createAvailability = async (req, res, next) => {
    try {
        const { dayOfType, startTime, endTime, day } = req.body;
        const providerId = req.user.id;
        const bodyData = {
            ...req.body,
            providerId,
        };
        const now = new Date();
        const daysArray = day;

        const conflictMessages = [];
        const insertedDays = [];

        if (dayOfType === 'week') {
            for (const d of daysArray) {
                const monthDays = getMonthDaysForWeekday(now.getFullYear(), now.getMonth() + 1, d);

                const conflict = await providerAvailabilitySlot.findOne({
                    $or: [
                        {
                            $and: [
                                { dayOfType: 'month', day: { $in: monthDays } },
                                { $or: compareTimingDate(startTime, endTime) }
                            ]
                        },
                        {
                            $and: [
                                { dayOfType: 'week', day: d },
                                { $or: compareTimingDate(startTime, endTime) }
                            ]
                        },
                        {
                            $and: [
                                { dayOfType: 'once', day: d },
                                { $or: compareTimingDate(startTime, endTime) }
                            ]
                        }
                    ]
                });

                if (conflict) {
                    conflictMessages.push(`Conflict on weekly day: ${d}`);
                    continue;
                }

                const slot = await providerAvailabilitySlot.create({
                    ...bodyData,
                    dayOfType: 'week',
                    day: d
                });

                await slot.save();
                insertedDays.push(d);
            }

        } else {
            for (const d of daysArray) {
                const getWeek = monthDayToWeekDay(d, now.getFullYear(), now.getMonth() + 1);

                const conflict = await providerAvailabilitySlot.findOne({
                    $or: [
                        {
                            $and: [
                                { dayOfType: 'week', day: getWeek },
                                { $or: compareTimingDate(startTime, endTime) }
                            ]
                        },
                        {
                            $and: [
                                { dayOfType: 'month', day: d },
                                { $or: compareTimingDate(startTime, endTime) }
                            ]
                        },
                        {
                            $and: [
                                { dayOfType: 'once', day: d },
                                { $or: compareTimingDate(startTime, endTime) }
                            ]
                        }
                    ]
                });

                if (conflict) {
                    conflictMessages.push(`Conflict on ${dayOfType} day: ${d}`);
                    continue;
                }

                const slot = await providerAvailabilitySlot.create({
                    ...bodyData,
                    dayOfType: dayOfType === 'month' ? 'month' : 'once',
                    day: d
                });

                await slot.save();
                insertedDays.push(d);
            }
        }

        if (insertedDays.length === 0) {
            return res.status(400).json({
                message: 'All days conflicted. No slots inserted.',
                conflicts: conflictMessages
            });
        }

        return res.status(201).json({
            message: `Availability slots booked for: ${insertedDays.join(', ')}`,
            ...(conflictMessages.length > 0 && { conflicts: conflictMessages })
        });


    } catch (err) {
        next(err);
    }
};

exports.listProviders = async (req, res, next) => {
    try {

        const getAvailableSlot = await providerAvailabilitySlot.aggregate([
            {
                $match: {
                    providerId: new mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $lookup: {
                    from: "bookingslots",
                    localField: "_id",
                    foreignField: "availabilitySlotId",
                    as: "findSlot"
                }
            }, {
                $match: {
                    $or: [
                        { findSlot: { $eq: [] } },
                        {
                            $expr: {
                                $not: {
                                    $anyElementTrue: {
                                        $map: {
                                            input: "$findSlot",
                                            as: "slot",
                                            in: "$$slot.bookingStatus"
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ])


        res.status(200).json({ data: getAvailableSlot })
    } catch (err) {
        next(err)
    }
};
