import { filter } from 'meteor/idreesia-common/utilities/lodash';

export default function getCityMehfilCascaderData(allCities, allMehfils) {
  if (!allCities || !allMehfils) return null;

  const data = allCities.map(city => {
    const cityMehfils = filter(
      allMehfils,
      mehfil => mehfil.cityId === city._id
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
