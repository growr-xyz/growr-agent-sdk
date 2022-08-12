const increaseGasLimit = async (estimateGasPromise, { multiplier }) => {
  if (!multiplier) {
    throw new Error("Please specify the multipler to increase the gas limit");
  }
  // let parsedGasLimit = ethers.utils.formatUnits(expectedGasLimit, "gwei");
  const expectedGasLimit = await estimateGasPromise();
  let parsedGasLimit = expectedGasLimit.toNumber();

  let incrasedGasLimit = parsedGasLimit * multiplier;

  return Math.round(incrasedGasLimit);
};

exports.incrasedGasLimit;
