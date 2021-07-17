<template>
  <div class="items">
    <h1>Недвижимость</h1>
    <ul role='list' class="items__holder">
      <li  @click="changeItem(index)" class="list__item" v-for="(item, index) in items" :key="item.id">
        <div>
         Название: {{item['Название']}}
        </div>
      </li>
    </ul>
    <div class="add__button">
      <button @click="modal = true">ADD</button>
    </div>
  </div>
  <div v-if="modal" class="modal">
    <div @mousedown="outsideClick($event)" class="modal__additem">
      <form @submit.prevent="addItem" id="addform" class="modal__form" action="">
        <div class="input__holder">
          <p>Названиe</p>
          <input required v-model="updateItem['Название']" type="text">
        </div>
        <div class="input__holder">
          <p>Описание</p>
          <textarea required v-model="updateItem['Описание']" name="" cols="30" rows="10"></textarea>
        </div>
        <div class="input__holder">
          <p>Цена</p>
          <input required v-model="updateItem['Цена']" type="number">
        </div>
        <div class="input__holder">
          <p>Тип</p>
          <select required v-model="updateItem['Тип']" name="">
            <option value="Коммерческое">Коммерческое
            </option>
            <option value="Жилое">Жилое
            </option>
          </select>
        </div>
        <input value="add" type="submit">
      </form>
    </div>
    <div class="modal__close">
      <button @click="modal = false">close</button>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { useFetch } from '@/hooks/fetch'
export default {
  setup () {
    const state = reactive({
      items: null,
      modal: false,
      template:{
        "Название":"",
        "Описание":"",
        "Цена":"",
        "Тип":["Коммерческое", "Жилое"]
      },
      maxId:null,
      pagesQty:null,
      updateItem:{},
    })
    const outsideClick = (e) =>{
      const f = document.getElementById('addform') // don't do it in vue!!! use costom directive
      !f.contains(e.target) && (state.modal = false);
    }
      //READ
      const getItems = async () => {
      const { request, response } = useFetch('/api/items')
      await request()
      state.items = response
      state.maxId = response.value[0].id
      }
      getItems()
      //CREATE
      const addItem = async () => {
        const id = ++state.maxId;
      const { request, response } = useFetch('/api/items?add=true',{
        method: "POST",
        body: JSON.stringify({
          id: id.toString(),
          type: state.updateItem['Тип'],
          ...state.updateItem,
        })
      })
      await request()
      //clear state
      state.modal = false;
      state.updateItem = {}
      getItems()
      }
      //UPDATE
      const changeItem = (i)=>{
        state.modal = true;
        state.updateItem = state.items[i]

      }
      const updateItem = async () => {
      const { request, response } = useFetch('/api/items',{
        method: "POST",
        // body: {...}
      })
      await request()
      }
      //DELETE
      const delItem = async () => {
      const { request, response } = useFetch('/api/items',{
        method: "POST",
        // body: {...}
      })
      await request()
      }
    return {
      outsideClick,
      addItem,
      changeItem,
      ...toRefs(state),
    }
  }
}
</script>

<style lang="css" scoped>
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
ul[role='list'],
ol[role='list'] {
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

/* Remove all animations, transitions and smooth scroll for people that prefer not to see them */
@media (prefers-reduced-motion: reduce) {
  html:focus-within {
   scroll-behavior: auto;
  }
  
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

.modal{
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.514);
}
.modal__close{
  position: fixed;
  top: 30px;
  right: 30px;
}
.modal__additem{
  
  display: grid;
  height: inherit;
}
.modal__form{
  place-self: center;
  width: min(700px, 95vw);
  min-height: max(300px, 50vh);
  border-radius: 5px;
  border: 1px solid black;
  padding: 15px;
  background-color: white;

}
.input__holder{
  margin: auto;
}
.list__item{
  min-height: 40px;
  margin-top: 1vh;
  border: 1px solid orange;
  cursor: pointer;
}
</style>