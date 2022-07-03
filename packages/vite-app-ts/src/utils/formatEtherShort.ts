import { BigNumberish } from '@ethersproject/bignumber';
import { formatEther } from 'ethers/lib/utils';

const CHARS_AFTER_DELIMITER = 3;

export const formatEtherShort = (value: BigNumberish, roundingAccuracy = CHARS_AFTER_DELIMITER) => {
  const v = formatEther(value);

  if (!v.includes('.')) {
    return v;
  }
  const [intPart, floatPart] = v.split('.');

  return `${intPart}.${floatPart.slice(0, roundingAccuracy)}`;
};
