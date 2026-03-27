import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./SignIn";
import SignUp from "./Signup";
import AccountCreated from "./AccountCreated";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/account-created" element={<AccountCreated />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} /> {/* placeholder */}
      </Routes>
    </Router>
  );
}

export default App;