import { Request, Response } from 'express';
import { mapsService } from '../services/maps.service.js';
import { NearbyFacilitiesQuerySchema } from '../../../shared/index.js';

export class MapController {
  async getNearbyFacilities(req: Request, res: Response): Promise<void> {
    try {
      const validated = NearbyFacilitiesQuerySchema.parse(req.query);
      const result = await mapsService.findNearbyFacilities({
        lat: validated.lat,
        lng: validated.lng,
        radius: validated.radius,
        type: validated.type,
        specialty: validated.specialty
      });

      res.json({
        success: true,
        ...result
      });
    } catch (err: any) {
      console.error('[MapController] getNearbyFacilities error:', err);
      res.status(400).json({
        success: false,
        error: err.message || 'Invalid parameters for nearby facilities query'
      });
    }
  }

  async geocode(req: Request, res: Response): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      if (!query || query.trim().length === 0) {
        res.status(400).json({ success: false, error: 'Query parameter q is required' });
        return;
      }

      const result = await mapsService.geocodeAddressOrPin(query);
      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Location not found or geocoding service not available'
        });
        return;
      }

      res.json({ success: true, data: result });
    } catch (err: any) {
      console.error('[MapController] geocode error:', err);
      res.status(500).json({ success: false, error: 'Geocoding service error' });
    }
  }
}

export const mapController = new MapController();
