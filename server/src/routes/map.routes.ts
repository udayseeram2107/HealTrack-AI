import { Router } from 'express';
import { mapController } from '../controllers/map.controller.js';

const router = Router();

// Nearby facilities proxy (Google Places API)
router.get('/nearby-facilities', (req, res) => mapController.getNearbyFacilities(req, res));

// Address and PIN code geocoding proxy
router.get('/geocode', (req, res) => mapController.geocode(req, res));

export default router;
