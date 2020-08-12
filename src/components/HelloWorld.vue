<template>
  <form @submit.prevent="onSubmit">
    <label for="new-todo-input">What needs to be done?</label>
    <input
      type="text"
      id="new-todo-input"
      name="new-todo"
      autocomplete="off"
      v-model.lazy.trim="label"
    />
    <button type="submit">Add</button>
  </form>
</template>

<script>
import fs from'fs'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },  data() {
    return {
      label: "",
    };
  },
    methods: {
    onSubmit() {
      console.log(fs)
      fs.readDir("/", function (dir) {
        // es5
        for (var i = 0, l = dir.length; i < l; i++) {
          var filePath = dir[i];
          console.log(filePath);
        }
        // es6
        for (let filePath of dir) {
          console.log(filePath);
        }
      });
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
