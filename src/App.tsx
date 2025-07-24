import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import routes from "@/routes/routes";
import { Toaster } from "react-hot-toast";
import Loader from "@/components/Loader";

const AppRoutes = () => useRoutes(routes);

const App = () => (
    <>
      <Loader />
      <Router>
        <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </>
);

export default App;
