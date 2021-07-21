<template>
  <div class="items">
    <div class="header">
      <h1>Title</h1>
      <div class="filter">
        <p>Фильтр по типу</p>
        <select v-model="filterType" name="" id="">
          <option selected value="all">Все</option>
          <option value="Жилое">Жилое</option>
          <option value="Комерческое">Комерческое</option>
        </select>
      </div>
    </div>
    <ul role="list" class="items__holder">
      <li
        @click="changeItem(index)"
        :class="{ blured: loading }"
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
    <div v-if="loading" class="preloader">
      <div class="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="pagination">
      <div class="numbering__holder">
      <img style="transform: rotate(180deg);" class="pagination__arrow" src="/img/next.svg" alt="next">
      <div class="numbering">
        <span
          :class="{ exzact__pagination: currentPage === n }"
          class="pagination__numbers"
          @click="selectPage(n)"
          v-for="n in pagesQty"
          :key="n"
        >
          {{ n }}
        </span>
      </div>
      <img  class="pagination__arrow" src="/img/next.svg" alt="next">
      </div>
      <div class="view__select">
        <p>Отображать по</p>
        <select v-model="displayQty" name="" id="">
          <option v-for="n in [10, 20, 30]" :key="n">{{ n }}</option>
        </select>
      </div>
    </div>
    <div class="add__button">
      <button @click="addClearState">ADD NEW</button>
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
          <h3>Названиe</h3>
          <input class="input" required v-model="vmodelItem.name" type="text" />
        </div>
        <div class="input__holder">
          <h3>Описание</h3>
          <textarea
            required
            v-model="vmodelItem.desc"
            name=""
            cols="30"
            rows="5"
          ></textarea>
        </div>
        <div class="input__holder">
          <h3>Цена</h3>
          <input
            class="input"
            required
            v-model="vmodelItem.price"
            type="number"
          />
        </div>
        <div class="input__holder">
          <h3>Тип</h3>
          <select class="input" required v-model="vmodelItem.type" name="">
            <option value="Комерческое">Комерческое</option>
            <option value="Жилое">Жилое</option>
          </select>
        </div>
        <div class="input__button">
          <button
            @click.prevent="delItem"
            class="form__add"
            v-if="vmodelItem.state === 'Update'"
          >
            Delete
          </button>
          <input class="form__add" :value="vmodelItem.state" type="submit" />
        </div>
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
import { reactive, toRefs, ref, watch } from "vue";
import { useFetch } from "@/hooks/fetch";
export default {
  setup() {
    const displayQty = ref(10);
    const filterType = ref("all");
    const state = reactive({
      items: 10,
      modal: false,
      maxIndex: null,
      addIndex: null,
      pagesQty: 5,
      updateItem: {},
      currentPage: 1,
      vmodelItem: {},
      loading: false,
    });
    watch(displayQty, (newValue, oldValue) => {
      getItems(0, newValue, filterType.value);
      state.pagesQty = state.maxIndex % newValue > 0 ? (state.maxIndex - state.maxIndex % newValue)/ newValue +1 : state.maxIndex / newValue//  = Math.floor(state.maxIndex / newValue) + 1;
      state.currentPage = 1;
    });
    watch(filterType, (newValue, oldValue) => {
      getCount();
      state.currentPage = 1;
      getItems(0, displayQty.value, filterType.value);
    });

    const selectPage = (n) => {
      state.currentPage = n;
      getItems((n - 1) * displayQty.value, displayQty.value, filterType.value);
    };
    const outsideClick = (e) => {
      const f = document.getElementById("addform"); // don't do it in vue!!! use costom directive
      if (!f.contains(e.target)) {
        state.modal = false;
      }
    };
    //READ
    const getCount = async () => {
      const { request, response, loading } = useFetch(
        `/api/items?count=${filterType.value}`
      );
      await request();
      state.maxIndex = response.value;
      !state.addIndex && (state.addIndex = response.value);
      // state.pagesQty = Math.floor(state.maxIndex / displayQty.value) + 1;
      state.pagesQty = state.maxIndex % displayQty.value > 0 ? (state.maxIndex - state.maxIndex % displayQty.value)/ displayQty.value +1 : state.maxIndex / displayQty.value
    };

    const getItems = async (offset, limit, fType) => {
      const { request, response, loading } = useFetch(
        `/api/items?lim=${limit}&offset=${offset}&itemstype=${fType}`
      );
      state.loading = loading;
      await request();
      state.items = response;
    };
    // INIT
    getCount();
    getItems(0, displayQty.value, filterType.value);

    //CREATE
    const addClearState = () => {
      state.modal = true;
      state.vmodelItem = {};
      state.vmodelItem.state = "Add";
    };
    const changeItem = (i) => {
      state.modal = true;
      //COPY OBJECT WITH SAVE STATE MABY IT HAS A BEST WAY
      state.vmodelItem = JSON.stringify(state.items[i]);
      state.vmodelItem = JSON.parse(state.vmodelItem);
      state.vmodelItem.state = "Update";
      // COPY ID AND TYPE TO UPDATE AND DELETE
      state.updateItem.id = state.items[i].id;
      state.updateItem.type = state.items[i].type;
    };
    const addItem = async () => {
      if (state.vmodelItem.state === "Add") {
        const { request, loading } = useFetch("/api/items?add=true", {
          method: "POST",
          body: JSON.stringify({
            index: ++state.addIndex,
            type: state.vmodelItem["Тип"],
            ...state.vmodelItem,
          }),
        });
        state.loading = loading;
        await request();
      }
      if (state.vmodelItem.state === "Update") {
        const { id, type } = state.updateItem;
        const { request, loading } = useFetch(
          `/api/items?update=true&type=${type}&id=${id}`,
          {
            method: "POST",
            body: JSON.stringify({
              ...state.vmodelItem,
            }),
          }
        );
        state.loading = loading;
        await request();
      }
      //CLEAR STATE
      state.modal = false;
      state.vmodelItem = {};
      //UPDATE LIST
      getItems(
        (state.currentPage - 1) * displayQty.value,
        displayQty.value,
        filterType.value
      );
    };
    //UPDATE

    const updateItemDB = async (id, type) => {
      const { request, loading } = useFetch(
        `/api/items?id=${id}&type=${type}`,
        {
          method: "POST",
          body: JSON.stringify({
            ...state.vmodelItem,
          }),
        }
      );
      await request();
    };
    //DELETE
    const delItem = async () => {
      const { id, type } = state.updateItem;
      const { request, loading } = useFetch(
        `/api/items?delete=true&id=${id}&type=${type}`
      );
      state.loading = loading;
      await request();
      state.modal = false;
      state.vmodelItem = {};
      getItems(
        (state.currentPage - 1) * displayQty.value,
        displayQty.value,
        filterType.value
      );
    };
    return {
      selectPage,
      filterType,
      addClearState,
      updateItemDB,
      delItem,
      getItems,
      displayQty,
      outsideClick,
      addItem,
      changeItem,
      ...toRefs(state),
    };
  },
};
</script>

<style lang="css">
:root {
  --border__color: orange;
}

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
select {
  min-height: 30px;
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
.items{
  height: 100%;
}
.items__holder {
  margin-bottom: 15vh;
  /* max-height: 80vh;
  overflow-y: auto; */
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
  transition: transform 0.5s;
}
.modal__close:hover {
  transform: scale(1.2);
  transition: transform 0.5s;
}
.modal__additem {
  display: grid;
  position: relative;
  height: inherit;
}
.modal__form {
  place-self: center;
  position: relative;
  display: grid;
  row-gap: 1.5vh;
  width: min(700px, 95vw);
  min-height: max(300px, 50vh);
  border-radius: 5px;
  border: 1px solid var(--border__color);
  padding: 4vh 2vw;
  background-color: white;
}
.form__add {
  place-self: center end;
  min-height: 30px;
  min-width: 100px;
}
.input__holder {
  width: 100%;
  margin: auto;
  display: grid;
  /* min-height: 40px; */
  grid-template-columns: 1fr 4fr;
  margin: 0;
}
.input__button {
  width: 100%;
  margin: auto;
  display: grid;
  justify-content: space-evenly;
  grid-auto-flow: column;
  /* min-height: 40px; */
  /* grid-template-columns: 1fr 4fr; */
  margin: 0;
}
.input__holder > h3 {
  place-self: center start;
}
.list__item {
  min-height: 40px;
  margin-top: 3vh;
  margin-left: 3vw;
  margin-right: 3vw;
  border: 1px solid var(--border__color);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  padding: 1vh;
  cursor: pointer;
}

/* .modal__close__icon {
} */
@media (max-width: 450px) {
  .input__holder {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: 1fr;
    /* grid-template-rows: 1fr 1fr; */
  }
  .header > h1 {
    text-align: start;
  }
}
.pagination {
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: white;
}
.pagination__numbers {
  display: block;
  border: 1px solid black;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border-radius: 5px;
  /* margin: 5px; */
  cursor: pointer;
}
.numbering__holder{
  display: grid;
  column-gap: 1vw;
  justify-content: center;
  grid-template-columns: 30px 170px 30px;
}
.numbering{
/* display: flex; */
display: grid;
grid-auto-flow: column;
grid-auto-columns: 30px;
column-gap: 5px;
width: 170px;
overflow: hidden;
left: 50%;
position: relative;
transform: translateX(-50%);
}
.pagination__numbers:hover {
  border: 1px solid var(--border__color);
}
.exzact__pagination {
  background-color: var(--border__color);
}
.pagination__arrow{
  cursor: pointer;
  width: 30px;
  height: 30px;
}
.add__button {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
.preloader {
  height: inherit;
  width: 100%;
  display: grid;
  background-color: rgba(255, 255, 255, 0.8);
  position: fixed;
  top: 0;
  left: 0;
}
.blured {
  filter: blur(3px);
}
.filter {
  position: absolute;
  right: 5px;
}
.header {
  z-index: 2;
  position: sticky;
  background-color: rgb(255, 255, 255);
  box-shadow: 0px 5px 5px 0px #0000003b;
  border: 1px solid var(--border__color);
  top: 0px;
  margin: 1vh;
  padding: 5px;
  border-radius: 5px;
  display: grid;
  grid-auto-flow: column;
}
/* PRELOADER */

.lds-ellipsis {
  place-self: center;
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ellipsis div {
  position: absolute;
  top: 33px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: orange;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.lds-ellipsis div:nth-child(1) {
  left: 8px;
  animation: lds-ellipsis1 0.6s infinite;
}
.lds-ellipsis div:nth-child(2) {
  left: 8px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(3) {
  left: 32px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(4) {
  left: 56px;
  animation: lds-ellipsis3 0.6s infinite;
}
@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(24px, 0);
  }
}
</style>