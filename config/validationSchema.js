const Joi = require('joi');


const timeValidation = Joi.extend((joi) => ({
  type: 'timeString',
  base: joi.string(),
  messages: {
    'timeString.invalid': '{{#label}} must be in HH:MM format (24-hour)',
    'timeString.after': '{{#label}} must be after {{#after}}'
  },
  rules: {
    format: {
      validate(value, helpers) {
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          return helpers.error('timeString.invalid');
        }
        return value;
      }
    },
    after: {
      method(ref) {
        return this.$_addRule({ name: 'after', args: { ref } });
      },
      args: [
        {
          name: 'ref',
          ref: true,
          assert: (value) => typeof value === 'string',
          message: 'must be a string'
        }
      ],
      validate(value, helpers, args) {
        const [refHour, refMinute] = args.ref.split(':').map(Number);
        const [hour, minute] = value.split(':').map(Number);

        if (hour < refHour || (hour === refHour && minute <= refMinute)) {
          return helpers.error('timeString.after', { after: args.ref });
        }
        return value;
      }
    }
  }
}));


module.exports = {
  // Auth validators
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    role: Joi.string().valid('provider', 'client', 'admin').required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  setAvailability: Joi.object({
    dayOfType: Joi.string()
      .valid('once', 'week', 'month')
      .required()
      .messages({
        'any.only': 'Day type must be either once, week, or month',
        'any.required': 'Day type is required'
      }),


//     day: Joi.alternatives().conditional('dayOfType', [
//   {
//     is: 'week',
//     then: Joi.number()
//       .integer()
//       .min(0)
//       .max(6)
//       .required()
//       .messages({
//         'number.base': 'Day must be a number (0-6)',
//         'number.min': 'Week day must be 0 (Sunday) to 6 (Saturday)',
//         'number.max': 'Week day must be 0 (Sunday) to 6 (Saturday)',
//         'any.required': 'Day is required for weekly availability'
//       })
//   },
//   {
//     is: 'month',
//     then: Joi.number()
//       .integer()
//       .min(1)
//       .max(31)
//       .required()
//       .messages({
//         'number.base': 'Day must be a number (1-31)',
//         'number.min': 'Month day must be between 1 and 31',
//         'number.max': 'Month day must be between 1 and 31',
//         'any.required': 'Day is required for monthly availability'
//       })
//   },
//   {
//     is: 'once',
//     then: Joi.number()
//       .integer()
//       .min(1)
//       .max(31)
//       .required()
//       .messages({
//         'number.base': 'Day must be a number (1-31)',
//         'number.min': 'Day must be between 1 and 31',
//         'number.max': 'Day must be between 1 and 31',
//         'any.required': 'Day is required for one-time availability'
//       })
//   }
// ]),

day: Joi.array().items(
  Joi.alternatives().conditional('dayOfType', {
    switch: [
      {
        is: 'week',
        then: Joi.number()
          .integer()
          .min(0)
          .max(6)
          .required()
          .messages({
            'number.base': 'Each weekday must be a number (0-6)',
            'number.min': 'Weekday must be 0 (Sunday) to 6 (Saturday)',
            'number.max': 'Weekday must be 0 (Sunday) to 6 (Saturday)',
            'any.required': 'Day is required'
          })
      },
      {
        is: Joi.valid('month', 'once'),
        then: Joi.number()
          .integer()
          .min(1)
          .max(31)
          .required()
          .messages({
            'number.base': 'Each day must be a number (1-31)',
            'number.min': 'Day must be between 1 and 31',
            'number.max': 'Day must be between 1 and 31',
            'any.required': 'Day is required'
          })
      }
    ]
  })
)
.min(0)
.required()
.messages({
  'array.base': 'Day must be an array of numbers',
  'array.min': 'At least one day must be provided',
  'any.required': 'Day is required'
}),


    startTime: timeValidation.timeString()
      .format()
      .required()
      .messages({
        'any.required': 'Start time is required'
      }),

    endTime: timeValidation.timeString()
      .format()
      .required()
      .after(Joi.ref('startTime'))
      .messages({
        'any.required': 'End time is required',
        'timeString.after': 'End time must be after start time'
      }),

    providerFee: Joi.number()
      .precision(2)
      .min(0)
      .max(10000)
      .default(100)
      .messages({
        'number.base': 'Fee must be a number',
        'number.min': 'Fee cannot be negative',
        'number.max': 'Fee cannot exceed 10000',
        'number.precision': 'Fee can have maximum 2 decimal places'
      })
  }).options({ abortEarly: false }),

  // Appointment validators
  bookAppointment: Joi.object({
    _id: Joi.string().hex().length(24).required(),
    bookingDate: Joi.date().iso().greater('now').required(),
    bookingStatus: Joi.boolean().required()
  }),

  // Admin validators
  getAppointments: Joi.object({
    providerId: Joi.string().hex().length(24),
    clientId: Joi.string().hex().length(24),
    status: Joi.string().valid('booked', 'completed', 'cancelled'),
    from: Joi.date().iso(),
    to: Joi.date().iso()
  })
};