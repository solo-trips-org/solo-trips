import { Router } from 'express';
import { register, login, profile, logout } from './app/controllers/auth.controller.js';
import { requireAuth } from './app/middlewares/auth.middleware.js';
import User from './app/models/user.model.js';
import { createCrud } from '@api-craft/crud-router';

import {Place} from './app/models/place.model.js';
import {Event} from './app/models/event.model.js';
import {Guide} from './app/models/guide.model.js';
import { getNearbyPlaces } from './app/controllers/place.controller.js';
import { getNearbyHotels } from './app/controllers/hotel.controller.js';
import { getNearbyEvents } from './app/controllers/event.controller.js';
import { getNearbyGuides } from './app/controllers/guide.controller.js';


const router = Router();

router.use('/users',createCrud(User))
router.post('/register', register);
router.post('/login', login);
router.get('/profile', requireAuth, profile);
router.post('/logout', requireAuth, logout);

router.use('/places', createCrud(Place));
router.use('/events', createCrud(Event));
router.use('/guides', createCrud(Guide));

router.get('/near/places',getNearbyPlaces);
router.get('/near/hotels', getNearbyHotels);
router.get('/near/events', getNearbyEvents);
router.get('/near/guides',getNearbyGuides);

export default router;