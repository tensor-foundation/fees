import { getFeesProgramProgram } from './generated';

export const feesProgram = () => ({
  install() {
    getFeesProgramProgram();
  },
});
