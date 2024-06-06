import { expect } from 'chai';
import request from 'supertest';
import app from '../app.mjs'; // Corrected import
import server from '../main.mjs'; // Import the server instance

describe('Rate Limiter Service', function() {
    this.timeout(20000); // Increase timeout for this suite

    after(() => {
        server.close(); // Close the server after all tests are done
    });

    it('should return 404 for unknown route', async () => {
        const res = await request(app)
            .post('/take')
            .send({ endpoint: 'GET /unknown/route' });
        expect(res.status).to.equal(404);
    });

    it('should consume a token and accept the request', async () => {
        const res = await request(app)
            .post('/take')
            .send({ endpoint: 'GET /user/:id' });
        expect(res.status).to.equal(200);
        expect(res.body.accept).to.be.true;
        expect(res.body.tokensRemaining).to.be.a('number');
    });

    it('should return 429 when rate limit is exceeded', async () => {
        // Exhaust tokens first
        for (let i = 0; i < 10; i++) {
            await request(app)
                .post('/take')
                .send({ endpoint: 'GET /user/:id' });
        }

        const res = await request(app)
            .post('/take')
            .send({ endpoint: 'GET /user/:id' });
        expect(res.status).to.equal(429);
        expect(res.body.accept).to.be.false;
        expect(res.body.tokensRemaining).to.equal(0);
    });

    // NOTE: Will run for about 12 seconds to simulate somewhat of a real-world scenario
    it('should return 200 and accept the request after tokens are refilled', (done) => {
        // Log current state before waiting for refill
        request(app)
            .get('/debug/tokenBuckets')
            .then((res) => {
                console.log('Before waiting for token refill:', res.body['GET /user/:id']);
                
                // Wait for tokens to be refilled
                setTimeout(async () => {
                    console.log('Checking token refill...');
                    const resTake = await request(app)
                        .post('/take')
                        .send({ endpoint: 'GET /user/:id' });
                    console.log('Response:', resTake.body);
                    
                    const resDebug = await request(app).get('/debug/tokenBuckets');
                    console.log('After token refill:', resDebug.body['GET /user/:id']);
                    
                    expect(resTake.status).to.equal(200);
                    expect(resTake.body.accept).to.be.true;
                    expect(resTake.body.tokensRemaining).to.be.a('number');
                    done();
                }, 12000); // Wait for 12 seconds to ensure token refill
            })
            .catch((err) => done(err));
    });
});
