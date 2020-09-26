<template>
   <b-tab v-on:click="isClicked" v-bind:title="myLabel" v-bind:active="myActive"></b-tab>
</template>

<script>
export default {
  props: {
    label: { required: true, type: String },
    id: { required: true, type: String },
    active: { default: false, type: Boolean },
  },
  data() {
    return {
      myLabel: this.label,
      myId: this.id,
      myActive: this.active,
    };
  },
  created: function () {
  },
  methods: {
    isClicked() {
      this.$emit("data-sheet-selected", this.label);
    },
  },
};
</script>
