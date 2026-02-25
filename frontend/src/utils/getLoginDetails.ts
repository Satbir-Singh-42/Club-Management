import {jwtDecode, JwtPayload } from "jwt-decode";

// Extend JwtPayload interface to include custom properties like 'type'
interface CustomJwtPayload extends JwtPayload {
    type: "student" | "club" | "superadmin"; // Specify possible types based on your backend response
    sub: string; // The 'sub' field can be the email, for example
  }

export const getToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
        const decodedToken = jwtDecode<CustomJwtPayload>(token);
        return { token, userType: decodedToken.type, email: decodedToken.sub };
    }
    return null;
};

export const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    // Optionally check if the token has expired
    const decodedToken = jwtDecode(token);
    const expiry = decodedToken.exp! * 1000; // convert to ms
    if (expiry < Date.now()) {
        localStorage.removeItem("token");
        return false;
    }
    return true;
};

export const logout = () => {
    localStorage.removeItem("token");
};
