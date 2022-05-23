import React from "react";
import ReactDOM from "react-dom";
import "normalize.css";
import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";
import App from "./App";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

import { createTheme, ThemeProvider } from "@mui/material/styles";

import {
  apiProvider,
  configureChains,
  RainbowKitProvider,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import { createClient, chain, WagmiProvider } from "wagmi";

// if (
//   !process.env.REACT_APP_RINKEBY_URL ||
//   !process.env.REACT_APP_KOVAN_URL ||
//   !process.env.REACT_APP_GRAPH_URL
// )
//   throw new Error(
//     "Missing environment variables. Make sure to set your .env file."
//   );

const { provider, chains } = configureChains(
  [chain.hardhat],
  [apiProvider.alchemy(process.env.ALCHEMY_ID), apiProvider.fallback()]
);

const { connectors } = getDefaultWallets({
  appName: "Auction Ethereum App, with Wagmi,Rainbowkit and Material-UI",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: process.env.REACT_APP_GRAPH_URL,
});

export const themeOptions = {
  palette: {
    type: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "rgb(220, 0, 78)",
    },
    background: {
      default: "#fff",
      paper: "#fff",
    },
  },
  overrides: {
    MuiAppBar: {
      colorInherit: {
        backgroundColor: "#689f38",
        color: "#fff",
      },
    },
    MuiButton: {
      root: {
        background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
        border: 0,
        borderRadius: 3,
        boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
        color: "white",
        height: 48,
        padding: "0 30px",
      },
    },
  },
  props: {
    MuiList: {
      dense: true,
    },
    MuiMenuItem: {
      dense: true,
    },
    MuiTable: {
      size: "small",
    },
    MuiButton: {
      size: "small",
    },
    MuiIconButton: {
      size: "small",
    },
    MuiInputBase: {
      margin: "dense",
    },
    MuiTextField: {
      margin: "dense",
      size: "small",
    },
  },
};

const theme = createTheme(themeOptions);

ReactDOM.render(
  // <React.StrictMode>
  <WagmiProvider client={wagmiClient}>
    <RainbowKitProvider chains={chains}>
      <ApolloProvider client={apolloClient}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </ApolloProvider>
    </RainbowKitProvider>
  </WagmiProvider>,
  // </React.StrictMode>,
  document.getElementById("root")
);
