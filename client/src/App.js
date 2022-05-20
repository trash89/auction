import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auction, Error } from "./pages";
import { MenuAppBar } from "./components";
import { useIsMounted } from "./hooks";

function App() {
  const isMounted = useIsMounted();
  if (!isMounted) return <></>;
  return (
    <>
      {isMounted && (
        <>
          <MenuAppBar />
          <BrowserRouter>
            <Routes>
              <Route index element={<Auction />} />
              <Route path="*" element={<Error />} />
            </Routes>
          </BrowserRouter>
        </>
      )}
    </>
  );
}

export default App;
