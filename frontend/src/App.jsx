import AppRoutes from "./routes/AppRoutes";
import { useState } from "react";
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AppRoutes />
    </>
  )
}

export default App
