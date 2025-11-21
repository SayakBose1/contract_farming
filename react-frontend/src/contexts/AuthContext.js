import React, {
    createContext,
    useContext,
    useReducer,
    useEffect
} from "react";
import api from "../services/api";

const AuthContext = createContext();

const initialState = {
    user: null,
    token: localStorage.getItem("token"),
    loading: true,
    error: null
};

// NORMALIZE user object from backend → frontend structure
const normalizeUser = (user) => {
    if (!user) return null;

    return {
        id: user.id,
        mobile_number: user.mobile_number,
        full_name: user.full_name || user.name || "",
        email_id: user.email_id || user.email || "",
        address: user.address || "",
        user_type: user.user_type,
        is_active: user.is_active ?? true
    };
};

const authReducer = (state, action) => {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, loading: action.payload };

        case "LOGIN_SUCCESS":
            localStorage.setItem("token", action.payload.token);
            return {
                ...state,
                user: normalizeUser(action.payload.user),
                token: action.payload.token,
                loading: false,
                error: null
            };

        case "LOGIN_FAILURE":
            localStorage.removeItem("token");
            return {
                ...state,
                user: null,
                token: null,
                loading: false,
                error: action.payload
            };

        case "LOGOUT":
            localStorage.removeItem("token");
            return { ...state, user: null, token: null, loading: false, error: null };

        case "UPDATE_USER":
            return {
                ...state,
                user: { ...state.user, ...normalizeUser(action.payload) }
            };

        case "SET_USER":
            return {
                ...state,
                user: normalizeUser(action.payload)
            };

        case "CLEAR_ERROR":
            return { ...state, error: null };

        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check login status on load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                dispatch({ type: "SET_LOADING", payload: false });
                return;
            }

            try {
                const response = await api.get("/auth/me");

                dispatch({
                    type: "LOGIN_SUCCESS",
                    payload: { user: response.data.user, token }
                });
            } catch (error) {
                if (error.response?.status === 401) {
                    dispatch({ type: "LOGOUT" });
                } else {
                    dispatch({ type: "SET_LOADING", payload: false });
                }
            }
        };

        checkAuth();
    }, []);

    // LOGIN
    const login = async (mobile_number, pass_key) => {
        try {
            dispatch({ type: "SET_LOADING", payload: true });

            const response = await api.post("/auth/login", {
                mobile_number,
                pass_key
            });

            dispatch({
                type: "LOGIN_SUCCESS",
                payload: { user: response.data.user, token: response.data.token }
            });

            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || "Login failed";
            dispatch({ type: "LOGIN_FAILURE", payload: msg });
            return { success: false, error: msg };
        }
    };

    // LOGOUT
    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch {}
        dispatch({ type: "LOGOUT" });
    };

    // UPDATE PROFILE
    const updateProfile = async (profileData) => {
        try {
            const response = await api.put("/auth/profile", profileData);

            dispatch({
                type: "UPDATE_USER",
                payload: response.data.user
            });

            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || "Profile update failed";
            return { success: false, error: msg };
        }
    };

    // CHANGE PASSWORD
    const changePassword = async (passwordData) => {
        try {
            await api.post("/auth/change-password", passwordData);
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || "Password change failed";
            return { success: false, error: msg };
        }
    };

    // Allow Profile.js to set user manually
    const setUser = (userObj) => {
        dispatch({ type: "SET_USER", payload: userObj });
    };

    const value = {
        user: state.user,
        token: state.token,
        loading: state.loading,
        error: state.error,
        login,
        logout,
        updateProfile,
        changePassword,
        clearError: () => dispatch({ type: "CLEAR_ERROR" }),
        setUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
