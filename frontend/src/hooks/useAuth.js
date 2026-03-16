import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { clearAuth, selectAuth, setAuth } from "../store/authSlice.js";

export function useAuth() {
  const auth = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return {
    ...auth,
    login(payload) {
      dispatch(setAuth(payload));
      navigate("/");
    },
    logout() {
      dispatch(clearAuth());
      navigate("/login");
    }
  };
}
