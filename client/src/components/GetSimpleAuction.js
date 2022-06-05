import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { BigNumber, utils } from "ethers";
import { addressNotZero, formatBalance, shortenAddress } from "../utils/utils";

import { useBalance } from "wagmi";
import {
  useIsMounted,
  useDetailsSimpleAuction,
  useGetFuncWrite,
} from "../hooks";
import { GetStatusIcon, ShowError } from "../components";

const GetSimpleAuction = ({
  activeChain,
  contractAddress,
  contractABI,
  account,
}) => {
  const isMounted = useIsMounted();
  const [disabled, setDisabled] = useState(false);
  const isEnabled = Boolean(
    isMounted && activeChain && account && addressNotZero(contractAddress)
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [input, setInput] = useState({
    newBeneficiary: "",
    endTime: "",
    value: "0",
  });
  const [isErrorInput, setIsErrorInput] = useState({
    newBeneficiary: false,
    endTime: false,
    value: false,
  });

  const {
    data: balance,
    isError: isErrorBalance,
    isSuccess: isSuccessBalance,
    error: errorBalance,
    status: statusBalance,
  } = useBalance({
    addressOrName: contractAddress,
    watch: isEnabled,
    enabled: isEnabled,
  });

  const { beneficiary, auctionEndTime, highestBider, highestBid, ended } =
    useDetailsSimpleAuction(activeChain, contractAddress, contractABI);

  // bid function
  const {
    error: errorBid,
    isError: isErrorBid,
    write: writeBid,
    status: statusBid,
    statusWait: statusBidWait,
  } = useGetFuncWrite(
    "bid",
    activeChain,
    contractAddress,
    contractABI,
    isEnabled
  );

  // withdraw function
  const {
    error: errorWithdraw,
    isError: isErrorWithdraw,
    write: writeWithdraw,
    status: statusWithdraw,
    statusWait: statusWithdrawWait,
  } = useGetFuncWrite(
    "withdraw",
    activeChain,
    contractAddress,
    contractABI,
    isEnabled
  );

  // auctionEnd function
  const {
    error: errorAuctionEnd,
    isError: isErrorAuctionEnd,
    write: writeAuctionEnd,
    status: statusAuctionEnd,
    statusWait: statusAuctionEndWait,
  } = useGetFuncWrite(
    "auctionEnd",
    activeChain,
    contractAddress,
    contractABI,
    isEnabled
  );

  // newAuction function
  const {
    error: errorNewAuction,
    isError: isErrorNewAuction,
    write: writeNewAuction,
    status: statusNewAuction,
    statusWait: statusNewAuctionWait,
  } = useGetFuncWrite(
    "newAuction",
    activeChain,
    contractAddress,
    contractABI,
    isEnabled
  );

  useEffect(() => {
    if (
      statusBalance !== "loading" &&
      statusBid !== "loading" &&
      statusWithdraw !== "loading" &&
      statusAuctionEnd !== "loading" &&
      statusNewAuction !== "loading" &&
      statusBidWait !== "loading" &&
      statusWithdrawWait !== "loading" &&
      statusAuctionEndWait !== "loading" &&
      statusNewAuctionWait !== "loading"
    ) {
      if (disabled) setDisabled(false);
      setInput({ newBeneficiary: "", endTime: "", value: "0" });
    }
    // eslint-disable-next-line
  }, [
    statusBalance,
    statusBid,
    statusWithdraw,
    statusAuctionEnd,
    statusNewAuction,
    statusBidWait,
    statusWithdrawWait,
    statusAuctionEndWait,
    statusNewAuctionWait,
  ]);

  const handleCloseDialog = (event, reason) => {
    if (
      (reason && (reason === "backdropClick" || reason === "escapeKeyDown")) ||
      event.target.value === "cancel"
    ) {
      setOpenDialog(false);
      setInput({ ...input, newBeneficiary: "", endTime: "" });
    } else {
      if (input.newBeneficiary && utils.isAddress(input.newBeneficiary)) {
        if (input.endTime) {
          const currentDate = new Date();
          const localDate = new Date(input.endTime);
          if (localDate > currentDate) {
            const newEndTime = BigNumber.from(localDate.getTime() / 1000);
            setDisabled(true);
            writeNewAuction({ args: [newEndTime, input.newBeneficiary] });
            setOpenDialog(false);
          } else {
            setIsErrorInput({ ...isErrorInput, endTime: true });
          }
        } else {
          setIsErrorInput({ ...isErrorInput, endTime: true });
        }
      } else {
        setIsErrorInput({ ...isErrorInput, newBeneficiary: true });
      }
    }
  };

  const handleValue = (e) => {
    setInput({ ...input, value: e.target.value });
    if (isErrorInput.value) setIsErrorInput({ ...isErrorInput, value: false });
  };

  const handleNewBeneficiary = (e) => {
    setInput({ ...input, newBeneficiary: e.target.value });
    if (isErrorInput.newBeneficiary)
      setIsErrorInput({ ...isErrorInput, newBeneficiary: false });
  };
  const handleEndTime = (e) => {
    setInput({ ...input, endTime: e.target.value });
    if (isErrorInput.endTime)
      setIsErrorInput({ ...isErrorInput, endTime: false });
  };

  const handleBid = () => {
    let localValue = 0;
    if (input.value && input.value !== "" && parseFloat(input.value) > 0) {
      localValue = BigNumber.from(utils.parseEther(input.value));
      setDisabled(true);
      writeBid({ overrides: { value: localValue } });
    } else {
      setIsErrorInput({ ...isErrorInput, value: true });
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

  if (!isMounted) return <></>;
  const currentDate = new Date();
  const auctionEndTimeFormatted = new Date(auctionEndTime).toLocaleString();

  return (
    <Stack
      direction="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      spacing={1}
      padding={1}
    >
      <Typography variant="h6" gutterBottom component="div">
        Simple Auction
      </Typography>

      <Typography>
        Contract Address: {shortenAddress(contractAddress)}{" "}
        {(currentDate > auctionEndTime || ended.toString() === "true") && (
          <>
            <Button
              variant="contained"
              size="small"
              disabled={disabled}
              onClick={() => setOpenDialog(true)}
            >
              New Auction
            </Button>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
              <DialogTitle>Create a new Simple Auction</DialogTitle>
              <DialogContent>
                <TextField
                  error={isErrorInput.newBeneficiary}
                  autoFocus
                  size="small"
                  margin="dense"
                  id="newBeneficiary"
                  helperText="Beneficiary address"
                  type="text"
                  value={input.newBeneficiary}
                  onChange={handleNewBeneficiary}
                  fullWidth
                  required
                  variant="outlined"
                />
                <TextField
                  error={isErrorInput.endTime}
                  size="small"
                  margin="dense"
                  id="endTime"
                  helperText="End Time"
                  type="datetime-local"
                  value={input.endTime}
                  required
                  onChange={handleEndTime}
                  variant="outlined"
                />
              </DialogContent>
              <DialogActions>
                <Button size="small" onClick={handleCloseDialog} value="cancel">
                  Cancel
                </Button>
                <Button
                  size="small"
                  disabled={disabled}
                  onClick={handleCloseDialog}
                  startIcon={<GetStatusIcon status={statusNewAuction} />}
                  endIcon={<GetStatusIcon status={statusNewAuctionWait} />}
                >
                  Create
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Typography>
      {isSuccessBalance && (
        <Typography>Balance: {formatBalance(balance?.value)} ETH </Typography>
      )}
      <Typography>Beneficiary: {shortenAddress(beneficiary)}</Typography>
      <Typography>Highest Bider: {shortenAddress(highestBider)}</Typography>
      <Typography>Highest Bid: {formatBalance(highestBid)} ETH</Typography>
      <Typography color={auctionEndTime < currentDate ? "red" : "primary.text"}>
        Auction{" "}
        {auctionEndTime < currentDate ? (
          <>ended at {auctionEndTimeFormatted}</>
        ) : (
          <>End Time: {auctionEndTimeFormatted}</>
        )}
      </Typography>
      <TextField
        error={isErrorInput.value}
        autoFocus
        variant="outlined"
        type="number"
        size="small"
        margin="normal"
        label="Value (ETH)"
        value={input.value}
        required
        onChange={handleValue}
        disabled={disabled}
      />
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        padding={0}
        spacing={1}
      >
        <Button
          variant="contained"
          size="small"
          disabled={disabled}
          onClick={handleBid}
          startIcon={<GetStatusIcon status={statusBid} />}
          endIcon={<GetStatusIcon status={statusBidWait} />}
        >
          Bid?
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={disabled}
          onClick={handleWithdraw}
          startIcon={<GetStatusIcon status={statusWithdraw} />}
          endIcon={<GetStatusIcon status={statusWithdrawWait} />}
        >
          Withdraw?
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={disabled}
          onClick={handleAuctionEnd}
          startIcon={<GetStatusIcon status={statusAuctionEnd} />}
          endIcon={<GetStatusIcon status={statusAuctionEndWait} />}
        >
          End Auction?
        </Button>
      </Stack>
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
      {isErrorNewAuction && (
        <ShowError flag={isErrorNewAuction} error={errorNewAuction} />
      )}
    </Stack>
  );
};

export default GetSimpleAuction;
