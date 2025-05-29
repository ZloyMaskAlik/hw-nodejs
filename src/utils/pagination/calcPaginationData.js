export const calcPaginationData = ({ count, page, perPage }) => {
    const totalPages = Math.ceil(count / perPage);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
  
    return {
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  };