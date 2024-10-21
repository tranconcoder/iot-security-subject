import { createBrowserRouter } from "react-router-dom";

// Pages
import HomePage from "../pages/Home/index.page";

const router = createBrowserRouter([
    {
        path: "*",
        element: <h1>404, Not found!</h1>,
    },
    {
        path: "/",
        element: <HomePage />,
    },
]);

export default router;
