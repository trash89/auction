import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimpleAuction, Error } from "./pages";
import { MenuAppBar } from "./components";
import { useIsMounted } from "./hooks";

function App() {
  const isMounted = useIsMounted();
  if (!isMounted) return <></>;
  return (
    <>
      <MenuAppBar />
      <BrowserRouter>
        <Routes>
          <Route index element={<SimpleAuction />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
