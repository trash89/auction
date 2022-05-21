import { useContractRead } from "wagmi";
import { BigNumber, utils, constants } from "ethers";
import { addressNotZero } from "../utils/utils";

const useDetailsBlindAuction = (activeChain, contractAddress, contractABI) => {
  const {
    data: beneficiary,
    isLoading: isLoadingBeneficiary,
    isError: isErrorBeneficiary,
    isSuccess: isSuccessBeneficiary,
  } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "beneficiary",
    {
      watch: Boolean(activeChain && addressNotZero(contractAddress)),
      enabled: Boolean(activeChain && addressNotZero(contractAddress)),
    }
  );

  const {
    data: highestBider,
    isLoading: isLoadingHighestBider,
    isError: isErrorHighestBider,
    isSuccess: isSuccessHighestBider,
  } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "highestBidder",
    {
      watch: Boolean(activeChain && addressNotZero(contractAddress)),
      enabled: Boolean(activeChain && addressNotZero(contractAddress)),
    }
  );

  const {
    data: highestBid,
    isLoading: isLoadingHighestBid,
    isError: isErrorHighestBid,
    isSuccess: isSuccessHighestBid,
  } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "highestBid",
    {
      watch: Boolean(activeChain && addressNotZero(contractAddress)),
      enabled: Boolean(activeChain && addressNotZero(contractAddress)),
    }
  );

  const {
    data: biddingEnd,
    isLoading: isLoadingBiddingEnd,
    isError: isErrorBiddingEnd,
    isSuccess: isSuccessBiddingEnd,
  } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "biddingEnd",
    {
      watch: Boolean(activeChain && addressNotZero(contractAddress)),
      enabled: Boolean(activeChain && addressNotZero(contractAddress)),
    }
  );

  const {
    data: revealEnd,
    isLoading: isLoadingRevealEnd,
    isError: isErrorRevealEnd,
    isSuccess: isSuccessRevealEnd,
  } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "revealEnd",
    {
      watch: Boolean(activeChain && addressNotZero(contractAddress)),
      enabled: Boolean(activeChain && addressNotZero(contractAddress)),
    }
  );

  const {
    data: ended,
    isLoading: isLoadingEnded,
    isError: isErrorEnded,
    isSuccess: isSuccessEnded,
  } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "ended",
    {
      watch: Boolean(activeChain && addressNotZero(contractAddress)),
      enabled: Boolean(activeChain && addressNotZero(contractAddress)),
    }
  );

  return {
    beneficiary:
      isLoadingBeneficiary || isErrorBeneficiary || !isSuccessBeneficiary
        ? constants.AddressZero
        : utils.getAddress(beneficiary),
    highestBider:
      isLoadingHighestBider || isErrorHighestBider || !isSuccessHighestBider
        ? constants.AddressZero
        : utils.getAddress(highestBider),
    highestBid:
      isLoadingHighestBid || isErrorHighestBid || !isSuccessHighestBid
        ? BigNumber.from("0")
        : highestBid,
    biddingEnd:
      isLoadingBiddingEnd || isErrorBiddingEnd || !isSuccessBiddingEnd
        ? BigNumber.from("0")
        : biddingEnd * 1000, ///in miliseconds
    revealEnd:
      isLoadingRevealEnd || isErrorRevealEnd || !isSuccessRevealEnd
        ? BigNumber.from("0")
        : revealEnd * 1000, ///in miliseconds
    ended: isLoadingEnded || isErrorEnded || !isSuccessEnded ? false : ended,
  };
};

export default useDetailsBlindAuction;
