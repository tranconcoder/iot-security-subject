import "./assets/scss/reset.scss";
import "./assets/scss/base.scss";
import "./utils/string.util";
// Fonts 
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


import { RouterProvider } from "react-router";
import router from "./configs/routes.config";

function App() {
    return <RouterProvider router={router} />;
}

export default App;
