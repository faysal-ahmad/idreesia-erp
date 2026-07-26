import { filter } from 'meteor/idreesia-common/utilities/lodash';

interface City {
  _id: string;
  name: string;
}

interface Mehfil {
  _id: string;
  name: string;
  cityId: string;
}

export default function getCityMehfilCascaderData(
  allCities?: City[] | null,
  allMehfils?: Mehfil[] | null
) {
  if (!allCities || !allMehfils) return null;

  const data = allCities.map(city => {
    const cityMehfils = filter(
      allMehfils,
      (mehfil: Mehfil) => mehfil.cityId === city._id
    );

    const dataItem = {
      value: city._id,
      label: city.name,
      children: cityMehfils.map(mehfil => ({
        value: mehfil._id,
        label: mehfil.name,
      })),
    };

    return dataItem;
  });

  return data;
}
