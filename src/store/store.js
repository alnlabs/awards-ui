import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cyclesReducer from "./slices/cyclesSlice";
import formsReducer from "./slices/formsSlice";
import nominationsReducer from "./slices/nominationsSlice";
import awardsReducer from "./slices/awardsSlice";
import usersReducer from "./slices/usersSlice";
import reviewsReducer from "./slices/reviewsSlice";
import panelReducer from "./slices/panelSlice";
import criteriaReducer from "./slices/criteriaSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cycles: cyclesReducer,
    forms: formsReducer,
    nominations: nominationsReducer,
    awards: awardsReducer,
    users: usersReducer,
    reviews: reviewsReducer,
    panels: panelReducer,
    criteria: criteriaReducer,
  },
});
