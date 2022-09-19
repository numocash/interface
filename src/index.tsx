import "@rainbow-me/rainbowkit/styles.css";

import { createRoot } from "react-dom/client";

import { AppWithProviders } from "./AppWithProviders";
import * as serviceWorker from "./serviceWorker";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("root")!);

root.render(<AppWithProviders />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
