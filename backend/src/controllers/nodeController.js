import nodeConfig from '../config/nodeConfig.js';

// @desc    Return garden bed config values
// @route   GET /api/v1/node/:nodeId/config
// @access  Private
const getConfig = (req, res) => {
  const nodeId = req.params.nodeId;
  const config = nodeConfig[nodeId];
  if (config) {
    console.log(`Returning configuration for node ${nodeId}:`);
    console.log(config);
    res.json(config);
  } else {
    const message = `No config found for node ${nodeId}`;
    console.log(message);
    res.status(404).send(message);
  }
};

export { getConfig };
