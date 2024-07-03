<template>
  <div>
    <q-item clickable tag="a" :to="link" @click="handleShow">
      <q-item-section v-if="icon" avatar>
        <q-icon :name="icon" />
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ title }}</q-item-label>
        <q-item-label caption>{{ caption }}</q-item-label>
      </q-item-section>

      <q-icon size="sm" name="menu" v-if="isExpand" />
    </q-item>

    <div v-if="isShow">
      <q-item
        clickable
        tag="a"
        v-for="(item, index) in children"
        :to="item.link"
        :key="index"
      >
        <q-item-section avatar>
          <q-icon :name="item.icon" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ item.title }}</q-item-label>
          <q-item-label caption>{{ item.caption }}</q-item-label>
        </q-item-section>
      </q-item>
      <!-- <q-separator spaced /> -->
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      default: '',
    },

    link: {
      type: String,
      default: '#',
    },

    icon: {
      type: String,
      default: '',
    },

    children: {
      type: Array,
    },

    isExpand: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const isShow = ref(false);

    const handleShow = () => {
      isShow.value = !isShow.value;
    };

    //
    return {
      isShow,
      handleShow,
    };
  },
});
</script>
