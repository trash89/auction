import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";

import { useNetwork, useAccount } from "wagmi";
import { addressNotZero } from "../utils/utils";

import { SupportedNetworks, GetSimpleAuction } from "../components";
import { useIsMounted, useGetContract } from "../hooks";

const SimpleAuction = () => {
  const isMounted = useIsMounted();
  const { activeChain } = useNetwork();

  const { address: contractAddress, ABI: contractABI } =
    useGetContract("SimpleAuction");
  const {
    data: account,
    error: errorAccount,
    isError: isErrorAccount,
    isLoading: isLoadingAccount,
  } = useAccount({
    enabled: Boolean(
      isMounted && activeChain && addressNotZero(contractAddress)
    ),
  });

  if (!isMounted) return <></>;
  if (!activeChain) return <SupportedNetworks />;
  if (isLoadingAccount) return <div>Loading account…</div>;
  if (isErrorAccount)
    return <div>Error loading account: {errorAccount?.message}</div>;
  if (!addressNotZero(contractAddress))
    return (
      <div>Contract not deployed on this network : {activeChain?.name}</div>
    );

  return (
    <Stack
      direction="row"
      spacing={1}
      padding={1}
      justifyContent="flex-start"
      alignItems="flex-start"
    >
      <Paper elevation={4}>
        <GetSimpleAuction
          activeChain={activeChain}
          contractAddress={contractAddress}
          contractABI={contractABI}
          account={account}
        />
      </Paper>
    </Stack>
  );
};

export default SimpleAuction;
