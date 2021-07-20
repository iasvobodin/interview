<template>
  <div class="items">
    <h1>Недвижимость</h1>
    <p>Фильтр по типу</p>
    <select v-model="filterType" name="" id="">
       <option selected value="all">Все</option>
      <option value="Жилое">Жилое</option>
       <option value="Комерческое">Комерческое</option>
    </select>
    <ul role="list" class="items__holder">
      <li @click="changeItem(index)" class="list__item" v-for="(item, index) in items" :key="item.id">
        <div>Название: {{ item.name }}</div>
        <div>Описание: {{ item.desc }}</div>
        <div>Цена: ${{ item.price }}</div>
        <div>Тип: {{ item.type }}</div>
        <div>index: {{ item.index }}</div>
      </li>
    </ul>
    <div class="pagination">
      <div class="numbering">
        <span :class="{ exzact__pagination: currentPage === n }" class="pagination__numbers" @click="selectPage(n)"
          v-for="n in pagesQty" :key="n">
          {{ n }}
        </span>
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
      <form @submit.prevent="addItem" id="addform" class="modal__form" action="">
        <div class="input__holder">
          <h3>Названиe</h3>
          <input class="input" required v-model="vmodelItem.name" type="text" />
        </div>
        <div class="input__holder">
          <h3>Описание</h3>
          <textarea required v-model="vmodelItem.desc" name="" cols="30" rows="5"></textarea>
        </div>
        <div class="input__holder">
          <h3>Цена</h3>
          <input class="input" required v-model="vmodelItem.price" type="number" />
        </div>
        <div class="input__holder">
          <h3>Тип</h3>
          <select class="input" required v-model="vmodelItem.type" name="">
            <option value="Комерческое">Комерческое</option>
            <option value="Жилое">Жилое</option>
          </select>
        </div>
        <div class="input__button" >
          <button @click.prevent="delItem" class="form__add" v-if="vmodelItem.state === 'Update'">Delete</button>
          <input  class="form__add" :value="vmodelItem.state" type="submit" />
        </div>
        <div class="modal__close">
          <img class="modal__close__icon" @click="modal = false" src="/img/cancel.svg" alt="" />
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
    const filterType = ref('all')
    const state = reactive({
      items: null,
      modal: false,
      maxIndex: null,
      pagesQty: null,
      updateItem: {},
      currentPage: 1,
      vmodelItem: {},
    });
    watch(displayQty, (newValue, oldValue) => {
      getItems(0, newValue, filterType.value);
      state.pagesQty = Math.floor(state.maxIndex / newValue) + 1;
      state.currentPage = 1;
    });
        watch(filterType, (newValue, oldValue) => {
          getCount()
          getItems((state.currentPage - 1) * displayQty.value, displayQty.value, filterType.value);
    });

    const selectPage = (n) => {
      state.currentPage = n;
      getItems((n - 1) * displayQty.value, displayQty.value, filterType.value);
    };
    const outsideClick = (e) => {
      const f = document.getElementById("addform"); // don't do it in vue!!! use costom directive
      if(!f.contains(e.target)){
        state.modal = false
        
      };

    };
    //READ
    const getCount = async ()=>{
      const { request, response} = useFetch(
        `/api/items?count=${filterType.value}`
      );
      await request();
      state.maxIndex = response.value
       state.pagesQty = Math.floor(state.maxIndex / displayQty.value) + 1;
    } 
    
    const getItems = async (offset, limit, fType) => {
      const { request, response } = useFetch(
        `/api/items?lim=${limit}&offset=${offset}&itemstype=${fType}`
      );
      await request();
      state.items = response;
    };
    // INIT
    getCount()
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
      state.vmodelItem = JSON.parse(state.vmodelItem)
      state.vmodelItem.state = "Update";
      // COPY ID AND TYPE TO UPDATE AND DELETE
      state.updateItem.id = state.items[i].id;
      state.updateItem.type = state.items[i].type;
    };
    const addItem = async () => {
      if (state.vmodelItem.state === "Add") {
        const { request } = useFetch("/api/items?add=true", {
          method: "POST",
          body: JSON.stringify({
            index: ++state.maxIndex,
            type: state.vmodelItem["Тип"],
            ...state.vmodelItem,
          }),
        });
        await request();
      }
      if (state.vmodelItem.state === "Update") {
        const { id, type } = state.updateItem;
        const { request } = useFetch(
          `/api/items?update=true&type=${type}&id=${id}`,
          {
            method: "POST",
            body: JSON.stringify({
              ...state.vmodelItem,
            }),
          }
        );
        await request();
      }
      //CLEAR STATE
      state.modal = false;
      state.vmodelItem = {};
      //UPDATE LIST
      getItems((state.currentPage - 1) * displayQty.value, displayQty.value, filterType.value);
    };
    //UPDATE

    const updateItemDB = async (id, type) => {
      const { request } = useFetch(`/api/items?id=${id}&type=${type}`, {
        method: "POST",
        body: JSON.stringify({
          ...state.vmodelItem,
        }),
      });
      await request();
    };
    //DELETE
    const delItem = async () => {
      const { id, type } = state.updateItem;
      const { request} = useFetch(`/api/items?delete=true&id=${id}&type=${type}`);
      await request();
       state.modal = false;
       state.vmodelItem = {};
        getItems((state.currentPage - 1) * displayQty.value, displayQty.value, filterType.value);
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
select{
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
}
.modal__close:hover{
  border: 2px solid red;
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
  border: 1px solid black;
  padding: 4vh 2vw;
  background-color: white;
}
.form__add{
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
.input__button{
width: 100%;
  margin: auto;
  display: grid;
  justify-content: space-evenly;
  grid-auto-flow: column;
  /* min-height: 40px; */
  /* grid-template-columns: 1fr 4fr; */
  margin: 0;
}
.input__holder>h3{
  place-self: center start
}
.list__item {
  min-height: 40px;
  margin-top: 3vh;
  margin-left: 3vw;
  margin-right: 3vw;
  border: 1px solid orange;
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
}
.pagination{
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: white;
}
.pagination__numbers {
  display: inline-block;
  border: 1px solid black;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border-radius: 5px;
  margin: 5px;
  cursor: pointer;
}
.pagination__numbers:hover {
  border: 1px solid orange;
}
.exzact__pagination {
  background-color: orange;
}
.add__button{
  position: fixed;
  bottom: 20px;
  right: 20px;
  
}
</style>