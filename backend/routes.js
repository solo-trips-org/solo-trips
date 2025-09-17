import { Router } from "express";
import {
  register,
  login,
  profile,
  logout,
  sendOTP,
  newOTP,
  resetPasswordWithOTP,
} from "./app/controllers/auth.controller.js";
import {
  uploadMedia,
  listMedia,
  deleteMedia,
  uploadMiddleware,
  getPrivateMediaUrl,
} from "./app/controllers/media.controller.js";
import { requireAuth } from "./app/middlewares/auth.middleware.js";
import User from "./app/models/user.model.js";
import { createCrud } from "@api-craft/crud-router";
import allowedRoles from "./app/middlewares/allowed_roles.middleware.js";
import { updateProfile } from "./app/controllers/user.controller.js";
import { Place } from "./app/models/place.model.js";
import { Event } from "./app/models/event.model.js";
import { Guide } from "./app/models/guide.model.js";
import { getNearbyPlaces } from "./app/controllers/place.controller.js";
import { getNearbyHotels } from "./app/controllers/hotel.controller.js";
import { getNearbyEvents } from "./app/controllers/event.controller.js";
import { getNearbyGuides } from "./app/controllers/guide.controller.js";
import { checkOTP } from "./app/middlewares/checkOTP.middleware.js";
import { getDashboardAnalytics } from "./app/controllers/dashboard.controller.js";
import { globalSearch } from "./app/controllers/search.controller.js";
import {
  addEventRating,
  addGuideRating,
  addHotelRating,
  addPlaceRating,
  getEventRatings,
  getGuideRatings,
  getHotelRatings,
  getPlaceRatings,
} from "./app/controllers/rating.controller.js";
import {
  createPath,
  findOptimalPathWithWaypoints,
  getPaths,
} from "./app/controllers/paths.controller.js";
import {
  getGlobalSettings,
  getOneGlobalSetting,
  updateGlobalSetting,
} from "./app/controllers/settings.controller.js";

const router = Router();

//----------------- Auth Routes --------------------//
router.post("/register", checkOTP, register);
router.post("/login", login);
router.get("/profile", requireAuth, profile);
router.post("/profile", requireAuth, updateProfile);
router.post("/logout", requireAuth, logout);
router.post("/send-otp", sendOTP);
router.post("/new-otp", newOTP);
router.post("/forget-password", resetPasswordWithOTP);

router.use("/places", requireAuth, allowedRoles("admin"), createCrud(Place));
router.use("/events", requireAuth, allowedRoles("admin"), createCrud(Event));
router.use("/guides", requireAuth, allowedRoles("admin"), createCrud(Guide));
router.use("/users", requireAuth, allowedRoles("admin"), createCrud(User));

//----------------- NearBy Finding Routes ---------------------//
router.get("/near/places", requireAuth, getNearbyPlaces);
router.get("/near/hotels", requireAuth, getNearbyHotels);
router.get("/near/events", requireAuth, getNearbyEvents);
router.get("/near/guides", requireAuth, getNearbyGuides);

router.get(
  "/analytics",
  requireAuth,
  allowedRoles("admin"),
  getDashboardAnalytics
);
router.get("/search", requireAuth, globalSearch);

//-------------------------- Ratings Routes ------------------------//
router.post("/ratings/place", addPlaceRating);
router.post("/ratings/hotel", addHotelRating);
router.post("/ratings/event", addEventRating);
router.post("/ratings/guide", addGuideRating);
router.get("/ratings/place/:placeId", getPlaceRatings);
router.get("/ratings/hotel/:hotelId", getHotelRatings);
router.get("/ratings/event/:eventId", getEventRatings);
router.get("/ratings/guide/:guideId", getGuideRatings);

router.get("/paths",requireAuth, getPaths);
router.post("/paths", requireAuth, createPath);
router.post("/find/path", requireAuth, findOptimalPathWithWaypoints);

router.post("/media/upload", uploadMiddleware.single("file"), uploadMedia);
router.get("/media", listMedia);
router.get("/media/:id", getPrivateMediaUrl);
router.delete("media/:id", deleteMedia);

router.get("/settings",requireAuth, getGlobalSettings);
router.get("/settings/:key", requireAuth,getOneGlobalSetting);
router.post("/settings/:key",requireAuth, allowedRoles("admin"), updateGlobalSetting);

export default router;
