
import { app } from "./main-app";
import Toast, { POSITION, TYPE } from "vue-toastification";
import "vue-toastification/dist/index.css";
import XIcon from "@/assets/icons/svg/round-x.svg";
import TickIcon from "@/assets/icons/svg/round-tick.svg";
import CloseIcon from "@/assets/icons/svg/close-notification.svg";

app.use(Toast, {
  position: POSITION.TOP_RIGHT,
  toastClassName: "v-notification-toast",
  timeout: 3000,
  closeButton: CloseIcon,
  draggablePercent: 0.4,
  toastDefaults: {
    [TYPE.ERROR]: {
      icon: XIcon,
    },
    [TYPE.SUCCESS]: {
      icon: TickIcon,
    },
  },
});
