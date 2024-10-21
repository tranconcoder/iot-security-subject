import "./assets/scss/reset.scss";
import "./assets/scss/base.scss";
import "./utils/string.util";

import { RouterProvider } from "react-router";
import router from "./configs/routes.config";

function App() {
    return <RouterProvider router={router} />;
}

export default App;
