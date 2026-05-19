import {
  getPumpStateData,
  getPumpStateDataById,
} from '../services/pumpHelper.js';

// @desc    Return data for of pump states for components
// @route   GET /api/v1/pumpState/data
// @access  Private
const getData = (req, res) => {
  if (req.body.componentId) {
    const componentId = req.body.componentId;
    console.log(`Returning pump state data for component ${componentId}`);
    const payload = getPumpStateDataById(componentId);
    res.json(payload);
  } else {
    console.log(`Returning all pump state data`);
    const payload = getPumpStateData();
    res.json(payload);
  }
};

export { getData };
