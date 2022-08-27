// import getConfig from "next/config";

const { ethers } = require("ethers");

const LoanABI = require("../../abis/Loan.json");
const ERC20ABI = require("../../abis/ERC20.json");
const PondABI = require("../../abis/Pond.json");
const PondFactoryABI = require("../../abis/PondFactory.json");
// const VerificationRegistryABI = require("../abis/VerificationRegistry.json");
const increaseGasLimit = require("./increaseGasLimit");

// const { publicRuntimeConfig } = getConfig();
// console.log('config', publicRuntimeConfig);

// const rpcURL = process.env.NEXT_PUBLIC_RPC_URL;
// const provider = new ethers.providers.JsonRpcProvider(rpcURL);

const xUSDAddress = process.env.NEXT_PUBLIC_XUSD_CONTRACT;
// const DOCAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const VerificationRegistryAddress =
  process.env.NEXT_PUBLIC_VERIFICATION_REGISTRY_CONTRACT;
const PondFactoryAddress = process.env.NEXT_PUBLIC_POND_FACTORY_CONTRACT;
// const WRBTCAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// console.log(process.env);

exports.findBestOffer = async (
  provider,
  account,
  { amount, duration, credentials }
) => {
  console.log("findBestOffer", { amount, duration, credentials });
  const signer = provider.getSigner(account);

  console.log("got the signer");
  const PondFactory = new ethers.Contract(
    PondFactoryAddress,
    PondFactoryABI,
    provider
  );
  console.log("PondFactory", PondFactory);
  const allPondAddresses = await PondFactory.connect(signer).getAllPonds();
  console.log("allPondAddresses", allPondAddresses);

  const res = await Promise.allSettled(
    allPondAddresses.map(async (pondAddress) => {
      const Pond = new ethers.Contract(pondAddress, PondABI, provider);
      const { match, containsAll } = await filterOnlyPondCredentials(
        provider,
        account,
        { pondAddress, credentials }
      );
      if (!containsAll) {
        throw Error(
          `Not all credentials are passed to this pond ${pondAddress}`
        );
      }
      return {
        pondAddress,
        details: await Pond.getLoanOffer(
          ethers.utils.parseEther(amount),
          duration,
          match.arrays
        ),
      };
    })
  );
  console.log("Ponds", res);

  let bestOffersRate = [];
  let bestOffersAmount = [];
  let bestOffersDuration = [];

  // min interest rate
  res.forEach((r) => {
    if (r.status != "fulfilled") return;
    const offer = r.value;

    if (bestOffersRate.length == 0) {
      return bestOffersRate.push(offer);
    }

    if (
      Number(bestOffersRate[0].details.annualInterestRate.toString()) >
      Number(offer.details.annualInterestRate.toString())
    ) {
      bestOffersRate = [offer];
    } else if (
      Number(bestOffersRate[0].details.annualInterestRate.toString()) ===
      Number(offer.details.annualInterestRate.toString())
    ) {
      bestOffersRate.push(offer);
    }
  });

  // if (bestOffersRate.length < 2) return bestOffersRate;

  bestOffersRate.forEach((offer) => {
    if (bestOffersAmount.length == 0) {
      return bestOffersAmount.push(offer);
    }

    if (
      Number(ethers.utils.formatEther(offer.details.amount.toString())) >
      Number(ethers.utils.formatEther(bestOffersAmount[0].details.amount))
    ) {
      bestOffersAmount = [offer];
    } else if (
      Number(ethers.utils.formatEther(offer.details.amount)) ===
      Number(ethers.utils.formatEther(bestOffersAmount[0].details.amount))
    ) {
      bestOffersAmount.push(offer);
    }
  });

  bestOffersAmount.forEach((offer) => {
    if (bestOffersDuration.length == 0) {
      return bestOffersDuration.push(offer);
    }

    // if (Number(offer.details.duration.toString()) > Number(bestOffersDuration[0].details.duration.toString())) {
    // 	bestOffers = [offer];
    // } else if (
    // 	Number(offer.details.duration.toString()) === Number(bestOffersDuration[0].details.duration.toString())
    // ) {
    // 	bestOffers.push(offer);
    // }
  });

  return bestOffersDuration.length > 0 ? bestOffersDuration[0] : null;
};

const getPondCriteriaNames = async (
  provider,
  account,
  { pondAddress }
) => {
  const Pond = new ethers.Contract(pondAddress, PondABI, provider);
  console.log("Pond contract", Pond);

  const criteriaNames = await Pond.getCriteriaNames();

  return criteriaNames;
};

const getPondCriteria = async (provider, account, { pondAddress }) => {
  const Pond = new ethers.Contract(pondAddress, PondABI, provider);

  const { _criteria } = await Pond.getDetails();
  // console.log(`Pond ${pondAddress}} criteria:`, _criteria);

  const criteria = _criteria.map((criterion) => ({
    name: criterion._name,
    operator: criterion._operator,
    content: criterion._content,
    type: criterion._type,
  }));

  return criteria;
};

// TODO: Known issue – 1 criteria per attribute is only supported
const filterOnlyPondCredentials = async (
  provider,
  account,
  { pondAddress, credentials }
) => {
  const criteriaNames = await getPondCriteriaNames(provider, account, {
    pondAddress,
  });
  // console.log('filterOnlyPondCredentials', criteriaNames);

  const pondCriteria = await getPondCriteria(provider, account, {
    pondAddress,
  });
  console.log("=============================================");
  console.log(`Pond ${pondAddress}} criteria:`, pondCriteria);

  console.log("credentials", credentials);
  // const userValidCredentials = Object.fromEntries(
  // 	Object.entries(credentials).filter(([name, value]) => criteriaNames.includes(name))
  // );
  let userValidCredentials = {};
  let pondUniqueCriteriaNames = [];
  pondCriteria.forEach((criteria) => {
    console.log(
      "Evaluating",
      (criteria.type === "string" ? '"' : "") +
      String(credentials[criteria.name]) +
      (criteria.type === "string" ? '"' : "") +
      " " +
      criteria.operator.replace("=", "==") +
      " " +
      (criteria.type === "string" ? '"' : "") +
      String(criteria.content) +
      (criteria.type === "string" ? '"' : "")
    );
    console.log(
      "Result =",
      eval(
        (criteria.type === "string" ? '"' : "") +
        String(credentials[criteria.name]) +
        (criteria.type === "string" ? '"' : "") +
        " " +
        criteria.operator.replace("=", "==") +
        " " +
        (criteria.type === "string" ? '"' : "") +
        String(criteria.content) +
        (criteria.type === "string" ? '"' : "")
      )
    );
    if (!pondUniqueCriteriaNames.find((element) => element === criteria.name))
      pondUniqueCriteriaNames.push(criteria.name);
    if (
      eval(
        (criteria.type === "string" ? '"' : "") +
        String(credentials[criteria.name]) +
        (criteria.type === "string" ? '"' : "") +
        " " +
        criteria.operator.replace("=", "==") +
        " " +
        (criteria.type === "string" ? '"' : "") +
        String(criteria.content) +
        (criteria.type === "string" ? '"' : "")
      )
    ) {
      console.log("Evaluation successful");
      // Append to the valid credentials if not already present
      if (userValidCredentials[criteria.name] === undefined)
        userValidCredentials = {
          ...userValidCredentials,
          [criteria.name]: credentials[criteria.name],
        };
    } else {
      console.log("Evaluation failed");
      // Delete from the valid credentials, in case another condition was previously evaluated successfully
      delete userValidCredentials[criteria.name];
    }
  });
  console.log("userValidCredentials", userValidCredentials);
  console.log("pondUniqueCriteriaNames", pondUniqueCriteriaNames);

  const names = Object.keys(userValidCredentials);
  const contents = Object.values(userValidCredentials);

  const containsAll = names.length === pondUniqueCriteriaNames.length;

  console.log("Contains all?", containsAll);
  console.log("=============================================");

  return {
    neededNames: criteriaNames,
    match: {
      json: userValidCredentials,
      arrays: { names, contents },
    },
    containsAll,
  };
};

// export const verifyCredentials = async (
//   provider,
//   account,
//   { pondAddress, credentials }
// ) => {
//   const { match, containsAll } = await filterOnlyPondCredentials(
//     provider,
//     account,
//     { pondAddress, credentials }
//   );

//   if (!containsAll) {
//     return false;
//   }

//   const Pond = new ethers.Contract(pondAddress, PondABI, provider);

//   const valid = await Pond.verifyCredentials(match.arrays);

//   return valid && criteriaNames;
// };

// export const registerVerification = async (
//   provider,
//   verifier,
//   { borrower, pondAddress }
// ) => {
//   const signer = provider.getSigner(verifier);
//   const VerificationRegistry = new ethers.Contract(
//     VerificationRegistryAddress,
//     VerificationRegistryABI,
//     provider
//   );
//   const validity = 60 * 60; // 1 hour in seconds

//   const tx = await VerificationRegistry.connect(signer).registerVerification(
//     borrower,
//     pondAddress,
//     validity
//   );
//   return tx.wait();
// };

exports.borrow = async (
  provider,
  borrower,
  { amount, duration, pondAddress }
) => {
  const signer = provider.getSigner(borrower);

  const Pond = new ethers.Contract(pondAddress, PondABI, provider);

  const tx = await Pond.connect(signer).borrow(amount, duration);
  return tx.wait();
};

exports.repay = async (provider, borrower, { pondAddress, amount }) => {
  const signer = provider.getSigner(borrower);

  const Pond = new ethers.Contract(pondAddress, PondABI, provider);
  const xUSD = new ethers.Contract(xUSDAddress, ERC20ABI, provider);

  const loanAddress = await Pond.getLoan(borrower);
  const repayAmount = ethers.utils.parseEther(amount);

  Pond.once(
    "RepayLoan",
    (loanAddr, senderAddr, repaidAmount, timestamp, event) => {
      console.log(loanAddr, senderAddr, repaidAmount, timestamp);
    }
  );

  const connectedXUSD = xUSD.connect(signer);

  let increasedApproveGasLimit = await increaseGasLimit(
    () => connectedXUSD.estimateGas.approve(pondAddress, repayAmount),
    {
      multiplier: 1.2,
    }
  );
  await xUSD.connect(signer).approve(pondAddress, repayAmount, {
    gasLimit: increasedApproveGasLimit,
  });

  const connectedPond = Pond.connect(signer);

  const increasedReplayGasLimit = await increaseGasLimit(
    () => connectedPond.estimateGas.repay(repayAmount, loanAddress),
    { multiplier: 1.2 }
  );
  const tx = await connectedPond.repay(repayAmount, loanAddress, {
    gasLimit: increasedReplayGasLimit,
  });
  // return await tx.wait();
};

exports.fetchRepaymentHistory = async (
  provider,
  borrower,
  { pondAddress }
) => {
  const iface = new ethers.utils.Interface(PondABI);
  const Pond = new ethers.Contract(pondAddress, PondABI, provider);

  const loanAddress = await Pond.getLoan(borrower);

  const filter = Pond.filters.RepayLoan(loanAddress, borrower);
  const events = await Pond.queryFilter(filter);

  return events.map((event) => {
    return iface.decodeEventLog("RepayLoan", event.data);
  });
};

exports.getLoanDetails = async (provider, borrower, { pondAddress }) => {
  const Pond = new ethers.Contract(pondAddress, PondABI, provider);

  const loanAddress = await Pond.getLoan(borrower);
  const Loan = new ethers.Contract(loanAddress, LoanABI, provider);

  const details = await Loan.getDetails();

  return details;
};

exports.getBalance = async (provider, account) => {
  // const signer = provider.getSigner(account);

  const xUSDContract = new ethers.Contract(xUSDAddress, ERC20ABI, provider);
  const balance = await xUSDContract.balanceOf(account);
  // console.log('xUSD balance', ethers.utils.formatUnits(balance));

  return ethers.utils.formatUnits(balance);
};

exports.getPondCriteriaNames = getPondCriteriaNames
