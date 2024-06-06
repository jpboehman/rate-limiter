export class TokenBucket {
    constructor(burst, sustained) {
        this.tokens = burst;
        this.burst = burst;
        this.sustained = sustained;
        this.lastRefill = Date.now();
    }

    // Function to replenish tokens for each endpoint according to the sustained rate
    refill() {
        const now = Date.now();
        const elapsedTime = now - this.lastRefill;

        // Calculate the number of tokens to add based on elapsed time and sustained rate
        const tokensToAdd = Math.floor(elapsedTime / (60000 / this.sustained));

        // Add tokens, ensuring not to exceed the burst limit
        if (tokensToAdd > 0) {
            this.tokens = Math.min(this.tokens + tokensToAdd, this.burst);
            this.lastRefill += tokensToAdd * (60000 / this.sustained);
            console.log(`Refilled ${tokensToAdd} tokens. Tokens now: ${this.tokens}`);
        } else {
            console.log(`No tokens to refill. Elapsed time: ${elapsedTime}, Tokens now: ${this.tokens}`);
        }
    }

    // Function to consume one token
    consume() {
        if (this.tokens > 0) {
            this.tokens -= 1;
            return true;
        }
        return false;
    }
}
