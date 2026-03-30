const parseHistory = (rawHistory) => {
  try {
    const parsed = JSON.parse(rawHistory || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const appendHistoryEntry = (history, previousContent) => {
  const safeHistory = Array.isArray(history) ? history : [];
  return [
    ...safeHistory,
    {
      content: previousContent || "",
      timestamp: new Date().toISOString(),
    },
  ];
};

module.exports = {
  parseHistory,
  appendHistoryEntry,
};
