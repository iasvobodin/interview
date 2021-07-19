<template>
  <div class="items">
    <h1>Недвижимость</h1>
    <ul role="list" class="items__holder">
      <li
        @click="changeItem(index)"
        class="list__item"
        v-for="(item, index) in items"
        :key="item.id"
      >
        <div>Название: {{ item.name }}</div>
        <div>Описание: {{ item.desc }}</div>
        <div>Цена: ${{ item.price }}</div>
        <div>Тип: {{ item.type }}</div>
        <div>index: {{ item.index }}</div>
      </li>
    </ul>
    <div class="pagination">
      <select v-model="displayQty" name="" id="">
        <option v-for="n in [10, 20, 30]" :key="n">{{ n }}</option>
      </select>
    </div>
    <div class="add__button">
      <button @click="modal = true">ADD NEW</button>
    </div>
  </div>
  <div v-if="modal" class="modal">
    <div @mousedown="outsideClick($event)" class="modal__additem">
      <form
        @submit.prevent="addItem"
        id="addform"
        class="modal__form"
        action=""
      >
        <div class="input__holder">
          <h4>Названиe</h4>
          <input required v-model="updateItem.name" type="text" />
        </div>
        <div class="input__holder">
          <h4>Описание</h4>
          <textarea
            required
            v-model="updateItem.desc"
            name=""
            cols="30"
            rows="5"
          ></textarea>
        </div>
        <div class="input__holder">
          <h4>Цена</h4>
          <input required v-model="updateItem.price" type="number" />
        </div>
        <div class="input__holder">
          <h4>Тип</h4>
          <select required v-model="updateItem.type" name="">
            <option value="Комерческое">Комерческое</option>
            <option value="Жилое">Жилое</option>
          </select>
        </div>

        <input value="ADD" type="submit" />
        <div class="modal__close">
          <img
            class="modal__close__icon"
            @click="modal = false"
            src="/img/cancel.svg"
            alt=""
          />
          <!-- <button @click="modal = false">close</button> -->
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from "vue";
import { useFetch } from "@/hooks/fetch";
export default {
  setup() {
    const state = reactive({
      items: null,
      modal: false,
      maxIndex: null,
      pagesQty: null,
      displayQty: 10,
      updateItem: {},
    });
    const outsideClick = (e) => {
      const f = document.getElementById("addform"); // don't do it in vue!!! use costom directive
      !f.contains(e.target) && (state.modal = false);
    };
    //READ
    const getItems = async () => {
      // let url = new URL('/api/items', import.meta.env.DEV ? 'http://localhost:8080': 'https://thankful-pebble-012619610.azurestaticapps.net/');
      // url.searchParams.set('limit', 'open');
      const { request, response } = useFetch(`/api/items?lim=20`);
      await request();
      state.items = response;
      state.maxIndex = response.value[0].index;
    };
    getItems();
    //CREATE
    const addItem = async () => {
      const { request, response } = useFetch("/api/items?add=true", {
        method: "POST",
        body: JSON.stringify({
          index: ++state.maxIndex,
          type: state.updateItem["Тип"],
          ...state.updateItem,
        }),
      });
      await request();
      //CLEAR STATE
      state.modal = false;
      state.updateItem = {};
      //UPDATE LIST
      getItems();
    };
    //UPDATE
    const changeItem = (i) => {
      state.modal = true;
      state.updateItem = state.items[i];
    };
    const updateItem = async () => {
      const { request, response } = useFetch("/api/items", {
        method: "POST",
        // body: {...}
      });
      await request();
    };
    //DELETE
    const delItem = async () => {
      const { request, response } = useFetch("/api/items", {
        method: "POST",
        // body: {...}
      });
      await request();
    };
    return {
      outsideClick,
      addItem,
      changeItem,
      ...toRefs(state),
    };
  },
};
</script>

<style lang="css">
/* Box sizing rules */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Remove default margin */
body,
h1,
h2,
h3,
h4,
p,
figure,
blockquote,
dl,
dd {
  margin: 0;
}

/* Remove list styles on ul, ol elements with a list role, which suggests default styling will be removed */
ul[role="list"],
ol[role="list"] {
  list-style: none;
  padding: 0;
  list-style-type: none;
}

/* Set core root defaults */
html:focus-within {
  scroll-behavior: smooth;
}

/* Set core body defaults */
body {
  min-height: 100vh;
  text-rendering: optimizeSpeed;
  line-height: 1.5;
  margin: 0;
}

/* A elements that don't have a class get default styles */
a:not([class]) {
  text-decoration-skip-ink: auto;
}

/* Make images easier to work with */
img,
picture {
  max-width: 100%;
  display: block;
}

/* Inherit fonts for inputs and buttons */
input,
button,
textarea,
select {
  font: inherit;
}
h1 {
  text-align: center;
}
/* Remove all animations, transitions and smooth scroll for people that prefer not to see them */
@media (prefers-reduced-motion: reduce) {
  html:focus-within {
    scroll-behavior: auto;
  }
}
.items__holder {
  max-height: 80vh;
  overflow-y: auto;
}
.modal {
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
}
.modal__close {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  padding: 2px;
  background-color: #fff;
  border-radius: 50%;
  border-top: 1px solid black;
  border-right: 1px solid black;
  overflow: hidden;
}
.modal__additem {
  display: grid;
  position: relative;
  height: inherit;
}
.modal__form {
  place-self: center;
  position: relative;
  width: min(700px, 95vw);
  min-height: max(300px, 50vh);
  border-radius: 5px;
  border: 1px solid black;
  padding: 4vh 2vw;
  background-color: white;
}
.input__holder {
  margin: auto;
  display: grid;
  min-height: 40px;
  grid-template-columns: 1fr 4fr;
  padding-bottom: 15px;
}
.list__item {
  min-height: 40px;
  margin-top: 1vh;
  margin-left: 3vw;
  margin-right: 3vw;
  border: 1px solid orange;
  border-radius: 5px;
  padding: 1vh;
  cursor: pointer;
}
input[type="submit"] {
  /* background-image: url("/img/save.svg"); */
  border: none;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
/* .modal__close__icon {
} */
@media (max-width: 450px) {
  .input__holder {
    margin: auto;
    display: block;
    min-height: 40px;
    text-align: center;
    /* grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr; */
    padding-bottom: 15px;
  }
}
</style>