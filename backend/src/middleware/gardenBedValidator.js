import bedToPumpConfig from '../config/bedToPumpConfig.js';

function validateGardenBedData(req, res, next) {
  let messages = [];

  if (!req.body) {
    messages.push('No object is provided');
  }

  if (!req.body.bedId) {
    messages.push('Bed ID is empty');
  }

  if (!req.body.airTemp) {
    messages.push('Air Temp is empty');
  }

  if (!req.body.soilTemp) {
    messages.push('Soil Temp is empty');
  }

  if (!req.body.light) {
    messages.push('Light is empty');
  }

  if (!req.body.moisture) {
    messages.push('Moisture is empty');
  }

  if (!req.body.humidity) {
    messages.push('Humidity is empty');
  }

  if (!Object.keys(bedToPumpConfig).includes(req.body.bedId)) {
    messages.push(`${req.body.bedId} is not a valid bedId`);
  }

  if (messages.length) {
    let error = new Error(messages.join(', '));
    error.statusCode = 400;
    throw error;
  } else {
    next();
  }
}

export { validateGardenBedData };
