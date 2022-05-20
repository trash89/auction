import { BigNumber, constants, utils } from "ethers";

function shortenString(str) {
  return str.substring(0, 6) + "..." + str.substring(str.length - 4);
}

export function shortenAddress(address) {
  try {
    return shortenString(utils.getAddress(address));
  } catch {
    throw new TypeError("Invalid input, address can't be parsed");
  }
}

const formatter = new Intl.NumberFormat("en-us", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 18,
});

export const formatBalance = (balance) =>
  formatter.format(
    parseFloat(utils.formatEther(balance ?? BigNumber.from("0")))
  );

export const addressNotZero = (address) => {
  return utils.getAddress(address) !== constants.AddressZero;
};
