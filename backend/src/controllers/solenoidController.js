import {
  getSolenoidStateData,
  getSolenoidStateDataById,
} from '../services/solenoidHelper.js';

// @desc    Return data for of solenoid states for components
// @route   GET /api/v1/solenoidState/data
// @access  Private
const getData = (req, res) => {
  if (req.body.componentId) {
    const componentId = req.body.componentId;
    console.log(`Returning solenoid state data for component ${componentId}`);
    const payload = getSolenoidStateDataById(componentId);
    res.json(payload);
  } else {
    console.log(`Returning all solenoid state data`);
    const payload = getSolenoidStateData();
    res.json(payload);
  }
};

export { getData };
