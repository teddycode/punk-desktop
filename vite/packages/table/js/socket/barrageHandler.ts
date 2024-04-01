import { barrages } from '../service/barrages';

export const barrageHandler = {
  on({ event, data }) {
    switch (event) {
      case 'add':
        barrages.send(data);
    }
  },
};
