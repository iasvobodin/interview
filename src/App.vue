<template>
  <main class="items">
    <section class="header">
      <h1>Title</h1>
      <div class="filter">
        <p>Фильтр по типу</p>
        <select v-model="filterType" name="" id="">
          <option selected value="all">Все</option>
          <option value="Жилое">Жилое</option>
          <option value="Коммерческое">Коммерческое</option>
        </select>
      </div>
    </section>
    <section class="items__holder">
      <div 
        @click="changeItem(index)" 
        :class="{ blured: loading }" 
        class="list__item" 
        v-for="(item, index) in items"
        :key="item.id"
        >
        <div><b>Название: </b>{{ item.name }}</div>
        <div><b>Описание: </b>{{ item.desc }}</div>
        <div><b>Цена: $ </b>{{ item.price }}</div>
        <div><b>Тип: </b>{{ item.type }}</div>
      </div>
    </section>
    <!-- <ul role="list" class="items__holder">
      <li 
        @click="changeItem(index)" 
        :class="{ blured: loading }" 
        class="list__item" 
        v-for="(item, index) in items"
        :key="item.id"
      >
        <div><b>Название: </b>{{ item.name }}</div>
        <div><b>Описание: </b>{{ item.desc }}</div>
        <div><b>Цена: $ </b>{{ item.price }}</div>
        <div><b>Тип: </b>{{ item.type }}</div>
      </li>
    </ul> -->
    <transition name="form">
      <div v-if="loading" class="preloader">
        <pre-loader />
      </div>
    </transition>
    <section class="pagination">
      <div class="numbering__holder">
        <img @click="currentPageView--" style="transform: rotate(180deg);" class="pagination__arrow" src="/img/next.svg"
          alt="next">
        <div class="numbering">
          <span :class="{ exzact__pagination: currentPage === n }" class="pagination__numbers" @click="selectPage(n)"
            v-for="n in pagesQty" :key="n">
            {{ n }}
          </span>
        </div>
        <img @click="currentPageView++" class="pagination__arrow" src="/img/next.svg" alt="next">
      </div>
      <div class="view__select">
        Отображать по
        <select v-model="displayQty" name="" id="">
          <option v-for="n in [10, 20, 30]" :key="n">{{ n }}</option>
        </select>
      </div>
      <div class="add__button">
        <img @click="addClearState" src="/img/add.svg" alt="add">
      </div>
    </section>
  </main>
  <transition name="form">
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
              <option value="Коммерческое">Коммерческое</option>
              <option value="Жилое">Жилое</option>
            </select>
          </div>
          <div class="input__button">
            <button :disabled="loading" @click.prevent="delItem" class="form__add" v-if="vmodelItem.state === 'Update'">
              Delete
            </button>
            <input :disabled="loading" class="form__add" :value="vmodelItem.state" type="submit" />
          </div>
          <div class="modal__close">
            <img class="modal__close__icon" @click="modal = false" src="/img/cancel.svg" alt="" />
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script>
import { reactive, toRefs, ref, watch } from "vue";
import { useFetch } from "@/hooks/fetch";
import anime from "animejs";
import preLoader from  "@/components/loader.vue";
export default {
  components: {
    preLoader,
  },
  setup() {
    // WATCH STATE
    const displayQty = ref(10);
    const filterType = ref("all");
    const currentPageView = ref(0);

    const state = reactive({
      //STATE
      maxIndex: null,
      addIndex: null,
      pagesQty: 5,
      currentPage: 1,
      pageViewQty: null,

      //DATA
      items: 10,
      updateItem: {},
      vmodelItem: {},
      //FLAGS
      modal: false,
      loading: false,
    });

    watch(displayQty, (newValue) => {
      getItems(0, newValue, filterType.value);
      state.pagesQty = Math.ceil(state.maxIndex / newValue);
      state.pageViewQty = Math.ceil(state.pagesQty / 5) - 1
      state.currentPage = 1;
    });

    watch(filterType, (newValue) => {
      getCount();
      state.currentPage = 1;
      getItems(0, displayQty.value, newValue);
    });

    watch(currentPageView, (newValue, oldValue) => {
      let direction = newValue > oldValue ? 'normal' : 'reverse'

      if (newValue < 0) {
        currentPageView.value = 0
      }
      if (newValue > state.pageViewQty) {
        currentPageView.value = state.pageViewQty
      }

      const pag = anime({
        targets: ".pagination__numbers",
        translateX: -175 * currentPageView.value,
        easing: 'linear',
        autoplay: false,
        duration: 250,
        delay: anime.stagger(30, {
          direction
        })
      })
      pag.play()
    });

    //DOOM EVENTS

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

    const selectPage = (n) => {
      state.currentPage = n;
      getItems((n - 1) * displayQty.value, displayQty.value, filterType.value);
    };

    const outsideClick = (e) => {
      const f = document.getElementById("addform"); // sorry for that, on future need to use costom directive
      if (!f.contains(e.target)) {
        state.modal = false;
      }
    };

    const addClearState = () => {
      state.modal = true;
      state.vmodelItem = {};
      state.vmodelItem.state = "Add";
    };
    //FETCH

    //GET QTY ELEMENTS
    const getCount = async () => {
      const {
        request,
        response,
        loading
      } = useFetch(
        `/api/items?count=${filterType.value}`
      );
      await request();
      state.maxIndex = response.value;
      !state.addIndex && (state.addIndex = response.value - 1);
      state.pagesQty = Math.ceil(state.maxIndex / displayQty.value);
      state.pageViewQty = Math.ceil(state.pagesQty / 5) - 1 //index start from 0
    };
    //READ ALL
    const getItems = async (offset, limit, fType) => {
      const {
        request,
        response,
        loading
      } = useFetch(
        `/api/items?lim=${limit}&offset=${offset}&itemstype=${fType}`
      );
      state.loading = loading;
      await request();
      state.items = response;
    };

    // CREATE UPDATE
    const addItem = async () => {
      state.modal = false;
      if (state.vmodelItem.state === "Add") {
        const {
          request,
          loading
        } = useFetch("/api/items?add=true", {
          method: "POST",
          body: JSON.stringify({
            index: ++state.addIndex,
            ...state.vmodelItem,
          }),
        });
        state.loading = loading;
        await request();
      }
      if (state.vmodelItem.state === "Update") {
        const {
          id,
          type
        } = state.updateItem;
        const {
          request,
          loading
        } = useFetch(
          `/api/items?update=true&type=${type}&id=${id}`, {
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
      state.vmodelItem = {};
      //UPDATE LIST
      getItems(
        (state.currentPage - 1) * displayQty.value,
        displayQty.value,
        filterType.value
      );
    };
    //DELETE
    const delItem = async () => {
      state.modal = false;
      const {
        id,
        type
      } = state.updateItem;
      const {
        request,
        loading
      } = useFetch(
        `/api/items?delete=true&id=${id}&type=${type}`
      );
      state.loading = loading;
      await request();
      state.vmodelItem = {};
      getItems(
        (state.currentPage - 1) * displayQty.value,
        displayQty.value,
        filterType.value
      );
    };
    // INIT
    getCount();
    getItems(0, displayQty.value, filterType.value);

    return {
      currentPageView,
      selectPage,
      filterType,
      addClearState,
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
  --card__hover:repeating-linear-gradient(135deg, rgba(255,168,0, 0.09) 0px, rgba(255,168,0, 0.09) 1px,transparent 1px, transparent 11px),repeating-linear-gradient(45deg, rgba(255,168,0, 0.09) 0px, rgba(255,168,0, 0.09) 1px,transparent 1px, transparent 11px),linear-gradient(90deg, hsl(183,0%,100%),hsl(183,0%,100%));
  --card__image: repeating-linear-gradient(135deg, hsla(35,0%,71%,0.09) 0px, hsla(35,0%,71%,0.09) 1px,transparent 1px, transparent 11px),repeating-linear-gradient(45deg, hsla(35,0%,71%,0.09) 0px, hsla(35,0%,71%,0.09) 1px,transparent 1px, transparent 11px),linear-gradient(90deg, hsl(183,0%,100%),hsl(183,0%,100%));
  --bg__color: rgb(128, 225, 255);
  --bg__image: linear-gradient(135deg, rgba(244, 244, 244,0.07) 0%, rgba(244, 244, 244,0.07) 12.5%,rgba(211, 211, 211,0.07) 12.5%, rgba(211, 211, 211,0.07) 25%,rgba(178, 178, 178,0.07) 25%, rgba(178, 178, 178,0.07) 37.5%,rgba(145, 145, 145,0.07) 37.5%, rgba(145, 145, 145,0.07) 50%,rgba(113, 113, 113,0.07) 50%, rgba(113, 113, 113,0.07) 62.5%,rgba(80, 80, 80,0.07) 62.5%, rgba(80, 80, 80,0.07) 75%,rgba(47, 47, 47,0.07) 75%, rgba(47, 47, 47,0.07) 87.5%,rgba(14, 14, 14,0.07) 87.5%, rgba(14, 14, 14,0.07) 100%),linear-gradient(45deg, rgba(236, 236, 236,0.07) 0%, rgba(236, 236, 236,0.07) 12.5%,rgba(210, 210, 210,0.07) 12.5%, rgba(210, 210, 210,0.07) 25%,rgba(183, 183, 183,0.07) 25%, rgba(183, 183, 183,0.07) 37.5%,rgba(157, 157, 157,0.07) 37.5%, rgba(157, 157, 157,0.07) 50%,rgba(130, 130, 130,0.07) 50%, rgba(130, 130, 130,0.07) 62.5%,rgba(104, 104, 104,0.07) 62.5%, rgba(104, 104, 104,0.07) 75%,rgba(77, 77, 77,0.07) 75%, rgba(77, 77, 77,0.07) 87.5%,rgba(51, 51, 51,0.07) 87.5%, rgba(51, 51, 51,0.07) 100%),linear-gradient(90deg, #ffffff,#ffffff);
  /* --bg__image: linear-gradient(112.5deg, rgb(214, 214, 214) 0%, rgb(214, 214, 214) 10%,rgb(195, 195, 195) 10%, rgb(195, 195, 195) 53%,rgb(176, 176, 176) 53%, rgb(176, 176, 176) 55%,rgb(157, 157, 157) 55%, rgb(157, 157, 157) 60%,rgb(137, 137, 137) 60%, rgb(137, 137, 137) 88%,rgb(118, 118, 118) 88%, rgb(118, 118, 118) 91%,rgb(99, 99, 99) 91%, rgb(99, 99, 99) 100%),linear-gradient(157.5deg, rgb(214, 214, 214) 0%, rgb(214, 214, 214) 10%,rgb(195, 195, 195) 10%, rgb(195, 195, 195) 53%,rgb(176, 176, 176) 53%, rgb(176, 176, 176) 55%,rgb(157, 157, 157) 55%, rgb(157, 157, 157) 60%,rgb(137, 137, 137) 60%, rgb(137, 137, 137) 88%,rgb(118, 118, 118) 88%, rgb(118, 118, 118) 91%,rgb(99, 99, 99) 91%, rgb(99, 99, 99) 100%),linear-gradient(135deg, rgb(214, 214, 214) 0%, rgb(214, 214, 214) 10%,rgb(195, 195, 195) 10%, rgb(195, 195, 195) 53%,rgb(176, 176, 176) 53%, rgb(176, 176, 176) 55%,rgb(157, 157, 157) 55%, rgb(157, 157, 157) 60%,rgb(137, 137, 137) 60%, rgb(137, 137, 137) 88%,rgb(118, 118, 118) 88%, rgb(118, 118, 118) 91%,rgb(99, 99, 99) 91%, rgb(99, 99, 99) 100%),linear-gradient(90deg, rgb(195, 195, 195),rgb(228, 228, 228)); background-blend-mode:overlay,overlay,overlay,normal; */
}



.header {
  z-index: 2;
  position: sticky;
  min-height: 60px;
  /* background-color: rgb(255, 255, 255); */
  /* box-shadow: 0px 5px 5px 0px #0000003b; */
  border-bottom: 1px solid var(--border__color);
  top: 0px;
  background-image: var(--bg__image);
  padding: 5px;
  /* border-radius: 5px; */
  display: grid;
  grid-auto-flow: column;
}

.items {
  height: 100%;
}

.items__holder {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(max(40vw, 250px), 1fr));
  margin-bottom: calc(3vh + 90px);
}
.list__item {
  min-height: 40px;
  margin-top: 3vh;
  margin-left: 3vw;
  margin-right: 3vw;
  border: 1px solid var(--border__color);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
   background-image: var(--card__image);
  border-radius: 5px;
  padding: 1vh;
  cursor: pointer;
}
.list__item:hover{
   background-image: var(--card__hover);
}

.pagination {
  background-image: var(--bg__image);
  position: fixed;
  bottom: 0;
  width: 100%;
  min-height: 80px;
  padding: 10px 0px;
  border-top: 1px solid var(--border__color);
}

.pagination__numbers {
  display: block;
  border: 1px solid black;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
}

.numbering__holder {
  display: grid;
  column-gap: 1vw;
  justify-content: center;
  grid-template-columns: 30px auto 30px;
}

.numbering {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 30px;

  column-gap: 5px;
  max-width: 170px;
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

.pagination__arrow {
  cursor: pointer;
  width: 30px;
  height: 30px;
}

.view__select {
  display: inline-block;
  width: 100%;
  text-align: center;
  margin-top: 10px;
}

.add__button {
  position: absolute;
  bottom: 25px;
  right: 25px;
  width: 40px;
  height: 40px;
  cursor: pointer;
}

 /* MODAL */

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
  min-height: max(300px, 45vh);
  border-radius: 5px;
  border: 1px solid var(--border__color);
  padding: 4vh 2vw;
  background-color: white;
  background-image: var(--card__image);
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
  grid-template-columns: 1fr 4fr;
  margin: 0;
}

.input__button {
  width: 100%;
  margin: auto;
  display: grid;
  justify-content: end;
  grid-auto-flow: column;
  grid-auto-columns: auto;
  column-gap: 2vw;
  margin: 0;
}

.input__holder>h3 {
  place-self: center start;
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

/* TRANSITIONS */
.form-enter-active,
.form-leave-active {
  transition: opacity 0.3s ease;
}

.form-enter-from,
.form-leave-to {
  opacity: 0;
}


@media (max-width: 450px) {
  .input__holder {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: 1fr;
  }

  .header>h1 {
    text-align: start;
  }
}
</style>