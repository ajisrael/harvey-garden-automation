const serverConfig = {
  gardenBedAverageWindow: 10,
  jwtExpiration: '1d',
  listPerPage: 10,
  passwordMinLength: 8,
  passwordMaxLength: 32,
  pumpDelay: 10 * 1000,
  pumpOn: 1,
  pumpOff: 0,
  solenoidDelay: 10 * 1000,
  solenoidOn: 1,
  solenoidOff: 0,
  waterOnThreshold: 0.25,
  waterOffThreshold: 0.75,
};

export default serverConfig;
