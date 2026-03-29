import axios from './axios';

const normalizeExecutionResult = (result = {}) => {
  if (result.success) {
    return {
      success: true,
      output: result.output || 'No output',
    };
  }

  return {
    success: false,
    output: result.output || '',
    error: result.error || 'Execution failed',
  };
};

export async function executeCode(language, code, input = '') {
  try {
    const response = await axios.post('/interviews/execute-code', {
      language,
      code,
      input,
    });

    if (!response.data?.success) {
      return {
        success: false,
        error: response.data?.error || 'Execution failed',
      };
    }

    return normalizeExecutionResult(response.data.data);
  } catch (error) {
    return {
      success: false,
      error:
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to execute code',
    };
  }
}

export async function getCodeRuntimeHealth() {
  try {
    const response = await axios.get('/interviews/code-runtime-health');
    return {
      success: true,
      healthy: Boolean(response.data?.data?.healthy),
    };
  } catch (error) {
    return {
      success: false,
      healthy: false,
      error:
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to check code runtime health',
    };
  }
}
