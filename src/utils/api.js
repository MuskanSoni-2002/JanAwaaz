export function getApiErrorMessage(error, fallbackMessage = 'Something went wrong.') {
  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.error === 'string' && data.error.trim()) {
    return data.error;
  }

  if (typeof data?.detail === 'string' && data.detail.trim()) {
    return data.detail;
  }

  if (data && typeof data === 'object') {
    const fieldMessages = Object.entries(data)
      .filter(([, value]) => typeof value === 'string' && value.trim())
      .map(([key, value]) => `${key}: ${value}`);

    if (fieldMessages.length > 0) {
      return fieldMessages[0];
    }
  }

  return fallbackMessage;
}
