const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('AgriShare AI API Endpoints Verification', () => {
  
  // Close database connection after tests run
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 1. Health check verification
  test('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'AgriShare AI API');
  });

  // 2. AI recommendations payload check
  test('POST /api/ai/recommend should return equipment suggestions', async () => {
    const res = await request(app)
      .post('/api/ai/recommend')
      .send({
        cropType: 'Paddy',
        landArea: 5,
        farmingActivity: 'Land Preparation'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('recommendations');
    expect(res.body.recommendations.length).toBeGreaterThan(0);
    expect(res.body.recommendations[0]).toHaveProperty('equipmentType');
    expect(res.body.recommendations[0]).toHaveProperty('durationDays');
    expect(res.body.recommendations[0]).toHaveProperty('dailyEstimate');
    expect(res.body).toHaveProperty('totalEstimatedCostRange');
    expect(res.body).toHaveProperty('generalAdvice');
  });

  // 3. AI cost estimator check
  test('POST /api/ai/estimate-cost should compute dynamic quotes', async () => {
    const res = await request(app)
      .post('/api/ai/estimate-cost')
      .send({
        equipmentType: 'Tractor',
        durationDays: 4,
        pincode: '560001'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.estimate).toHaveProperty('baseRate');
    expect(res.body.estimate).toHaveProperty('baseCost');
    expect(res.body.estimate).toHaveProperty('estimatedTotal');
    expect(res.body.estimate).toHaveProperty('demandMultiplier');
    expect(res.body.estimate).toHaveProperty('volumeDiscount');
  });

  // 4. Weather suggestions validation & differentiation test
  test('GET /api/ai/weather-suggestions should return distinct, stable data for different pincodes', async () => {
    const res1 = await request(app).get('/api/ai/weather-suggestions?pincode=560001');
    const res2 = await request(app).get('/api/ai/weather-suggestions?pincode=560002');

    expect(res1.statusCode).toEqual(200);
    expect(res2.statusCode).toEqual(200);
    expect(res1.body).toHaveProperty('success', true);
    expect(res2.body).toHaveProperty('success', true);

    // Ensure coordinates are returned
    expect(res1.body).toHaveProperty('coordinates');
    expect(res2.body).toHaveProperty('coordinates');

    // Coordinates should be different (not identical Bangalore city center)
    expect(res1.body.coordinates).not.toEqual(res2.body.coordinates);

    // Forecast details should differ (since coordinates are mapped deterministically and yield different hashes)
    const temp1 = res1.body.forecast[0].temp;
    const temp2 = res2.body.forecast[0].temp;
    const cond1 = res1.body.forecast[0].condition;
    const cond2 = res2.body.forecast[0].condition;

    // Verify at least some forecast details (temperature or condition) differ, proving they aren't the same mock data
    const isDifferent = (temp1 !== temp2) || (cond1 !== cond2);
    expect(isDifferent).toBe(true);
  });

});
