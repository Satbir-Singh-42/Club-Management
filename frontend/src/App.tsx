import Home from "./pages/Home/Home.tsx";
import ClubPage from "./pages/ClubPage/ClubPage.tsx";
import ClubProfile from "./pages/ClubProfile/ClubProfile.tsx";
import StudentProfile from "./pages/StudentProfile/StudentProfile.tsx";
import StudentProfileSetup from "./pages/StudentProfileSetup/StudentProfileSetup.tsx";
import Registration from "./pages/Registration/Registration.tsx";
import Event from "./pages/Event/Event.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./components/Login/Login.tsx";
import SignUp from "./components/SignUp/SignUp.tsx";
import Otp from "./components/OTP/OTP.tsx";
import PasswordChange from "./components/PasswordChange/PasswordChange.tsx";
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import Drafts from "./pages/EventDraft/EventDraft.tsx";
import EventForm from "./pages/EventForm/EventForm.tsx";
import CreateEventPost from "./pages/CreateEventPost/CreateEventPost.tsx";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword.tsx";
import { getToken, isLoggedIn } from "./utils/getLoginDetails.ts";
import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import AdminLayout from "./layouts/AdminLayout.tsx";
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard.tsx";
import SuperAdminAllUser from "./pages/SuperAdmin/SuperAdminAllUser.tsx";
import SuperAdminAllClub from "./pages/SuperAdmin/SuperAdminAllClub.tsx";
import SuperAdminRegisterUser from "./pages/SuperAdmin/SuperAdminRegisterUser.tsx";
import SuperAdminRegisterClub from "./pages/SuperAdmin/SuperAdminRegisterClub.tsx";

const App = () => {
  const [loginStatus, setLoginStatus] = useState(isLoggedIn());
  const [userType, setUserType] = useState(getToken()?.userType);

  useEffect(() => {
    const checkLoginStatus = () => {
      setLoginStatus(isLoggedIn());
      setUserType(getToken()?.userType);
    };

    // Listen for any changes to login status
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Auth routes */}
        <Route
          path="/login"
          element={
            loginStatus ? (
              <Navigate to="/" />
            ) : (
              <Login
                setUserType={setUserType}
                setLoginStatus={setLoginStatus}
              />
            )
          }
        />
        <Route
          path="/register"
          element={loginStatus ? <Navigate to="/" /> : <SignUp />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/reset-password" element={<PasswordChange />} />

        {/* Protected routes */}
        <Route
          path="/clubpage"
          element={!loginStatus ? <Navigate to="/login" /> : <ClubPage />}
        />
        <Route
          path="/clubprofile"
          element={
            !loginStatus || userType === "student" ? (
              <Navigate to="/login" />
            ) : (
              <ClubProfile />
            )
          }
        />
        <Route
          path="/studentprofile"
          element={
            !loginStatus || userType === "club" ? (
              <Navigate to="/login" />
            ) : (
              <StudentProfile />
            )
          }
        />
        <Route
          path="/studentprofile/setup"
          element={
            !loginStatus || userType === "club" ? (
              <Navigate to="/login" />
            ) : (
              <StudentProfileSetup />
            )
          }
        />
        <Route
          path="/registration"
          element={
            !loginStatus || userType === "student" ? (
              <Navigate to="/login" />
            ) : (
              <Registration />
            )
          }
        />
        <Route
          path="/event/:event_id"
          element={!loginStatus ? <Navigate to="/login" /> : <Event />}
        />
        <Route
          path="/event-form"
          element={
            !loginStatus || userType === "student" ? (
              <Navigate to="/login" />
            ) : (
              <EventForm />
            )
          }
        />
        <Route
          path="/event-form/:event_id"
          element={
            !loginStatus || userType === "student" ? (
              <Navigate to="/login" />
            ) : (
              <EventForm />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            !loginStatus || userType === "student" ? (
              <Navigate to="/login" />
            ) : (
              <Dashboard />
            )
          }
        />
        <Route
          path="/create-event"
          element={
            !loginStatus || userType === "student" ? (
              <Navigate to="/login" />
            ) : (
              <CreateEventPost />
            )
          }
        />
        <Route
          path="/EventDraft"
          element={
            !loginStatus || userType === "student" ? (
              <Navigate to="/login" />
            ) : (
              <Drafts />
            )
          }
        />

        {/* Super Admin routes */}
        <Route path="/superadmin" element={<AdminLayout />}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="users" element={<SuperAdminAllUser />} />
          <Route path="clubs" element={<SuperAdminAllClub />} />
          <Route path="register-user" element={<SuperAdminRegisterUser />} />
          <Route path="register-club" element={<SuperAdminRegisterClub />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
