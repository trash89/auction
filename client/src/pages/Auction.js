import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import { useNetwork, useAccount } from "wagmi";
import { addressNotZero } from "../utils/utils";

import {
  SupportedNetworks,
  GetContract,
  GetSimpleAuction,
} from "../components";
import { useIsMounted } from "../hooks";

const Auction = () => {
  const isMounted = useIsMounted();
  const { activeChain } = useNetwork();

  const { contractAddress, contractABI } = GetContract("SimpleAuction");
  const {
    data: account,
    error: errorAccount,
    isError: isErrorAccount,
    isLoading: isLoadingAccount,
  } = useAccount({
    enabled: Boolean(activeChain && addressNotZero(contractAddress)),
  });

  if (!activeChain) return <SupportedNetworks />;
  if (isLoadingAccount) return <div>Loading account…</div>;
  if (isErrorAccount)
    return <div>Error loading account: {errorAccount?.message}</div>;
  if (!addressNotZero(contractAddress))
    return (
      <div>Contract not deployed on this network : {activeChain?.name}</div>
    );

  return (
    <>
      {isMounted && (
        <Grid container direction="row" padding={1} spacing={1}>
          <Grid item>
            <Paper elevation={4}>
              <GetSimpleAuction
                activeChain={activeChain}
                contractAddress={contractAddress}
                contractABI={contractABI}
                account={account}
              />
            </Paper>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default Auction;
