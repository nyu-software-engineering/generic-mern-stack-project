import { expect } from 'chai';
import initialSavedHotels from '../mockData/hotelList.js';

//test if empty

describe('saved hotel mock data', function () {
  it('is a non-empty array', function () {
    expect(initialSavedHotels).to.be.an('array').that.is.not.empty;
  });

  //test duplicate idss
  it('does not contain duplicate hotel IDs', function () {
    const ids = initialSavedHotels.map((hotel) => hotel.id);

    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).to.equal(ids.length);
  });
});
