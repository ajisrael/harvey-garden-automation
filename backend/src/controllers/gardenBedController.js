import { gardenBedSaveError } from '../constants/messages.js';
import {
  getGardenBedData,
  getGardenBedDataById,
  saveGardenBedData,
} from '../services/gardenBedHelper.js';
import {
  calculateNewGardenStatusForBed,
  getGardenStatusDataById,
  updateGardenStatusData,
} from '../services/gardenStatusHelper.js';

// @desc    Return data for garden beds
// @route   GET /api/v1/gardenBed/data
// @access  Private
const getData = (req, res) => {
  const page = req.query.page ? req.query.page : 1;
  if (req.body.bedId) {
    const bedId = req.body.bedId;
    console.log(`Returning garden bed data for bed ${bedId}`);
    const payload = getGardenBedDataById(page, bedId);
    res.json(payload);
  } else {
    console.log(`Returning all garden bed data`);
    const payload = getGardenBedData(page);
    res.json(payload);
  }
};

// @desc    Save data from garden bed
// @route   POST /api/v1/gardenBed/data
// @access  Private
const postData = (req, res) => {
  const bedId = req.body.bedId;
  console.log(`Data received from garden bed ${bedId}:`);
  console.log(req.body);

  const gardenBedData = {
    ...req.body,
  };

  const message = saveGardenBedData(gardenBedData);

  if (message === gardenBedSaveError) {
    throw new Error(message);
  }

  const currentBedStatus = getGardenStatusDataById(bedId);
  const newBedStatus = calculateNewGardenStatusForBed(
    currentBedStatus,
    gardenBedData
  );
  updateGardenStatusData(bedId, newBedStatus);

  res.status(200).send('data received');
};

export { getData, postData };
