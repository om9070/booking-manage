const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    availabilitySlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProviderAvailabilitySlot',
        required: true,
    },
    bookingDate: {
        type: Date,
        required: true,
    },
    bookingStatus: {
        type: Boolean,
        require: true,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending',
    },
    paymentId:{
        type:String,
        default:null
    }

}, { timestamps: true });

module.exports = mongoose.model('BookingSlots', BookingSchema);