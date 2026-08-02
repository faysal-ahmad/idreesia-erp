import { filter } from 'meteor/idreesia-common/utilities/lodash';

interface City {
  _id?: string | null;
  name?: string | null;
}

interface Mehfil {
  _id?: string | null;
  name?: string | null;
  cityId?: string | null;
}

export default function getCityMehfilCascaderData(
  allCities?: City[] | null,
  allMehfils?: Mehfil[] | null
) {
  if (!allCities || !allMehfils) return null;

  const data = allCities
    .filter((city): city is City & { _id: string } => Boolean(city._id))
    .map(city => {
      const cityMehfils = filter(
        allMehfils,
        (mehfil: Mehfil) => mehfil.cityId === city._id && Boolean(mehfil._id)
      );

      const dataItem = {
        value: city._id,
        label: city.name ?? '',
        children: cityMehfils.map(mehfil => ({
          value: mehfil._id as string,
          label: mehfil.name ?? '',
        })),
      };

      return dataItem;
    });

  return data;
}
