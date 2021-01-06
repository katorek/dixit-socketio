import {SettingsForm} from '../models/settingsForm';

export const processImages = (settings?: SettingsForm): string[] => {
  if (!settings) {
    return [];
  }

  if (settings.defaultImages) {
    const imgs = [];
    for (let i = 0; i < 98; i++) {
      imgs.push('http://katorek.ddns.net/images/dixit/scaled/card_' + pad(i, 2) + '.jpg');
    }
    return imgs.sort(() => Math.random() - 0.5);
  }
  return [];
};

const pad = (num: number, size: number): string => {
  const s = '0' + num;
  return s.substr(s.length - size);
};
