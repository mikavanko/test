export default [
  {
    actions: [
      {
        name: "Удалить",
        componentLeft: {
          tag: "svg-icon",
          props: {
            name: "trash",
          },
        },
        on: {
          click: ({}, emit) => {
            emit("action:remove-task");
          },
        },
      },
      {
        name: "Дублировать",
        componentLeft: {
          tag: "svg-icon",
          props: {
            name: "duplicate",
          },
        },
        on: {
          click: ({}, emit) => {
            emit("action:duplicate-task");
          },
        },
      },
      {
        name: "Ссылка на блок",
        componentLeft: {
          tag: "svg-icon",
          props: {
            name: "link",
          },
        },
        on: {
          click: ({}, emit) => {
            emit("action:copy-task-link");
          },
        },
      },
      {
        name: "Открыть в новой вкладке",
        componentLeft: {
          tag: "svg-icon",
          props: {
            name: "open-in-new",
          },
        },
        on: {
          click: ({}, emit) => {
            emit("action:open-task-in-new-tab");
          },
        },
      },
    ],
  },
  {
    actions: [
      {
        name: "Переименовать",
        componentLeft: {
          tag: "svg-icon",
          props: {
            name: "edit",
          },
        },
        on: {
          click: ({}, emit, e) => {
            emit("action:rename-task", e);
          },
        },
      },
      {
        name: "Редактировать свойства",
        componentLeft: {
          tag: "svg-icon",
          props: {
            name: "setting-5",
          },
        },
        on: {
          click: ({}, emit) => {
            emit("action:edit-properies");
          },
        },
      },
    ],
  },
];
