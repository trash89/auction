import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  SimpleAuctionContainer,
  BlindAuctionContainer,
  SharedLayout,
  Error,
} from "./pages";
import { useIsMounted } from "./hooks";

function App() {
  const isMounted = useIsMounted();
  if (!isMounted) return <></>;
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SharedLayout />}>
            <Route index element={<SimpleAuctionContainer />} />
            <Route path="/simpleauction" element={<SimpleAuctionContainer />} />
            <Route path="/blindauction" element={<BlindAuctionContainer />} />
            <Route path="*" element={<Error />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
