import serverConfig from '../config/serverConfig.js';
import bedToPumpConfig from '../config/bedToPumpConfig.js';
import {
  activatePump,
  deactivatePump,
  isPumpActive,
} from '../services/pumpHelper.js';
import {
  activateSolenoid,
  deactivateSolenoid,
  isSolenoidActive,
} from '../services/solenoidHelper.js';

function shouldActivateSolenoid(moistureLevel) {
  return moistureLevel < serverConfig.waterOnThreshold;
}

function shouldDeactivateSolenoid(moistureLevel) {
  return moistureLevel > serverConfig.waterOffThreshold;
}

function areAnySolenoidsForPumpActive(pumpId) {
  let aSolenoidIsActive = false;

  Object.entries(bedToPumpConfig).forEach((entry) => {
    const configBedId = entry[0];
    const configPumpId = entry[1];

    if (configPumpId === pumpId) {
      aSolenoidIsActive |= isSolenoidActive(configBedId);
    }
  });

  return aSolenoidIsActive;
}

function checkMoistureLevels(req, res, next) {
  const moistureLevel = req.body.moisture;
  const bedId = req.body.bedId;
  const pumpId = bedToPumpConfig[bedId];

  try {
    if (shouldActivateSolenoid(moistureLevel) && !isSolenoidActive(bedId)) {
      activateSolenoid(bedId);
      if (!isPumpActive(pumpId)) {
        const pumpActivated = activatePump(pumpId);
        if (!pumpActivated) {
          throw new Error(`Failed to activate pump ${pumpId}`);
        }
      }
    } else if (
      shouldDeactivateSolenoid(moistureLevel) &&
      isSolenoidActive(bedId)
    ) {
      deactivateSolenoid(bedId);
      if (isPumpActive(pumpId) && !areAnySolenoidsForPumpActive(pumpId)) {
        const pumpDeactivated = deactivatePump(pumpId);
        if (!pumpDeactivated) {
          throw new Error(`Failed to deactivate pump ${pumpId}`);
        }
      }
    }

    next();
  } catch (error) {
    console.log(error.message);
  }
}

export { checkMoistureLevels };
