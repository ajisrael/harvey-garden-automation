import {
  getSolenoidStateData,
  getSolenoidStateDataById,
} from '../services/solenoidHelper.js';

// @desc    Return data for of solenoid states for components
// @route   GET /api/v1/solenoidState/data
// @access  Private
const getData = (req, res) => {
  const body = req.body || {};
  if (body.componentId) {
    const componentId = body.componentId;
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
