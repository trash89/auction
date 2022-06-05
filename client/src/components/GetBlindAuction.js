import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
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
  useDetailsBlindAuction,
  useGetFuncWrite,
} from "../hooks";
import { GetStatusIcon, ShowError } from "../components";

const GetBlindAuction = ({
  activeChain,
  contractAddress,
  contractABI,
  account,
}) => {
  const isMounted = useIsMounted();
  const isEnabled = Boolean(
    isMounted && activeChain && account && addressNotZero(contractAddress)
  );
  const [disabled, setDisabled] = useState(false);
  const [input, setInput] = useState({
    newBeneficiary: "",
    newBiddingEnd: "",
    newRevealEnd: "",
    value: "0",
  });
  const [isErrorInput, setIsErrorInput] = useState({
    newBeneficiary: false,
    newBiddingEnd: false,
    newRevealEnd: false,
    value: false,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [params, setParams] = useState({
    value: "0",
    fake: false,
    secret: "",
  });
  const [isErrorParams, setIsErrorParams] = useState({
    value: false,
    fake: false,
    secret: false,
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

  const {
    beneficiary,
    highestBider,
    highestBid,
    biddingEnd,
    revealEnd,
    ended,
  } = useDetailsBlindAuction(activeChain, contractAddress, contractABI);

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

  // reveal function
  const {
    error: errorReveal,
    isError: isErrorReveal,
    write: writeReveal,
    status: statusReveal,
    statusWait: statusRevealWait,
  } = useGetFuncWrite(
    "reveal",
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
      statusReveal !== "loading" &&
      statusAuctionEnd !== "loading" &&
      statusNewAuction !== "loading" &&
      statusBidWait !== "loading" &&
      statusWithdrawWait !== "loading" &&
      statusRevealWait !== "loading" &&
      statusAuctionEndWait !== "loading" &&
      statusNewAuctionWait !== "loading"
    ) {
      if (disabled) setDisabled(false);
      setInput({
        newBeneficiary: "",
        newBiddingEnd: "",
        newRevealEnd: "",
        value: "0",
      });
      setParams({ value: "0", fake: false, secret: "" });
    }
    // eslint-disable-next-line
  }, [
    statusBalance,
    statusBid,
    statusWithdraw,
    statusReveal,
    statusAuctionEnd,
    statusNewAuction,
    statusBidWait,
    statusWithdrawWait,
    statusRevealWait,
    statusAuctionEndWait,
    statusNewAuctionWait,
  ]);

  const currentDate = new Date();
  const biddingEndFormatted = new Date(biddingEnd).toLocaleString();
  const revealEndFormatted = new Date(revealEnd).toLocaleString();

  const fakes = [
    { value: false, label: "false" },
    { value: true, label: "true" },
  ];
  const handleValue = (e) => {
    setInput({ ...input, value: e.target.value });
    if (isErrorInput.value) setIsErrorInput({ ...isErrorInput, value: false });
  };

  const handleNewBeneficiary = (e) => {
    setInput({ ...input, newBeneficiary: e.target.value });
    if (isErrorInput.newBeneficiary)
      setIsErrorInput({ ...isErrorInput, newBeneficiary: false });
  };
  const handleNewBiddingEnd = (e) => {
    setInput({ ...input, newBiddingEnd: e.target.value });
    if (isErrorInput.newBiddingEnd)
      setIsErrorInput({ ...isErrorInput, newBiddingEnd: false });
  };
  const handleNewRevealEnd = (e) => {
    setInput({ ...input, newRevealEnd: e.target.value });
    if (isErrorInput.newRevealEnd)
      setIsErrorInput({ ...isErrorInput, newRevealEnd: false });
  };

  const handleBid = () => {
    if (input.value && input.value !== "" && parseFloat(input.value) > 0) {
      if (params.value && params.value !== "" && parseFloat(params.value) > 0) {
        if (params.fake === true || params.fake === false) {
          if (params.secret && params.secret !== "") {
            const localValue = utils.parseEther(input.value);
            const formattedParamsValue = utils.parseEther(params.value);
            const formattedParamsFake =
              params.fake === true ? BigNumber.from("1") : BigNumber.from("0");
            const formattedParamsSecret = utils.formatBytes32String(
              params.secret
            );
            const dataHex = utils.solidityKeccak256(
              ["uint256", "bool", "bytes32"],
              [formattedParamsValue, formattedParamsFake, formattedParamsSecret]
            );
            setDisabled(true);
            writeBid({
              args: [dataHex],
              overrides: { value: localValue, gasLimit: 6721975 },
            });
          } else {
            setIsErrorParams({ ...isErrorParams, secret: true });
          }
        } else {
          setIsErrorParams({ ...isErrorParams, fake: true });
        }
      } else {
        setIsErrorParams({ ...isErrorParams, value: true });
      }
    } else {
      setIsErrorInput({ ...isErrorInput, value: true });
    }
  };

  const handleReveal = () => {
    if (params.value && params.value !== "" && parseFloat(params.value) > 0) {
      if (params.fake === true || params.fake === false) {
        if (params.secret && params.secret !== "") {
          const formattedParamsValue = utils.parseEther(params.value);
          const formattedParamsFake =
            params.fake === true ? BigNumber.from("1") : BigNumber.from("0");
          const formattedParamsSecret = utils.formatBytes32String(
            params.secret
          );
          setDisabled(true);
          writeReveal({
            args: [
              [formattedParamsValue],
              [formattedParamsFake],
              [formattedParamsSecret],
            ],
            overrides: { gasLimit: 6721975 },
          });
        } else {
          setIsErrorParams({ ...isErrorParams, secret: true });
        }
      } else {
        setIsErrorParams({ ...isErrorParams, fake: true });
      }
    } else {
      setIsErrorParams({ ...isErrorParams, value: true });
    }
  };

  const handleWithdraw = () => {
    setDisabled(true);
    writeWithdraw({
      overrides: { gasLimit: 6721975 },
    });
  };

  const handleAuctionEnd = () => {
    setDisabled(true);
    writeAuctionEnd({
      overrides: { gasLimit: 6721975 },
    });
  };

  const handleCloseDialog = (event, reason) => {
    if (
      (reason && (reason === "backdropClick" || reason === "escapeKeyDown")) ||
      event.target.value === "cancel"
    ) {
      setOpenDialog(false);
      setInput({
        newBeneficiary: "",
        newBiddingEnd: "",
        newRevealEnd: "",
        value: "0",
      });
    } else {
      if (
        input.newBeneficiary &&
        input.newBeneficiary !== "" &&
        utils.isAddress(input.newBeneficiary)
      ) {
        if (input.newBiddingEnd && input.newBiddingEnd !== "") {
          if (input.newRevealEnd && input.newRevealEnd !== "") {
            try {
              const localDateB = new Date(input.newBiddingEnd);
              try {
                const localDateR = new Date(input.newRevealEnd);
                const currentDate = new Date();
                if (localDateB < localDateR && currentDate < localDateB) {
                  const BNBiddingEnd = BigNumber.from(
                    localDateB.getTime() / 1000
                  );
                  const BNRevealEnd = BigNumber.from(
                    localDateR.getTime() / 1000
                  );
                  setDisabled(true);
                  writeNewAuction({
                    args: [BNBiddingEnd, BNRevealEnd, input.newBeneficiary],
                  });
                  setOpenDialog(false);
                } else {
                  setIsErrorInput({ ...isErrorInput, newBiddingEnd: true });
                  setIsErrorInput({ ...isErrorInput, newRevealEnd: true });
                }
              } catch (error) {
                setIsErrorInput({ ...isErrorInput, newRevealEnd: true });
              }
            } catch (error) {
              setIsErrorInput({ ...isErrorInput, newBiddingEnd: true });
            }
          } else {
            setIsErrorInput({ ...isErrorInput, newRevealEnd: true });
          }
        } else {
          setIsErrorInput({ ...isErrorInput, newBiddingEnd: true });
        }
      } else {
        setIsErrorInput({ ...isErrorInput, newBeneficiary: true });
      }
    }
  };

  if (!isMounted) return <></>;
  return (
    <Stack
      direction="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      spacing={1}
      padding={1}
    >
      <Typography variant="h6" gutterBottom component="div">
        Blind Auction
      </Typography>
      <Typography>
        Contract Address: {shortenAddress(contractAddress)}{" "}
        {(currentDate > revealEnd || ended.toString() === "true") && (
          <>
            <Button
              variant="contained"
              size="small"
              disabled={disabled}
              onClick={() => setOpenDialog(true)}
              startIcon={<GetStatusIcon status={statusNewAuction} />}
              endIcon={<GetStatusIcon status={statusNewAuctionWait} />}
            >
              New Auction
            </Button>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
              <DialogTitle>Create a new Blind Auction</DialogTitle>
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
                  error={isErrorInput.newBiddingEnd}
                  size="small"
                  margin="dense"
                  id="biddingEnd"
                  helperText="Bidding End Time"
                  type="datetime-local"
                  value={input.newBiddingEnd}
                  required
                  onChange={handleNewBiddingEnd}
                  variant="outlined"
                />
                <TextField
                  error={isErrorInput.newRevealEnd}
                  size="small"
                  margin="dense"
                  id="revealEnd"
                  helperText="Reveal End Time"
                  type="datetime-local"
                  value={input.newRevealEnd}
                  required
                  onChange={handleNewRevealEnd}
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
      <Typography color={biddingEnd > currentDate ? "primary.text" : "red"}>
        Bidding End : {biddingEndFormatted}
      </Typography>
      <Typography color={revealEnd > currentDate ? "primary.text" : "red"}>
        Reveal End : {revealEndFormatted}
      </Typography>
      <Typography color={ended.toString() === "true" ? "red" : "primary.text"}>
        Ended? : {ended.toString()}
      </Typography>

      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        padding={0}
        spacing={1}
      >
        <TextField
          error={isErrorParams.value}
          autoFocus
          variant="outlined"
          size="small"
          type="number"
          label="Value (ETH)"
          value={params.value}
          onChange={(e) => setParams({ ...params, value: e.target.value })}
          disabled={disabled}
        />
        <TextField
          error={isErrorParams.fake}
          variant="outlined"
          size="small"
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
          error={isErrorParams.secret}
          variant="outlined"
          size="small"
          type="text"
          label="Secret"
          value={params.secret}
          onChange={(e) => setParams({ ...params, secret: e.target.value })}
          disabled={disabled}
        />
      </Stack>

      <TextField
        error={isErrorInput.value}
        variant="outlined"
        type="number"
        size="small"
        label="Value to deposit in contract (ETH)"
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
        {biddingEnd > currentDate && (
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
        )}
        {revealEnd > currentDate && currentDate > biddingEnd && (
          <Button
            variant="contained"
            size="small"
            disabled={disabled}
            onClick={handleReveal}
            startIcon={<GetStatusIcon status={statusReveal} />}
            endIcon={<GetStatusIcon status={statusRevealWait} />}
          >
            Reveal?
          </Button>
        )}
        {parseInt(balance?.toString()) > 0 && (
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
        )}
        {revealEnd < currentDate &&
          currentDate < biddingEnd &&
          ended.toString() === "false" && (
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
          )}
      </Stack>
      {isErrorBalance && (
        <ShowError flag={isErrorBalance} error={errorBalance} />
      )}
      {isErrorBid && <ShowError flag={isErrorBid} error={errorBid} />}
      {isErrorWithdraw && (
        <ShowError flag={isErrorWithdraw} error={errorWithdraw} />
      )}
      {isErrorReveal && <ShowError flag={isErrorReveal} error={errorReveal} />}
      {isErrorAuctionEnd && (
        <ShowError flag={isErrorAuctionEnd} error={errorAuctionEnd} />
      )}
      {isErrorNewAuction && (
        <ShowError flag={isErrorNewAuction} error={errorNewAuction} />
      )}
    </Stack>
  );
};

export default GetBlindAuction;
