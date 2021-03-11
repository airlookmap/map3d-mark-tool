<template>
  <div id="app">
    <Tool/>
  </div>
</template>

<script>
import Tool from './views/Tool.vue'

export default {
  name: 'App',
  components: {
    Tool
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}
html, body {
  height: 100%;
  width: 100%;
  background: #000;
}
#container {
  margin: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
