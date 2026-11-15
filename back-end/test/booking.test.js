import { isValidDateRange } from '../src/booking.js';

describe('booking date validation', function () {

    let expect;

    before(async function () {

        ({ expect } = await import('chai'));
    }

    );


    it('returns true when checkout is after check-in', function () {
        const checkIn = '2026-12-01';
        const checkOut = '2026-12-03';
        const result = isValidDateRange(checkIn, checkOut);

        expect(result).to.equal(true);

    }
    );


}
);
