import { Router } from "express";
import {
  register,
  login,
  profile,
  logout,
  sendOTP,
  newOTP,
  forgetPassword,
  resetPassword,
} from "./app/controllers/auth.controller.js";
import { requireAuth } from "./app/middlewares/auth.middleware.js";
import User from "./app/models/user.model.js";
import { createCrud } from "@api-craft/crud-router";
import allowedRoles from "./app/middlewares/allowed_roles.middleware.js";

import { Place } from "./app/models/place.model.js";
import { Event } from "./app/models/event.model.js";
import { Guide } from "./app/models/guide.model.js";
import { Hotel } from "./app/models/hotel.model.js";
import { getNearbyPlaces } from "./app/controllers/place.controller.js";
import { getNearbyHotels } from "./app/controllers/hotel.controller.js";
import { getNearbyEvents } from "./app/controllers/event.controller.js";
import { getNearbyGuides } from "./app/controllers/guide.controller.js";
import { checkOTP } from "./app/middlewares/checkOTP.middleware.js";

const router = Router();

router.post("/register", checkOTP, register);
router.post("/login", login);
router.get("/profile", requireAuth, profile);
router.post("/logout", requireAuth, logout);
router.post("/send-otp", sendOTP);
router.post("/new-otp", newOTP);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

router.use("/places", requireAuth, allowedRoles("admin"), createCrud(Place));
router.use("/events", requireAuth, allowedRoles("admin"), createCrud(Event));
router.use("/guides", requireAuth, allowedRoles("admin"), createCrud(Guide));
router.use("/hotels", requireAuth, allowedRoles("admin"), createCrud(Hotel));
router.use("/users", requireAuth, allowedRoles("admin"), createCrud(User));

router.get("/near/places", requireAuth, getNearbyPlaces);
router.get("/near/hotels", requireAuth, getNearbyHotels);
router.get("/near/events", requireAuth, getNearbyEvents);
router.get("/near/guides", requireAuth, getNearbyGuides);

export default router;
