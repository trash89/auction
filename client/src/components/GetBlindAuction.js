import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Paper } from "@mui/material";

import { BigNumber, utils } from "ethers";
import { addressNotZero, formatBalance, shortenAddress } from "../utils/utils";

import { useBalance, useContractWrite } from "wagmi";
import { useIsMounted, useDetailsBlindAuction } from "../hooks";
import { GetStatusIcon, ShowError } from ".";

const GetBlindAuction = ({
  activeChain,
  contractAddress,
  contractABI,
  account,
}) => {
  const isMounted = useIsMounted();
  const [disabled, setDisabled] = useState(false);
  const [value, setValue] = useState("0");

  const {
    data: balance,
    //isLoadingBalance,
    isError: isErrorBalance,
    isSuccess: isSuccessBalance,
    error: errorBalance,
    status: statusBalance,
  } = useBalance({
    addressOrName: contractAddress,
    watch: true,
    enabled: Boolean(activeChain && account && addressNotZero(contractAddress)),
  });

  const {
    beneficiary,
    highestBider,
    highestBid,
    biddingEnd,
    revealEnd,
    ended,
  } = useDetailsBlindAuction(activeChain, contractAddress, contractABI);

  const {
    error: errorBid,
    isError: isErrorBid,
    isLoading: isLoadingBid,
    write: writeBid,
    status: statusBid,
  } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "bid",
    {
      enabled: Boolean(
        activeChain && account && addressNotZero(contractAddress)
      ),
    }
  );

  const {
    error: errorWithdraw,
    isError: isErrorWithdraw,
    isLoading: isLoadingWithdraw,
    write: writeWithdraw,
    status: statusWithdraw,
  } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "withdraw",
    {
      enabled: Boolean(
        activeChain && account && addressNotZero(contractAddress)
      ),
    }
  );

  const {
    error: errorAuctionEnd,
    isError: isErrorAuctionEnd,
    isLoading: isLoadingAuctionEnd,
    write: writeAuctionEnd,
    status: statusAuctionEnd,
  } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "auctionEnd",
    {
      enabled: Boolean(
        activeChain && account && addressNotZero(contractAddress)
      ),
    }
  );

  const handleValue = (e) => {
    setValue(e.currentTarget.value);
  };

  const handleBid = () => {
    let defaultValue = 0;
    if (value && parseFloat(value) > 0) {
      setDisabled(true);
      defaultValue = utils.parseEther(value);
      writeBid({ overrides: { value: BigNumber.from(defaultValue) } });
      setValue("0");
    }
  };

  const handleWithdraw = () => {
    setDisabled(true);
    writeWithdraw();
  };

  const handleAuctionEnd = () => {
    setDisabled(true);
    writeAuctionEnd();
  };

  useEffect(() => {
    if (statusBalance !== "loading") {
      if (disabled) setDisabled(false);
    }
    if (statusBid !== "loading") {
      if (disabled) setDisabled(false);
    }
    if (statusWithdraw !== "loading") {
      if (disabled) setDisabled(false);
    }
    if (statusAuctionEnd !== "loading") {
      if (disabled) setDisabled(false);
    }
    // eslint-disable-next-line
  }, [statusBalance, statusBid, statusWithdraw, statusAuctionEnd]);

  const currentDate = new Date();
  const biddingEndFormatted = new Date(biddingEnd).toLocaleString();
  const revealEndFormatted = new Date(revealEnd).toLocaleString();

  return (
    <Stack
      direction="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      spacing={1}
      padding={1}
    >
      {isMounted && (
        <>
          <Typography variant="h5">Blind Auction</Typography>
          <Paper elevation={4}>
            <Typography>
              Contract Address: {shortenAddress(contractAddress)}
            </Typography>
            {isSuccessBalance && (
              <Typography>Balance: {balance?.formatted} ETH </Typography>
            )}
            <Typography>Beneficiary: {shortenAddress(beneficiary)}</Typography>
          </Paper>
          <Paper elevation={4}>
            <Typography>
              Highest Bider: {shortenAddress(highestBider)}
            </Typography>
            <Typography>
              Highest Bid: {formatBalance(highestBid)} ETH
            </Typography>
            <Typography>Auction Bidding End : {biddingEndFormatted}</Typography>
            <Typography>Auction Reveal End : {revealEndFormatted}</Typography>
            <Typography>Auction Ended : {ended.toString()}</Typography>
          </Paper>
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            padding={1}
            spacing={1}
          >
            <TextField
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              variant="standard"
              type="text"
              margin="normal"
              label="Value (ETH)"
              value={value}
              required
              size="small"
              onChange={handleValue}
              disabled={disabled}
            />
          </Stack>
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            padding={1}
            spacing={1}
          >
            <Button
              variant="contained"
              size="small"
              disabled={
                disabled ||
                isLoadingBid ||
                isLoadingWithdraw ||
                isLoadingAuctionEnd
              }
              onClick={handleBid}
              endIcon={<GetStatusIcon status={statusBid} />}
            >
              Bid?
            </Button>
            <Button
              variant="contained"
              size="small"
              disabled={
                disabled ||
                isLoadingBid ||
                isLoadingWithdraw ||
                isLoadingAuctionEnd
              }
              onClick={handleWithdraw}
              endIcon={<GetStatusIcon status={statusWithdraw} />}
            >
              Withdraw?
            </Button>
          </Stack>
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            padding={1}
            spacing={1}
          >
            <Button
              variant="contained"
              size="small"
              disabled={
                disabled ||
                isLoadingBid ||
                isLoadingWithdraw ||
                isLoadingAuctionEnd
              }
              onClick={handleAuctionEnd}
              endIcon={<GetStatusIcon status={statusAuctionEnd} />}
            >
              End Auction?
            </Button>
          </Stack>
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            padding={1}
            spacing={1}
          >
            {isErrorBalance && (
              <ShowError flag={isErrorBalance} error={errorBalance} />
            )}
            {isErrorBid && <ShowError flag={isErrorBid} error={errorBid} />}
            {isErrorWithdraw && (
              <ShowError flag={isErrorWithdraw} error={errorWithdraw} />
            )}
            {isErrorAuctionEnd && (
              <ShowError flag={isErrorAuctionEnd} error={errorAuctionEnd} />
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default GetBlindAuction;
