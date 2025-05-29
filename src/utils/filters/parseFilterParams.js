const parseType = (value) => {
    if (typeof value !== 'string') return;
    return value;
  };
  
  const parseIsFavourite = (value) => {
    if (typeof value !== 'string') return;
  
    if (value.toLowerCase() === 'true') {
      return true;
    } else if (value.toLocaleLowerCase() === 'false') {
      return false;
    } else {
      return undefined;
    }
  };
  
  export const parseFilterParams = ({ type, isFavourite }) => {
    const parsedType = parseType(type);
    const parsedIsFavourite = parseIsFavourite(isFavourite);
  
    return {
      type: parsedType,
      isFavourite: parsedIsFavourite,
    };
  };
