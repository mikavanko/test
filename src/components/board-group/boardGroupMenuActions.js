import { Action } from "./actionsFactory.js"

const colorActions = [
  {
    name: "Светло серый",
    color: "#CDCCD4",
  },
  {
    name: "Серый",
    color: "#68677F",
  },
  {
    name: "Красный",
    color: "#FFBCB0",
  },
  {
    name: "Жёлтый",
    color: "#FFE4AB",
  },
  {
    name: "Зелёный",
    color: "#C9DFC9",
  },
  {
    name: "Фиолетовый",
    color: "#D0CEFF",
  },
  {
    name: "Синий",
    color: "#AED8FF",
  },
  {
    name: "Розовый",
    color: "#FFD1F2",
  },
]

function initColorActions() {
  return colorActions.map(
    (c) => new Action(c.name, "color-square", { color: c.color })
  );
}

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
          click: (obj, emit) => {
            emit("action:remove", obj)
          },
        },
      },
    ],
  },
  {
    title: "Цвета",
    actionsOn: {
      click: ({ groups, group, item, i, j }, emit, e) => {
        emit(
          "action:change-group-color",
          { groups, group, item, i, j },
          emit,
          e
        );
      },
    },
    actions: initColorActions(),
    // {
    //   name: "Розовый",
    //   componentLeft: {
    //     tag: "color-square",
    //     props: {
    //       color: "#FFD1F2",
    //     },
    //   },
    // },
  },
];
