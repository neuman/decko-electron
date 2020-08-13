<template>
  <form @submit.prevent="openFile">
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
var fs = require("fs");
const { dialog } = require("electron").remote;
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      label: "",
    };
  },
  methods: {
    openDirectory(path) {
      fs.readdir(path, function (err, files) {
        if (err) console.log(err);
        else {
          console.log("\nCurrent directory filenames:");
          files.forEach((file) => {
            console.log(file);
          });
        }
      });
    },
    openFile() {
      dialog.showOpenDialog(
        {
          title: "Select a subtitles file.",
          filters: [{ name: "Subtitles", extensions: ["*"] }],
          properties: ["openDirectory"],
        }).then(
        (filenames) => {
          console.log(filenames);
          console.log(filenames.filePaths[0]);
          this.openDirectory(filenames.filePaths[0]);
        }
      );
    },
  },
};
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
