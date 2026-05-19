const nodeConfig = {
  ESP32_01: {
    apiCallDelay: 5 * 1000,
    configUpdateDelay: 60 * 1000,
    loginDelay: 10 * 60 * 1000,
  },
  ESP32_23: {
    apiCallDelay: 5 * 1000,
    configUpdateDelay: 60 * 1000,
    loginDelay: 10 * 60 * 1000,
  },
  ESP32_Res: {
    pumpState: 0,
    pumpRunTime: 30 * 1000,
  },
};

export default nodeConfig;
