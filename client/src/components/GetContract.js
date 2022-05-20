import { useNetwork } from "wagmi";
import { constants, utils } from "ethers";

import networkMapping from "../chain-info/map.json";

import contractSimpleAuction from "../chain-info/SimpleAuction.json";
import contractBlindAuction from "../chain-info/BlindAuction.json";

const GetContract = (contractName) => {
  const { activeChain } = useNetwork();
  let contractAddress;

  if (!networkMapping[String(activeChain?.id)]) {
    contractAddress = constants.AddressZero;
  } else {
    contractAddress = activeChain?.id
      ? networkMapping[String(activeChain.id)][contractName][0]
      : constants.AddressZero;
  }

  const { abi: abiSimpleAuction } = contractSimpleAuction;
  const { abi: abiBlindAuction } = contractBlindAuction;

  const formattedAddress = utils.getAddress(contractAddress);

  if (contractName === "SimpleAuction") {
    return {
      contractAddress: activeChain ? formattedAddress : constants.AddressZero,
      contractABI: abiSimpleAuction,
    };
  }
  if (contractName === "BlindAuction") {
    return {
      contractAddress: activeChain ? formattedAddress : constants.AddressZero,
      contractABI: abiBlindAuction,
    };
  }
  return { contractAddress: formattedAddress, contractABI: abiSimpleAuction };
};

export default GetContract;
