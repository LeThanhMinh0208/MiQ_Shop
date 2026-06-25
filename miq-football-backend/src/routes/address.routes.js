import { Router } from 'express';

const router = Router();

// GET /api/v1/address/wards?province=HN&district=D01
// Returns ward list for the given province + district.
// Ward data is empty for all districts in the current release; the endpoint
// exists so the frontend can call it without a code change once full ward
// data is added (e.g. as a Ward model or a static JSON file on the backend).
router.get('/wards', (_req, res) => {
    res.json({ data: [] });
});

export default router;
