import {
  calculateAverageOfStatus,
  getGardenStatusData,
  getGardenStatusDataById,
} from '../services/gardenStatusHelper.js';

// @desc    Return data for garden beds
// @route   GET /api/v1/gardenStatus/data
// @access  Private
const getData = (req, res) => {
  const body = req.body || {};
  if (body.bedId) {
    const bedId = body.bedId;
    console.log(`Returning garden status data for bed ${bedId}`);
    const payload = getGardenStatusDataById(bedId);
    res.json(payload);
  } else {
    console.log(`Returning garden status data for garden`);
    const gardenStatusData = getGardenStatusData();
    const payload = calculateAverageOfStatus(gardenStatusData);
    res.json(payload);
  }
};

export { getData };
