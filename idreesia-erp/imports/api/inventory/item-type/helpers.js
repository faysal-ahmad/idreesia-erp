export function getItemTypeFormattedName(itemType) {
  const { name, company, details } = itemType;
  let formattedName = name;
  if (company) {
    formattedName = `${formattedName} - ${company}`;
  }
  if (details) {
    formattedName = `${formattedName} - ${details}`;
  }

  return formattedName;
}
