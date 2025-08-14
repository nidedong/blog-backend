import { Transform } from 'class-transformer';

export const Boolean2Num = () =>
  Transform((params) => {
    if (params.value === true) return 1;
    if (Object.is(params.value, 'true')) return 1;
    return false;
  });

export const ToNumber = () =>
  Transform((params) => {
    return +params.value;
  });
