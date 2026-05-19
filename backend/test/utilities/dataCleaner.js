const removeSqlFields = (dbData) => {
  if (Array.isArray(dbData)) {
    dbData.forEach((entry) => {
      delete entry.id;
      delete entry.created_at;
    });
  } else {
    delete dbData.id;
    delete dbData.created_at;
  }

  return dbData;
};

export { removeSqlFields };
