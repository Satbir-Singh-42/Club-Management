"use client"
import Home from "./pages/Home/Home.tsx";
import ClubPage from "./pages/ClubPage/ClubPage.tsx";
import ClubProfile from "./pages/ClubProfile/ClubProfile.tsx";
import StudentProfile from "./pages/StudentProfileSetup/StudentProfileSetup.tsx";
import Registration from "./pages/Registration/Registration.tsx";
import Event from "./pages/Event/Event.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./components/Login/Login.tsx";
import SignUp from "./components/SignUp/SignUp.tsx";
import Otp from "./components/OTP/OTP.tsx";
import PasswordChange from "./components/PasswordChange/PasswordChange.tsx";
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import SuperAdmin from "./pages/SuperAdmin/SuperAdminDashboard.tsx";
import Drafts from "./pages/EventDraft/EventDraft.tsx";
import EventForm from "./pages/EventForm/EventForm.tsx";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword.tsx";
import { getToken, isLoggedIn } from "./utils/getLoginDetails.ts";
import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./layouts/AdminLayout.tsx";
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard.tsx";
import SuperAdminAllUser from "./pages/SuperAdmin/SuperAdminAllUser.tsx";
import SuperAdminAllClub from "./pages/SuperAdmin/SuperAdminAllClub.tsx";
import SuperAdminRegisterUser from "./pages/SuperAdmin/SuperAdminRegisterUser.tsx";
import SuperAdminRegisterClub from "./pages/SuperAdmin/SuperAdminRegisterClub.tsx";

const App = () => {

  const [loginStatus, setLoginStatus] = useState(isLoggedIn());
  const [userType, setUserType] = useState(getToken()?.userType);
 
  // getUserDetails 
  const getUserDetails = async() => {
    // fetch user details from server
    try {
      const response = await axios.get("http://localhost:8000/auth/me",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response)
      // set user details in state
    } catch (err: any) {
      console.log(`Failed to load user details:${err}`);
    } finally {
    }
  }
  useEffect(()=>{
      getUserDetails(); 
  },[])

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
    // Added return statement here
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={loginStatus?<Home />:<Navigate to={"/login"}/>} /> */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        {/* not completed */}
        <>
        <Route path="/login" element={loginStatus?<Navigate to={"/"}/>:<Login setUserType={setUserType} setLoginStatus={setLoginStatus}/>} /> 
        <Route path="/register" element={loginStatus?<Navigate to={"/"}/>:<SignUp />} />
        </>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/reset-password" element={<PasswordChange />} />
        {/* need to change cards */}
      { // loginStatus && 
        <>
        {/* <Route path="/clubpage" element={!loginStatus?<Navigate to={"/login"}/>:(userType==="club" || userType==="superadmin")?<ClubPage />:<Navigate to={"/"}/>} /> */}
        <Route path="/clubpage" element={!loginStatus?<Navigate to={"/login"}/>:<ClubPage />} />
        <Route path="/clubprofile" element={!loginStatus || (userType=="student")?<Navigate to={"/login"}/>:<ClubProfile />} />
        <Route path="/studentprofile" element={!loginStatus || (userType=="club")?<Navigate to={"/login"}/>:<StudentProfile />} />
        <Route path="/registration" element={!loginStatus || (userType=="student")?<Navigate to={"/login"}/>:<Registration />} />
        <Route path="/event/:event_id" element={!loginStatus?<Navigate to={"/login"}/>:<Event />} />
        {/* navbar issue */}
        <Route path="/event-form/:event_id" element={!loginStatus || (userType=="student")?<Navigate to={"/login"}/>:<EventForm />} />


        {/* club dashboard navabr to be made  */}
        <Route path="/dashboard" element={!loginStatus || (userType=="student")?<Navigate to={"/login"}/>:<Dashboard />} />

        <Route path="/EventDraft" element={!loginStatus || (userType=="student")?<Navigate to={"/login"}/>:<Drafts />} />
        
        {/* neerabh will make it  */}
        {/* <Route path="/SuperAdmin" element={!loginStatus || userType=="student" || userType=="club"?<Navigate to={"/login"}/>:<SuperAdmin />} /> */}
        
        <Route path="/superadmin" element={<AdminLayout />}>
          <Route path="/superadmin/" element={<SuperAdminDashboard />} /> {/* Matches "/admin" */}
          <Route path="/superadmin/users" element={<SuperAdminAllUser />} /> {/* Matches "/admin/users" */}
          <Route path="/superadmin/clubs" element={<SuperAdminAllClub />} /> {/* Matches "/admin/users" */}
          <Route path="/superadmin/register-user" element={<SuperAdminRegisterUser />} /> {/* Matches "/admin/users" */}
          <Route path="/superadmin/register-club" element={<SuperAdminRegisterClub/>} /> {/* Matches "/admin/users" */}
        </Route>
        </>
      }
      </Routes>
    </BrowserRouter>
  );
};

export default App;
