import App from "./App";
import Providers from "./providers";
import "./styles/app.css";

export default function Root() {
  return (
    <Providers>
      <App />
    </Providers>
  );
}
