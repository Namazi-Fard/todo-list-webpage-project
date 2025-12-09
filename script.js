const themeSwitcherBtn = document.getElementById("theme-switcher");
const bodyTag = document.querySelector("body");
const addBtn = document.getElementById("add-btn");
const todoInput = document.getElementById("addt");
const ul = document.querySelector(".todos");
const filter = document.querySelector(".filter");
const btnFilter = document.querySelector("#clear-completed");
// start of main function----------------------------------
function main() {
  // Theme-Switcher
  themeSwitcherBtn.addEventListener("click", () => {
    bodyTag.classList.toggle("light");
    const themeImg = themeSwitcherBtn.children[0];
    themeImg.setAttribute(
      "src",
      themeImg.getAttribute("src") === "./assets/images/icon-sun.svg"
        ? "./assets/images/icon-moon.svg"
        : "./assets/images/icon-sun.svg"
    );
  });
  makeTodoElement(JSON.parse(localStorage.getItem("todos")));
  // set dragover for ul
  ul.addEventListener("dragover", (e) => {
    // for prevent default behavior
    // e.targert is the element that is being dragged over
    // e is the event object
    e.preventDefault();
    if (
      e.target.classList.contains("card") &&
      //Exept the element that is being dragged
      !e.target.classList.contains("dragging")
    ) {
      const draggingCard = document.querySelector(".dragging");
      //using spread operator to convert nodeList to array
      const cards = [...ul.querySelectorAll(".card")];
      const currentPos = cards.indexOf(draggingCard);
      const newPos = cards.indexOf(e.target);
      //   for debugging and seeing the positions
      //   console.log(currentPos, newPos);
      // ------------------------------------------------------
      //Insert the dragging element before or after the target element based on position
      if (currentPos > newPos) {
        ul.insertBefore(draggingCard, e.target);
      } else {
        ul.insertBefore(draggingCard, e.target.nextSibling);
      }
      //now we should save the changes to localStorage-update the localStorage- if page refresh,we save the changes.
      const todos = JSON.parse(localStorage.getItem("todos"));
      const removed = todos.splice(currentPos, 1);
      todos.splice(newPos, 0, removed[0]);
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  });
  //Add Todo In LocalStorage after clicking addBtn.
  addBtn.addEventListener("click", () => {
    const item = todoInput.value.trim();
    if (item) {
      todoInput.value = "";
      const todos = !localStorage.getItem("todos")
        ? []
        : JSON.parse(localStorage.getItem("todos"));

      const currentTodo = {
        item: item,
        isCompleted: false,
      };

      todos.push(currentTodo);
      localStorage.setItem("todos", JSON.stringify(todos));
      //   by clicking addBtn,we send the array to "makeTodoElement" function and  create a new todo element imidiately.
      makeTodoElement([currentTodo]);
    }
  });
  //Add Todo In LocalStorage after pressing Enter key.
  todoInput.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      //JS Actions 'click' on the selected  element "for now selected  element is : addBtn".
      addBtn.click();
    }
  });
  filter.addEventListener("click", (e) => {
    const id = e.target.id;
    if (id) {
      document.querySelector(".on").classList.remove("on");
      document.getElementById(id).classList.add("on");
      document.querySelector(".todos").className = `todos ${id}`;
    }
  });

  btnFilter.addEventListener("click", () => {
    var deleteIndexes = [];
    document.querySelectorAll(".card.checked").forEach((card) => {
      deleteIndexes.push(
        [...document.querySelectorAll(".todos .card")].indexOf(card)
      );
      card.classList.add("fall");
      card.addEventListener("animationend", () => {
        card.remove();
      });
    });

    removeMultipleTodos(deleteIndexes);
  });
}
//start of makeTodoElement function -----------------------
function makeTodoElement(todoArray) {
  if (!todoArray) {
    return null;
  }
  //befor forech loop,we declare ItemsLeft to display the number of left tasks.
  const ItemsLeft = document.querySelector("#items-left");

  todoArray.forEach((todoObject) => {
    //Create Html Elements Of Todo--------------------------------------------------------------
    const card = document.createElement("li");
    const cbContainer = document.createElement("div");
    const cbInput = document.createElement("input");
    const checkSpan = document.createElement("span");
    const item = document.createElement("p");
    const clearBtn = document.createElement("button");
    const img = document.createElement("img");

    //Add Classes------------------------------------------------------------------------------
    card.classList.add("card");
    cbContainer.classList.add("cb-container");
    cbInput.classList.add("cb-input");
    checkSpan.classList.add("check");
    item.classList.add("item");
    clearBtn.classList.add("clear");
    //Add Attributes---------------------------------------------------------------------------
    card.setAttribute("draggable", true);
    cbInput.setAttribute("type", "checkbox");
    img.setAttribute("src", "./assets/images/icon-cross.svg");
    img.setAttribute("alt", "Clear It");
    item.textContent = todoObject.item;
    //after reloading the page ,if the todoObject is completed we add 'checked' class to card and set the checkbox to checked.
    if (todoObject.isCompleted) {
      card.classList.add("checked");
      //html checknox
      cbInput.setAttribute("checked", "checked");
    }

    //Add EventListener-----------------------------------------------------------------------
    card.addEventListener("dragstart", () => {
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });
    cbInput.addEventListener("click", () => {
      // select the parent element of cbInput(that is cb-container) and then select its parent(that is card element).
      const currentCard = cbInput.parentElement.parentElement;
      //if checkbox is checked return true ,else not checked return false in "const checked".
      const checked = cbInput.checked;
      const currentCardIndex = [
        ...document.querySelectorAll(".todos .card"),
      ].indexOf(currentCard);
      //give the index of current card and its checked state to stateTodo function to change isCompleted property in localStorage.
      stateTodo(currentCardIndex, checked);
      //if cheched=true we add 'checked' class to current card else we remove it.
      checked
        ? currentCard.classList.add("checked")
        : currentCard.classList.remove("checked");

      ItemsLeft.textContent = document.querySelectorAll(
        //all cards that don't have 'checked' class but amount of them with ".length" .
        ".todos .card:not(.checked)"
      ).length;
    });
    // by pressing clearBtn,we remove the current todo element(card) from the list and localStorage.
    clearBtn.addEventListener("click", () => {
      //with 'parentElement' we go to the parent of clearBtn(that is in card(ul) element).
      const currentCard = clearBtn.parentElement;
      //add fall class for delete a task.
      currentCard.classList.add("fall");
      //now we should remove this deleted task from localStorage.
      //we get the index of current card and send it to removeTodo function.
      const indexOfCurrentCard = [
        //get all cards as nodeList and convert it to array with spread operator and find the index of current card
        ...document.querySelectorAll(".todos .card"),
      ].indexOf(currentCard);
      //give the index of deleted task to removeTodo function to remove it from localStorage.
      removeTodo(indexOfCurrentCard);
      //display the left items
      currentCard.addEventListener("animationend", () => {
        //we need a dely so we add setTimeout function=>setTimeout(arrow function,time mili second).
        setTimeout(() => {
          //affter fall  a task dont dispalay but it is still in the DOM,we remove it with "remove()" method from DOM.
          currentCard.remove();
          ItemsLeft.textContent = document.querySelectorAll(
            ".todos .card:not(.checked)"
          ).length;
        }, 100);
      });
    });

    //Set Element by Parent Child--------------------------------------------------------------

    clearBtn.appendChild(img);
    cbContainer.appendChild(cbInput);
    cbContainer.appendChild(checkSpan);
    card.appendChild(cbContainer);
    card.appendChild(item);
    card.appendChild(clearBtn);

    document.querySelector(".todos").appendChild(card);
  });
  //we copy the code of displaying left items here to display the correct number of left items when we reload the page.
  ItemsLeft.textContent = document.querySelectorAll(
    //all cards that don't have 'checked' class but amount of them with ".length" .
    ".todos .card:not(.checked)"
  ).length;
}
// start of removeTodo function --------------------------------
function removeTodo(index) {
  const todos = JSON.parse(localStorage.getItem("todos"));
  todos.splice(index, 1);
  localStorage.setItem("todos", JSON.stringify(todos));
}
// start of removeMultipleTodos
function removeMultipleTodos(indexes) {
  var todos = JSON.parse(localStorage.getItem("todos"));
  todos = todos.filter((todo, index) => {
    return !indexes.includes(index);
  });
  localStorage.setItem("todos", JSON.stringify(todos));
}
// start of stateTodo function --------------------------------
function stateTodo(index, isComplete) {
  const todos = JSON.parse(localStorage.getItem("todos"));
  todos[index].isCompleted = isComplete;
  localStorage.setItem("todos", JSON.stringify(todos));
}
document.addEventListener("DOMContentLoaded", main);
