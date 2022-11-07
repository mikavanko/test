<template>
  <component
    :is="tag"
    :contenteditable="contenteditable"
    @input="update"
    @paste="onPaste"
    @keypress.enter.exact.prevent="onKeypress"
    @keypress.enter.shift.exact="onEnterShiftPress"
    @keydown.up.exact="onUpPress"
    @keydown.down.exact="onDownPress"
    @keydown.delete.exact="onDeletePress"
    ref="element"
    class="contenteditable"
  >
    <!-- @blur="update" -->
  </component>
</template>

<script lang="ts">


import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue';

function replaceAll(str: string, search: string, replacement: string) {
  return str.split(search).join(replacement);
}

export default defineComponent({
  name : 'contenteditable',
  props : {
    'tag' : String,
    'contenteditable' : {
      type : Boolean,
      default : true,
    },
    'modelValue' : String,
    'noHTML' : {
      type : Boolean,
      default : true,
    },
    'noNL' : {
      type : Boolean,
      default : false,
    },
  },
  emits : {
    'enter-pressed' : String,
    'shift-enter-pressed' : String,
    'delete-no-content-pressed' : String,
    'delete-pressed' : String,
    'up-pressed' : String,
    'down-pressed' : String,
    'update:modelValue' : String,
  },
  setup(props, {emit} ){
    const element = ref<HTMLElement | null>(null)
    
    function currentContent(){
      return props.noHTML ? 
        element.value?.innerText || ""
        :
        element.value?.innerHTML || ""
    }
    function updateContent(newcontent: string){
      if(props.noHTML) {
        element.value!.innerText = newcontent;
      }
      else {
        element.value!.innerHTML = newcontent;
      }
    }
    function update(event: any) {
      emit('update:modelValue', currentContent());
    }
    function onPaste(event: any) {
      event.preventDefault();
      let text = (event.originalEvent || event).clipboardData.getData('text/plain');
      if(props.noNL) {
        text = replaceAll(text, '\r\n', ' ');
        text = replaceAll(text, '\n', ' ');
        text = replaceAll(text, '\r', ' ');
      }
      window.document.execCommand('insertText', false, text);
    }
    function onKeypress(event: any) {
      emit('enter-pressed', currentContent());
    }

    function onEnterShiftPress(event: any) {
      emit('shift-enter-pressed', currentContent());
    }

    function onUpPress(event: any) {
      emit('up-pressed', currentContent());
    }

    function onDownPress(event: any) {
      emit('down-pressed', currentContent());
    }

    let prevContent = "";
    function onDeletePress(event: any) {
      if(!currentContent().length){
      // if(!currentContent().length && !prevContent.length){
        emit('delete-no-content-pressed', currentContent());
      }else{
        emit('delete-pressed', currentContent());
      }
      prevContent = currentContent()
    }


    onMounted(() =>{
      // document.execCommand("defaultParagraphSeparator", false, "p");
      updateContent(props.modelValue ?? '')
    })
    
    watch( () => props.modelValue, (newval, oldval) => {
      if(newval != currentContent()){
        updateContent(newval ?? '')
      }
    })
    return {
      update,
      onPaste,
      onKeypress,
      onEnterShiftPress,
      onDeletePress,
      onUpPress,
      onDownPress,
      element,
    }
  },
})
</script>
<style lang="scss" scoped>
.contenteditable{
  outline: none;
  -webkit-tap-highlight-color: transparent;
  cursor: text;
  white-space: pre-wrap;
  word-break: break-word;

  &:empty::after{
    content: attr(placeholder);
    color: $color-dark-20;
  }
}
</style>