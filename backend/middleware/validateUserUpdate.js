// backend/middlewares/validateUserUpdate.js
const { checkSchema } = require('express-validator');

const validateUserUpdate = checkSchema({
  email: {
    optional: true,
    isEmail: { errorMessage: 'Invalid email format' },
    normalizeEmail: true
  },
  password: {
    optional: true,
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters'
    }
  },
  role: {
    optional: true,
    isIn: {
      options: [['student', 'company']],
      errorMessage: 'Role must be student or company'
    }
  },
  name: { optional: true, isString: { errorMessage: 'Name must be a string' } },
  skills: { optional: true, isArray: { errorMessage: 'Skills must be an array' } },
  bio: { optional: true, isString: true },
  companyName: { optional: true, isString: true },
  website: {
    optional: true,
    isURL: { errorMessage: 'Website must be a valid URL' }
  },
  profilePicture: { optional: true, isString: true },
  tasksCompleted: {
    optional: true,
    isInt: {
      options: { min: 0 },
      errorMessage: 'Tasks must be non-negative'
    }
  },
  bountyEarned: {
    optional: true,
    isNumeric: { errorMessage: 'Bounty must be a number' }
  }
});

module.exports = validateUserUpdate;

