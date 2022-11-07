import axios from "axios";

export const deskUpdate = (desk, { name }) => {
  return axios.patch(`/api/desks/${desk}`, {
    name,
  });
};

export const deskGet = (desk) => {
  return axios.get(`/api/desks/${desk}`);
};

export const deskDelete = (desk) => {
  return axios.delete(`/api/desks/${desk}`);
};

export const deskSearch = (desk, { query }) => {
  return axios.get(`/api/desks/${desk}/search`, {
    params: {
      query,
    },
  });
};

export const deskCreate = (project, { name }) => {
  return axios.post(`/api/desks/project/${project}`, {
    name,
  });
};

export const deskColumnCreate = (desk, { name }) => {
  return axios.post(`/api/desks/${desk}/column`, {
    name,
  });
};

export const deskColumnDelete = (column) => {
  return axios.delete(`/api/desks/column/${column}`);
};

export const deskColumnMove = (column, { targetColumnId }) => {
  return axios.patch(`/api/desks/column/${column}/move`, {
    target_column_id: targetColumnId,
  });
};

export const deskColumnUpdate = (column, { targetColumnId }) => {
  return axios.patch(`/api/desks/column/${column}`, {
    target_column_id: targetColumnId,
  });
};

export const deskColumnSetColor = (column, { colorId }) => {
  return axios.patch(`/api/desks/column/${column}/set-color`, {
    color_id: colorId,
  });
};

export const deskColumnTaskCreate = (column, { name }) => {
  return axios.post(`/api/desks/column/${column}/task`, {
    name,
  });
};

export const deskColumnTaskDelete = (task) => {
  return axios.delete(`/api/desks/task/${task}`);
};

export const deskColumnTaskUpdate = (task, { name, fields }) => {
  const params = {
    name,
    fields,
  }
  return axios.patch(`/api/desks/task/${task}`, params);
};

export const deskColumnTaskAddExecutor = (task, { executorId }) => {
  return axios.patch(`/api/desks/task/${task}/add-executor`, {
    executor_id: executorId,
  });
};


export const deskColumnTaskRemoveExecutor = (task, { executorId }) => {
  return axios.patch(`/api/desks/task/${task}/remove-executor`, {
    executor_id: executorId,
  });
};

export const deskColumnTaskMove = (task, { targetTaskId, columnId }) => {
  return axios.patch(`/api/desks/task/${task}/move`, {
    target_task_id: targetTaskId,
    column_id: columnId,
  });
};

export const getTask = (task) => {
  return axios.get(`/api/desks/task/${task}`);
};

export const getColors = () => {
  return axios.get(`/api/color`);
};

export const deskFieldCreate = (desk, { name, type, format, timezone, hasEnd }) => {
  return axios.post(`/api/desks/${desk}/field`, {
    name,
    type,
    format,
    timezone,
    has_end: hasEnd,
  });
};

export const deskFieldUpdate = (deskField, { name, type, numberFormat, options, personLimit, format, timezone, hasEnd, hasTime }) => {
  return axios.patch(`/api/desks/field/${deskField}`, {
    name,
    type,
    number_format: numberFormat,
    person_limit: personLimit,
    options: options,
    format,
    timezone,
    has_end: hasEnd,
    has_time: hasTime,
  });
};

export const deskFieldGet = (deskField) => {
  return axios.get(`/api/desks/field/${deskField}`);
};

export const deskFieldDelete = (deskField) => {
  return axios.delete(`/api/desks/field/${deskField}`);
};

export const deskFieldAddProperties = (deskField, values) => {
  return axios.post(`/api/desks/field/${deskField}`, {
    values,
  });
};
export const deskFieldRemoveProperties = (deskField, optionIds) => {
  return axios.delete(`/api/desks/field/${deskField}/property`, {
    params: {
      values: optionIds,
    }
  });
};

export const updateFieldProperty = (property, { name, colorId }) => {
  return axios.patch(`/api/desks/field/property/${property}`, {
    name,
    color_id: colorId,
  });
};

export const getTimeZones = () => {
  return axios.get(`/api/timezones`);
};

export const getTimeFormats = () => {
  return axios.get(`/api/time-formats`);
};

export const addMedia = (deskField, task, formData) => {
  return axios.post(`/api/field/${deskField}/task/${task}/add/media`, formData);
};
export const removeMedia = (deskFieldValue, ids) => {
  return axios.delete(`/api/desks/field/value/${deskFieldValue}/media/remove`, {
    params: {
      ids,
    }
  });
};

export const renameMedia = (media, name) => {
  return axios.patch(`/api/media/${media}/rename`, {
    name,
  });
};
