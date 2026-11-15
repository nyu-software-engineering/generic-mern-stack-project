import { isHotelNameValid } from '../src/hotel.js';

describe('name validation', function () {

let expect;

    before(async function (){

        ({expect} = await import('chai'));
    }

    );

    it('when hotel name is not empty, it should return true', function(){
        const result = isHotelNameValid('Grand Hotel');
        expect(result).to.equal(true);

    }
    );

    it('when hotel name is number, it should return false', function(){
        const result = isHotelNameValid(123);
        expect(result).to.equal(false);

    }
    );


}
);
