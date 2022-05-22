import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
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
  const [params, setParams] = useState({
    value: "0",
    fake: false,
    secret: "",
  });

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
    error: errorReveal,
    isError: isErrorReveal,
    isLoading: isLoadingReveal,
    write: writeReveal,
    status: statusReveal,
  } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "reveal",
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

  const handleBid = () => {
    let defaultValue = 0;
    if (
      value &&
      parseFloat(value) > 0 &&
      params.value &&
      parseFloat(params.value) > 0
    ) {
      setDisabled(true);
      defaultValue = utils.parseEther(value);
      const formattedValue = BigNumber.from(params.value);
      const formattedFake =
        params.fake === true ? BigNumber.from("1") : BigNumber.from("0");
      const formattedSecret = utils.formatBytes32String(params.secret);
      const dataHex = utils.keccak256(
        utils.defaultAbiCoder.encode(
          ["uint256", "bool", "bytes32"],
          [formattedValue, formattedFake, formattedSecret]
        )
      );
      console.log(dataHex);
      //0xfe2b8044d17580c644616323fd16194ac75108926b4d7c37bd87fcf9658901b8;
      writeBid({ args: [dataHex], overrides: { value: defaultValue } });
      setValue("0");
      setParams({ value: "0", fake: false, secret: "" });
    }
  };

  const handleReveal = () => {
    if (params.value && parseFloat(params.value) > 0) {
      setDisabled(true);
      const formattedValue = BigNumber.from(params.value);
      const formattedFake =
        params.fake === true ? BigNumber.from("1") : BigNumber.from("0");
      const formattedSecret = utils.formatBytes32String(params.secret);
      writeReveal({
        args: [[formattedValue], [formattedFake], [formattedSecret]],
        overrides: { gasLimit: 6721975 },
      });
      setValue("0");
      setParams({ value: "0", fake: false, secret: "" });
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
    if (statusReveal !== "loading") {
      if (disabled) setDisabled(false);
    }
    if (statusAuctionEnd !== "loading") {
      if (disabled) setDisabled(false);
    }
    // eslint-disable-next-line
  }, [
    statusBalance,
    statusBid,
    statusWithdraw,
    statusReveal,
    statusAuctionEnd,
  ]);

  const currentDate = new Date();
  const biddingEndFormatted = new Date(biddingEnd).toLocaleString();
  const revealEndFormatted = new Date(revealEnd).toLocaleString();

  const fakes = [
    { value: false, label: "false" },
    { value: true, label: "true" },
  ];

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
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            padding={1}
            spacing={1}
          >
            <Paper elevation={4}>
              <Typography>
                Highest Bider: {shortenAddress(highestBider)}
              </Typography>
              <Typography>
                Highest Bid: {formatBalance(highestBid)} ETH
              </Typography>
              <Typography>
                Auction Bidding End : {biddingEndFormatted}
              </Typography>
              <Typography>Auction Reveal End : {revealEndFormatted}</Typography>
              <Typography>Auction Ended : {ended.toString()}</Typography>
            </Paper>
            <Paper elevation={4}>
              <Typography>
                Contract Address: {shortenAddress(contractAddress)}
              </Typography>
              {isSuccessBalance && (
                <Typography>Balance: {balance?.formatted} ETH </Typography>
              )}
              <Typography>
                Beneficiary: {shortenAddress(beneficiary)}
              </Typography>
            </Paper>
          </Stack>
          <Paper elevation={4}>
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
                type="number"
                label="Value (ETH)"
                value={params.value}
                onChange={(e) =>
                  setParams({ ...params, value: e.target.value })
                }
                disabled={disabled}
              />
              <TextField
                variant="standard"
                select
                label="Fake"
                value={params.fake}
                onChange={(e) => setParams({ ...params, fake: e.target.value })}
                disabled={disabled}
              >
                {fakes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                variant="standard"
                type="text"
                label="Secret"
                value={params.secret}
                onChange={(e) =>
                  setParams({ ...params, secret: e.target.value })
                }
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
              <TextField
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                variant="standard"
                type="number"
                label="Value (ETH)"
                value={value}
                required
                onChange={(e) => setValue(e.target.value)}
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
                disabled={
                  disabled ||
                  isLoadingBid ||
                  isLoadingWithdraw ||
                  isLoadingReveal ||
                  isLoadingAuctionEnd
                }
                onClick={handleBid}
                endIcon={<GetStatusIcon status={statusBid} />}
              >
                Bid?
              </Button>
              <Button
                variant="contained"
                disabled={
                  disabled ||
                  isLoadingBid ||
                  isLoadingWithdraw ||
                  isLoadingReveal ||
                  isLoadingAuctionEnd
                }
                onClick={handleReveal}
                endIcon={<GetStatusIcon status={statusReveal} />}
              >
                Reveal?
              </Button>
              <Button
                variant="contained"
                disabled={
                  disabled ||
                  isLoadingBid ||
                  isLoadingWithdraw ||
                  isLoadingReveal ||
                  isLoadingAuctionEnd
                }
                onClick={handleWithdraw}
                endIcon={<GetStatusIcon status={statusWithdraw} />}
              >
                Withdraw?
              </Button>
              <Button
                variant="contained"
                disabled={
                  disabled ||
                  isLoadingBid ||
                  isLoadingWithdraw ||
                  isLoadingReveal ||
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
              {isErrorReveal && (
                <ShowError flag={isErrorReveal} error={errorReveal} />
              )}
              {isErrorAuctionEnd && (
                <ShowError flag={isErrorAuctionEnd} error={errorAuctionEnd} />
              )}
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
};

export default GetBlindAuction;
