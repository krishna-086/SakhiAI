import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MobileHome from "./pages/MobileHome";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import VoiceScreen from "./pages/VoiceScreen";
import ResultScreen from "./pages/ResultScreen";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<MobileHome />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/alerts"
          element={<Alerts />}
        />

        <Route
          path="/voice"
          element={<VoiceScreen />}
        />

        <Route
          path="/result"
          element={<ResultScreen />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        
      </Routes>
    </BrowserRouter>
  );
}

export default App;