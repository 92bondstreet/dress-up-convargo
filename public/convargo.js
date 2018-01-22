/*eslint-disable space-unary-ops*/
'use strict';

let CONVARGO = (() => {
  const TREASURY_TAX_KM = 500;

  /**
   * Get trucker information
   *
   * @return {Object}
   */
  const getTrucker = () => {
    return {
      'name': document.querySelector('#trucker .name').value,
      'pricePerKm': document.querySelector('#trucker .price-by-km').value,
      'pricePerCubic': document.querySelector('#trucker .price-by-cubic').value
    };
  };

  /**
   * Get discount percent according volume
   *
   * @param  {Number} volume
   * @return {Number}
   */
  const discount = volume => {
    if (volume > 25) {
      return 0.5;
    }

    if (volume > 10) {
      return 0.3;
    }

    if (volume > 5) {
      return 0.1;
    }

    return 0;
  };

  /**
   * Compute shipping commission
   *
   * @param  {Number} price
   * @param  {Number} days
   * @return {Object}
   */
  const shippingCommission = (price, distance) => {
    const value = parseFloat((price * 0.3).toFixed(2));
    const insurance = parseFloat((value * 0.5).toFixed(2));
    const treasury = Math.ceil(distance / TREASURY_TAX_KM);

    return {
      insurance,
      treasury,
      value,
      'convargo': parseFloat((value - insurance - treasury).toFixed(2))
    };
  };

  /**
   * Compute the rental price
   *
   * @param  {Object} trucker
   * @param  {String} distance
   * @param  {String} volume
   * @return {String} price
   */
  const shippingPrice = (trucker, distance, volume) => {
    const percent = discount(volume);
    const pricePerCubic = trucker.pricePerCubic - trucker.pricePerCubic * percent;

    return parseFloat((distance * trucker.pricePerKm + volume * pricePerCubic).toFixed(2));
  };

  /**
   * Pay each actors
   *
   * @param  {Object} trucker
   * @param  {String} distance
   * @param  {String} volume
   * @param  {Boolean} option
   * @return {Object}
   */
  const payActors = (trucker, distance, volume, option) => {
    const price = shippingPrice(trucker, distance, volume);
    const commission = shippingCommission(price, distance);
    const deductibleOption = option ? 1 * volume : 0;

    var actors = [{
      'who': 'shipper',
      'type': 'debit',
      'amount': price + deductibleOption
    }, {
      'who': 'trucker',
      'type': 'credit',
      'amount': price - commission.value
    }, {
      'who': 'insurance',
      'type': 'credit',
      'amount': commission.insurance
    }, {
      'who': 'treasury',
      'type': 'credit',
      'amount': commission.treasury
    }, {
      'who': 'convargo',
      'type': 'credit',
      'amount': commission.convargo + deductibleOption
    }];

    return actors;
  };

  return {
    'getTrucker': getTrucker,
    'payActors': payActors
  };
})();
