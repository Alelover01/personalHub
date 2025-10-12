
//---TODO---
const todayKey = new Date().toISOString().split("T")[0];
const lastKey = localStorage.getItem("lastTodoDate");
let todoItems = [];

document.getElementById("add-todo-btn").addEventListener("click", ()=>{
  const input  = document.getElementById("todo-input");
  const text = input.value.trim();
  if (!text) return;

  todoItems.push({text, done: false});
  input.value= "";
  saveTodos();
  renderTodoList();
});

function renderTodoList(){
  const list = document.getElementById("todo-list");
  list.innerHTML="";

  todoItems.forEach((item,index)=>{
    const li = document.createElement("li");
    li.className = item.done ? "done" : "";
    li.textContent = item.text;

    li.addEventListener("click", ()=>{
      item.done = !item.done;
      saveTodos();
      renderTodoList();
    });

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "🗑️";
    removeBtn.className = "remove-btn";
    removeBtn.onclick = ()=>{
      todoItems.splice(index,1);
      saveTodos();
      renderTodoList();
    };

    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}
function loadTodos(){
  if(lastKey !== todayKey){
    showNewDayMessage();
    localStorage.setItem("lastTodoDate", todayKey);
  }

  const saved = localStorage.getItem("todos-" + todayKey);
  todoItems = saved ? JSON.parse(saved) : [];
  renderTodoList();
}
function saveTodos(){
  localStorage.setItem("todos-" + todayKey, JSON.stringify(todoItems));
}
function showNewDayMessage(){
  const msg= document.createElement("div");
  msg.textContent = "🌞 Nuova giornata, nuova lista!";
  msg.className = "new-day-banner";
  document.querySelector(".agenda").prepend(msg);

  setTimeout(()=>{
    msg.remove();
  }, 4000);
}

loadTodos();