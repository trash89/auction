import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

import { ConnectButton } from "@rainbow-me/rainbowkit";

const MenuAppBar = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <a href="/">
            <IconButton
              size="large"
              edge="start"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          </a>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Auction
          </Typography>
          <ConnectButton />
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default MenuAppBar;
