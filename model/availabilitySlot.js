const mongoose = require('mongoose');

const ProviderAvailabilitySchema = new mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    dayOfType: {
        type: String,
        enum: ['once', 'week', 'month'],
        required: true,
    },
    day: {
        type: Number,
        validate: {
            validator: function (value) {
                if (this.dayOfType === 'once') return true; 
                if (this.dayOfType === 'week') return value >= 0 && value <= 6; 
                if (this.dayOfType === 'month') return value >= 1 && value <= 31; 
                return false;
            },
            message: props => {
                if (this.dayOfType === 'week') return 'Day must be 0 (Sunday) to 6 (Saturday)';
                if (this.dayOfType === 'month') return 'Day must be between 1 and 31';
                return 'Invalid day value';
            }
        },
        required: function () {
            return this.dayOfType !== 'once'; 
        }
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    providerFee: {
        type:Number,
        required:true,
        default:100
    }
}, { timestamps: true });

module.exports = mongoose.model('ProviderAvailabilitySlot', ProviderAvailabilitySchema);