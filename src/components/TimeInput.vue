<script>
import { computed } from "vue";

const defaultTime = "12:00";

export default {
  components: {},
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      type: String,
      default: defaultTime,
    },
  },
  setup(props, { emit }) {
    const value = computed({
      get(){
        return props.modelValue
      },
      set(val){
        emit("update:modelValue", val)
      }
    })

    function checkZerosFromStart(str){
      let count = 0;
      for(let i = 0; i < str.length; i++){
        if(str[i] === "0"){
          count++;
        }else{
          break
        }
      }
      return count
    }

    function focusout() {
      const timeStrRaw = value.value.replace(':','').substring(0, 4)
      const zeroLeftCount = checkZerosFromStart(timeStrRaw)
      const timeInt = parseInt(timeStrRaw, 10);

      if (isNaN(timeInt)) {
        emit("update:modelValue", defaultTime);
      }else{
        let timeStr = timeInt.toString()

        const zeroRightCount = 4 - timeStr.length - zeroLeftCount

        const zeroLeftArr = [...Array(zeroLeftCount)].map(el=>"0").join("")
        const zeroRightArr = [...Array(zeroRightCount)].map(el=>"0").join("")

        timeStr = `${zeroLeftArr}${timeStr}${zeroRightArr}`

        if(timeStr <= "2400" && timeStr.substring(2,4) <= "60"){
          const formatedTime = timeStr.slice(0,2) + ":" + timeStr.slice(2)
          emit("update:modelValue", formatedTime);
        }else{
          emit("update:modelValue", defaultTime);
        }

      }
    }

    return {
      value,
      focusout,
    };
  },
};
</script>

<template>
  <div class="time-picker">
    <input
      type="text"
      class="time-picker-input"
      v-model="value"
      @focusout="focusout"
    />
  </div>
</template>

<style lang="scss" scoped>
.time-picker-input {
  @include clear-input;

  font-weight: 400;
  font-size: 12px;
  line-height: 17px;
  color: $color-dark-70;
  padding: 5px 10px;
  background-color: $color-light-f;
}
</style>
